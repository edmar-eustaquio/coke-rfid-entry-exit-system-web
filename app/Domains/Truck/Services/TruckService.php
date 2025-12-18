<?php

namespace App\Domains\Truck\Services;

use App\Domains\Truck\Repositories\TruckRepository;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TruckService {
    function __construct(private TruckRepository $repo)
    {
    }

    function getPerProviderTotal(){
        $total = 0;
        $trucks_total = $this->repo->getPerProviderTotal();
        foreach($trucks_total as $truck)
            $total+= $truck->total;

        return [$total, $trucks_total];
    }

    function getOnsitePerProviderAndPerStationTotal($request){
        if (!$request['location_codes']) return [0, [], []];

        $onsite_total = 0;
        $per_provider = [];
        $per_station = [];
        $trucks = $this->repo->getOnsiteTrucks($request);
        
        foreach($trucks as $truck){
            $station = $truck->latestHistory->current_station ?? $truck->latestHistory->station;

            $onsite_total++;
            if (array_key_exists($truck->provider, $per_provider))
                $per_provider[$truck->provider]++;
            else 
                $per_provider[$truck->provider] = 1;

            if (array_key_exists($station, $per_station))
                $per_station[$station]++;
            else 
                $per_station[$station] = 1;
        }
        return [$onsite_total, $per_provider, $per_station];
    }

    function all($req){
        return $this->repo->all($req);
    }
    function create($data){
        $truck = $this->repo->findByVehicleId($data['vehicle_id']);
        if ($truck){
            $this->repo->update($truck->id, $data);
            return;
        }
        $this->repo->create($data);
    }
    function upload($file){
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        $datas = [];
        $firstRow = true;

        foreach ($rows as $row) {
            if ($firstRow){
                $firstRow = false;
                continue;
            }
            if (empty(array_filter($row)) || count($row) < 8) continue;
            
            $data = [
                'rfid' => $row[0],
                'vehicle_id' => $row[1],
                'plate_no' => $row[2],
                'capacity' => $row[3],
                'agent' => $row[4],
                'location_code' => $row[5],
                'location' => $row[6],
                'provider' => $row[7],
            ];
            
            $truck = $this->repo->findByVehicleId($row[1]);
            if ($truck){
                $truck->update($data);
                continue;
            }

            $datas[] = $data;
        }

        $this->repo->insert($datas);
    }

    function update($id, $data){
        return $this->repo->update($id, $data);
    }

    function delete($id){
        return $this->repo->delete($id);
    }
    function export($req){
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'RFID Value');
        $sheet->setCellValue('B1', 'Vehicle ID');
        $sheet->setCellValue('C1', 'Plate No');
        $sheet->setCellValue('D1', 'Var Capacity');
        $sheet->setCellValue('E1', 'ServcAgent');
        $sheet->setCellValue('F1', 'Tppt');
        $sheet->setCellValue('G1', 'Location Name');
        $sheet->setCellValue('H1', 'SvcPrvdr');

        $data = $this->repo->allForExport($req);
        
        $row = 2;
        foreach ($data as $item) {
            $sheet->setCellValue("A$row", $item->rfid);
            $sheet->setCellValue("B$row", $item->vehicle_id);
            $sheet->setCellValue("C$row", $item->plate_no);
            $sheet->setCellValue("D$row", $item->capacity);
            $sheet->setCellValue("E$row", $item->agent);
            $sheet->setCellValue("F$row", $item->location_code);
            $sheet->setCellValue("G$row", $item->location);
            $sheet->setCellValue("H$row", $item->provider);
            $row++;
        }

        $writer = new Xlsx($spreadsheet);

        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment;filename="trucks-list.xlsx"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }

}