<?php

namespace App\Domains\ScanHistory\Services;

use App\Domains\Antenna\Repositories\AntennaRepository;
use App\Domains\Reader\Repositories\ReaderRepository;
use App\Domains\ScanHistory\Repositories\HistoryRepository;
use App\Domains\Truck\Repositories\TruckRepository;
use App\Infrastracture\ThirdParty\PowerBI\PowerBIService;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HistoryService {
    function __construct(private HistoryRepository $repo)
    {
    }

    function storeFromAndroidReader(
        $location, 
        $code, 
        $station, 
        $type, 
        $req, 
        TruckRepository $truckRepo, 
        HistoryRepository $historyRepository
    ) : array {
        Cache::put("read:$location-$code-$station", true, now()->addSeconds(10));

        // info($req->all()); return;

        $rfids  = [];

        $RFID_START_VALUE = strtolower(env("RFID_START_VALUE", "c0ca"));
        $READER_SAVE_INTERVAL = (int) env("READER_SAVE_INTERVAL");

        foreach ($req as $c) {
            $rfid = strtolower(trim($c));

            if (in_array($rfid, $rfids)) continue;
            if (!str_starts_with($rfid, $RFID_START_VALUE)) continue;

            $cacheKey = "rfid:$rfid";
            if (Cache::has($cacheKey)) continue;

            Cache::put($cacheKey, true, now()->addMinutes($READER_SAVE_INTERVAL));
            $rfids[] = $rfid;
        }
        if (empty($rfids)) return [];

        $data = [];
        $dataForPowerBI = [];
        $responseData = [];

        $trucks = $truckRepo->getWhereInRfidAndDoesntExistsInLast($type, $code, $station, $rfids);
        // $trucks = $truckRepo->getWhereInRfid($rfids);
        
        if ($trucks->isEmpty()) return [];

        $loccode = (int) $code;
        $date = date('Y-m-d');
        $time = date('h:i:s A');
        $now  = now();

        foreach ($trucks as $truck) {
            $dataForPowerBI[] = [
                "Vehicle ID" => (int)$truck->vehicle_id,
                "Plate Number" =>  $truck->plate_no,
                "Variable Capacity" =>  $truck->capacity,
                "Service Agent" => $truck->agent,
                "Transport Planning Point" => (int)$truck->location_code,
                "Truck Source Location"  =>  $truck->location,
                "Service Provider" =>  $truck->provider,
                "Date" =>  $date,
                "Time" =>  $time,
                "Type" => $type,
                "RFID Location" => $loccode,
                "RFID Location Name" =>  $location,
                "Station" => $station
            ];

            /*** OLD */
            // $data[] = [
            //     'location' => $location,
            //     'location_code' => $code,
            //     'station' => $station,
            //     'truck_id' => $truck->id,
            //     'type'       => $type,
            //     'date_scan'  => $now,
            //     'time_scan'  => $now,
            // ];
            // $responseData[] = [
            //     'rfid' => $truck->rfid,
            //     'plate_no' => $truck->plate_no,
            //     'vehicle_id' => $truck->vehicle_id,
            // ];
            /****/

            /** NEWER VERSION FOR EASY DASHBOARD **/
            if ($station !== 'Exit') {
                $data[] = [
                    'location' => $location,
                    'location_code' => $code,
                    'station' => $station,
                    'truck_id' => $truck->id,
                    'type'       => $type,
                    'date_scan'  => $now,
                    'time_scan'  => $now,
                ];
                $responseData[] = [
                    'rfid' => $truck->rfid,
                    'plate_no' => $truck->plate_no,
                    'vehicle_id' => $truck->vehicle_id,
                ];
            }

            if (
                !$truck->latestHistory 
                || $truck->latestHistory->out_date_scan 
                || $truck->latestHistory->station == 'Exit'
                || $truck->latestHistory->location_code != $code
            ) continue;

            $historyRepository->updateOutById($truck->latestHistory->id, $now, $now, $station);
            /*************/
        }

        Cache::put("saved:$location-$code-$station", true, now()->addSeconds(10));
        $this->repo->insert($data);
        // PowerBIService::sendData($dataForPowerBI);

        return $responseData;
    }

    function storeFromReader($inAntennas, $location, $code, $station, $req, TruckRepository $truckRepo, HistoryRepository $historyRepository)
    {
        Cache::put("read:$location-$code-$station", true, now()->addSeconds(10));

        // info($req->all()); return;

        $in  = [];
        $out = [];

        $RFID_START_VALUE = strtolower(env("RFID_START_VALUE", "c0ca"));
        $READER_SAVE_INTERVAL = (int) env("READER_SAVE_INTERVAL");

        foreach ($req as $c) {
            $rfid = strtolower(trim($c['data']['idHex']));

            if (!str_starts_with($rfid, $RFID_START_VALUE)) continue;

            $cacheKey = "rfid:$rfid";
            if (Cache::has($cacheKey)) continue;

            Cache::put($cacheKey, true, now()->addMinutes($READER_SAVE_INTERVAL));
            
            if (in_array($c['data']['antenna'], $inAntennas)) {
                $in[] = $rfid;
            } else {
                $out[] = $rfid;
            }
        }

        $data = [];
        $dataForPowerBI = [];

        $this->validateRfidAndAddToInsert(
            $location, 
            $code, 
            $station, 
            $data, 
            $dataForPowerBI, 
            $in, 
            'in', 
            $truckRepo,
            $historyRepository
        );
        $this->validateRfidAndAddToInsert(
            $location, 
            $code, 
            $station, 
            $data, 
            $dataForPowerBI, 
            $out, 
            'out', 
            $truckRepo,
            $historyRepository
        );

        if (empty($data)) return;

        Cache::put("saved:$location-$code-$station", true, now()->addSeconds(10));
        $this->repo->insert($data);
        // PowerBIService::sendData($dataForPowerBI);
    }
    
    function storeFromReaderBySerial(
        $serial, 
        $req, 
        TruckRepository $truckRepo, 
        ReaderRepository $readerRepo, 
        AntennaRepository $antennaRepo, 
        HistoryRepository $historyRepository
    ) {
        $reader = $readerRepo->findBySerialNo($serial);
        if (!$reader) return;
        
        Cache::put("read:" . $reader->arduino_id, true, now()->addSeconds(10));

        $antennas = $antennaRepo->getByReader($reader->id);
        if (!$antennas || $antennas->isEmpty()) return;
        
        $antennaIndex = [];
        foreach ($antennas->toArray() as $a)
            $antennaIndex[$a["port"]] = $a;

        $RFID_START_VALUE = strtolower(env('RFID_START_VALUE', 'c0ca'));
        $READER_SAVE_INTERVAL = (int) env('READER_SAVE_INTERVAL');

        $rfidsByPort = [];
        $rfids = [];
        foreach ($req as $c) {

            $rfid = strtolower(trim($c['data']['idHex'] ?? ''));
            if ($rfid === '' || !str_starts_with($rfid, $RFID_START_VALUE)) continue;

            if (in_array($rfid, $rfids)) continue;
            $rfids[] = $rfid;

            // $cacheKey = "rfid:$rfid";
            // if (Cache::has($cacheKey)) continue;

            // Cache::put($cacheKey, true, now()->addMinutes($READER_SAVE_INTERVAL));

            $port = $c['data']['antenna'] ?? null;
            if ($port === null || !array_key_exists($port, $antennaIndex)) continue;

            $rfidsByPort[$port][] = $rfid;
        }
        if (!$rfidsByPort) return;
        
        $now = now();
        $date = $now->format('Y-m-d');
        $time = $now->format('h:i:s A');

        $insertData = [];

        foreach ($rfidsByPort as $port => $rfidValues) {
            if (!isset($antennaIndex[$port])) continue;

            $antenna = $antennaIndex[$port];
            $trucks = $truckRepo->getWhereInRfidAndDoesntExistsInLast(
                'in',
                $reader->location_code,
                $antenna["station"],
                $rfidValues
            );
            if ($trucks->isEmpty()) continue;

            foreach ($trucks as $truck) {
                if ($truck->latestHistory && $antenna['entry_or_exit_site'] != 'Entry' && $truck->latestHistory->entry_or_exit_site == 'Exit') {
                    $insertData[] = [
                        'location'       => $reader->location,
                        'location_code'  => $reader->location_code,
                        'station'        => $antenna["station"],
                        'truck_id'       => $truck->id,
                        'type'           => 'in',
                        'date_scan'      => $now,
                        'time_scan'      => $now,
                        'out_date_scan'      => $now,
                        'out_time_scan'      => $now,
                        'current_station'    => $antenna["station"],
                        'entry_or_exit_site' => 'Entry',
                        'entry_error' => 'No entry record found',
                    ];
                }
                
                if ($antenna["station"] !== 'Exit') {
                    $insertData[] = [
                        'location'       => $reader->location,
                        'location_code'  => $reader->location_code,
                        'station'        => $antenna["station"],
                        'truck_id'       => $truck->id,
                        'type'           => 'in',
                        'date_scan'      => $now,
                        'time_scan'      => $now,
                        'out_date_scan'      => null,
                        'out_time_scan'      => null,
                        'current_station'    => null,
                        'entry_or_exit_site' => $antenna['entry_or_exit_site'],
                        'entry_error' => null,
                    ];
                }

                if (
                    !$truck->latestHistory 
                    || $truck->latestHistory->out_date_scan 
                    || $truck->latestHistory->station == 'Exit'
                    || $truck->latestHistory->location_code != $reader->location_code
                ) continue;

                $historyRepository->updateOutById(
                    $truck->latestHistory->id, 
                    $now, 
                    $now, 
                    $antenna["station"],
                    $antenna['entry_or_exit_site'] == 'Entry' && $truck->latestHistory->entry_or_exit_site != 'Exit' 
                        ? 'No exit record found' 
                        : null
                );
            }
        }

        if (empty($insertData)) return;
        
        Cache::put("saved:" . $reader->arduino_id, true, now()->addSeconds(10));

        $this->repo->insert($insertData);

        // PowerBIService::sendData($powerBIData);
    }


    private function validateRfidAndAddToInsert(
        string $location, 
        string $code, 
        string $station, 
        array &$data, 
        array &$dataForPowerBI, 
        array $rfids, 
        string $type, 
        TruckRepository $truckRepo,
        HistoryRepository $historyRepository
    ): void {
        if (empty($rfids)) return;
        
        $trucks = $truckRepo->getWhereInRfidAndDoesntExistsInLast($type, $code, $station, $rfids);
        // $trucks = $truckRepo->getWhereInRfid($rfids);

        $loccode = (int) $code;
        $date = date('Y-m-d');
        $time = date('h:i:s A');
        $now  = now();

        foreach ($trucks as $truck) {
            $dataForPowerBI[] = [
                "Vehicle ID" => (int)$truck->vehicle_id,
                "Plate Number" =>  $truck->plate_no,
                "Variable Capacity" =>  $truck->capacity,
                "Service Agent" => $truck->agent,
                "Transport Planning Point" => (int)$truck->location_code,
                "Truck Source Location"  =>  $truck->location,
                "Service Provider" =>  $truck->provider,
                "Date" =>  $date,
                "Time" =>  $time,
                "Type" => $type,
                "RFID Location" => $loccode,
                "RFID Location Name" =>  $location,
                "Station" => $station
            ];
            
            /***  OLD  ***/
            // $data[] = [
            //     'location' => $location,
            //     'location_code' => $code,
            //     'station' => $station,
            //     'truck_id' => $truck->id,
            //     'type'       => $type,
            //     'date_scan'  => $now,
            //     'time_scan'  => $now,
            // ];
            /*************/
            
            /** NEWER VERSION FOR EASY DASHBOARD **/
            if ($station !== 'Exit') {
                $data[] = [
                    'location' => $location,
                    'location_code' => $code,
                    'station' => $station,
                    'truck_id' => $truck->id,
                    'type'       => $type,
                    'date_scan'  => $now,
                    'time_scan'  => $now,
                ];
            }

            if (
                !$truck->latestHistory 
                || $truck->latestHistory->out_date_scan 
                || $truck->latestHistory->station == 'Exit'
                || $truck->latestHistory->location_code != $code
            ) continue;

            $historyRepository->updateOutById($truck->latestHistory->id, $now, $now, $station);
            /*************/
        }
    }

    function all($req){
        return $this->repo->all($req);
    }
    function create($data){
        $this->repo->create($data);
    }
    function export($req){
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'Vehicle ID');
        $sheet->setCellValue('B1', 'Plate No');
        $sheet->setCellValue('C1', 'Var Capacity');
        $sheet->setCellValue('D1', 'ServcAgent');
        $sheet->setCellValue('E1', 'Tppt');
        $sheet->setCellValue('F1', 'Location Name');
        $sheet->setCellValue('G1', 'SvcPrvdr');
        $sheet->setCellValue('H1', 'Date');
        $sheet->setCellValue('I1', 'Time');
        $sheet->setCellValue('J1', 'Type');
        $sheet->setCellValue('K1', 'Location');
        $sheet->setCellValue('L1', 'Location Name');
        $sheet->setCellValue('M1', 'Station');

        $data = $this->repo->allWithTruck($req);
        
        $row = 2;
        foreach ($data as $item) {
            $sheet->setCellValue("A$row", $item->truck->vehicle_id);
            $sheet->setCellValue("B$row", $item->truck->plate_no);
            $sheet->setCellValue("C$row", $item->truck->capacity);
            $sheet->setCellValue("D$row", $item->truck->agent);
            $sheet->setCellValue("E$row", $item->truck->location_code);
            $sheet->setCellValue("F$row", $item->truck->location);
            $sheet->setCellValue("G$row", $item->truck->provider);
            $sheet->setCellValue("H$row", $item->date_scan);
            $sheet->setCellValue("I$row", $item->time_scan);
            $sheet->setCellValue("J$row", $item->type);
            $sheet->setCellValue("K$row", $item->location_code);
            $sheet->setCellValue("L$row", $item->location);
            $sheet->setCellValue("M$row", $item->station);
            $row++;
        }

        $writer = new Xlsx($spreadsheet);

        // Stream response to download
        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment;filename="report.xlsx"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }

}