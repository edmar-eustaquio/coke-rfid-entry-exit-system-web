<?php

namespace App\Domains\ScanHistory\Services;

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

    function storeFromAndroidReader($location, $code, $station, $type, $req, TruckRepository $truckRepo) : array
    {
        Cache::put("read:$location-$code-$station", true, now()->addSeconds(10));

        // info($req->all()); return;

        $rfids  = [];
        $RFID_START_VALUE = strtolower(env('RFID_START_VALUE', 'c0ca'));
        $READER_SAVE_INTERVAL = (int) env("READER_SAVE_INTERVAL", "5");

        foreach ($req as $c) {
            $rfid = strtolower(trim($c));

            if ($rfid === '' || !str_starts_with($rfid, $RFID_START_VALUE)) continue;

            $cacheKey = "rfid:$rfid";
            if (Cache::has($cacheKey)) continue;

            Cache::put($cacheKey, true, now()->addMinutes($READER_SAVE_INTERVAL));
            
            // if (in_array($rfid, $rfids)) continue;
            
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

        Cache::put("saved:$location-$code-$station", true, now()->addSeconds(10));
        $this->repo->insert($data);
        PowerBIService::sendData($dataForPowerBI);

        return $responseData;
    }

    function storeFromReader($inAntennas, $location, $code, $station, $req, TruckRepository $truckRepo)
    {
        Cache::put("read:$location-$code-$station", true, now()->addSeconds(10));

        // info($req->all()); return;

        $in  = [];
        $out = [];
        $RFID_START_VALUE = strtolower(env('RFID_START_VALUE', 'c0ca'));
        $READER_SAVE_INTERVAL = (int) env("READER_SAVE_INTERVAL", "5");

        foreach ($req as $c) {
            $rfid = strtolower(trim($c['data']['idHex']));

            if ($rfid === '' || !str_starts_with($rfid, $RFID_START_VALUE)) continue;
            
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

        $this->validateRfidAndAddToInsert($location, $code, $station, $data, $dataForPowerBI, $in, 'in', $truckRepo);
        $this->validateRfidAndAddToInsert($location, $code, $station, $data, $dataForPowerBI, $out, 'out', $truckRepo);

        if (empty($data)) return;

        Cache::put("saved:$location-$code-$station", true, now()->addSeconds(10));
        $this->repo->insert($data);
        PowerBIService::sendData($dataForPowerBI);
    }

    private function validateRfidAndAddToInsert(string $location, string $code, string $station, array &$data, array &$dataForPowerBI, array $rfids, string $type, TruckRepository $truckRepo): void
    {
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