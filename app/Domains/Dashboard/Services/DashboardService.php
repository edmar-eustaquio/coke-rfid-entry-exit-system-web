<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\ScanHistory\Repositories\HistoryRepository;
use Carbon\Carbon;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardService {
    private function getDuration($inDate, $inTime, $outDate, $outTime){
        $start = Carbon::parse("$inDate $inTime");
        $end   = Carbon::parse("$outDate $outTime");

        $diffInMinutes = $start->diffInMinutes($end);

        $hours = floor($diffInMinutes / 60);
        $minutes = $diffInMinutes % 60;

        $duration = sprintf('%d:%02d', $hours, $minutes);

        return $duration;
    }

    private function buildHistoryRecord($history)
    {
        return [
            "in"              => Carbon::parse($history->time_scan)->format('g:i A'),
            "out"             => Carbon::parse($history->out_time_scan)->format('g:i A'),
            "date"            => Carbon::parse($history->date_scan)->format('m/j/y'),
            "station"         => $history->station,
            "current_station" => $history->current_station ?? $history->station,
            "plate_no"        => $history->truck->plate_no,
            "ownership"       => $history->truck->provider,
            "location"        => $history->location,
            "capacity"        => $history->truck->capacity,
            "location_source" => $history->truck->location,
        ];
    }
    
    function get($req, HistoryRepository $repo){
        if (!$req['location_codes']) return [0, []];
        
        $histories = $repo->getForDashboard($req);
        $date = date('Y-m-d');
        $time = date('H:i:s');
        return [
            $repo->getForDashboardTotal($req),
            $histories->map(function ($history) use($date, $time) {
                $duration = null;

                if ($history->entry_or_exit_site != 'Exit') {
                    $history->out_date_scan = null;
                    $history->out_time_scan = null;
                    $duration = $this->getDuration(
                        $history->date_scan,
                        $history->time_scan,
                        $date,
                        $time
                    );
                } else{
                    $duration = $this->getDuration(
                        $history->date_scan,
                        $history->time_scan,
                        $history->out_date_scan,
                        $history->out_time_scan
                    );
                }

                return [
                    "in"              => Carbon::parse($history->time_scan)->format('g:i A'),
                    "out"             => $history->out_time_scan ? Carbon::parse($history->out_time_scan)->format('g:i A') : null,
                    "date"            => Carbon::parse($history->date_scan)->format('m/j/y'),
                    "station"         => $history->station,
                    'duration'        => $duration,
                    "current_station" => $history->current_station ?? $history->station,
                    "plate_no"        => $history->truck->plate_no,
                    "ownership"       => $history->truck->provider,
                    "location"        => $history->location,
                    "capacity"        => $history->truck->capacity,
                    "location_source" => $history->truck->location,
                    "entry_error" => $history->entry_error,
                    "exit_error" => $history->exit_error,
                ];
            })
        ];
        
        // $data = [];
        // $temp = [];

        // foreach ($histories as $history) {
        //     $truckId = $history->truck_id;
        //     $currentStation = $history->station;

        //     if (isset($temp[$truckId])){
        //         if (($temp[$truckId]['location'] ?? null) !== $history->location) {
        //             $data[] = $temp[$truckId];
        //             $temp[$truckId] = $this->buildHistoryRecord($history);
        //             continue;
        //         }

        //         if (($temp[$truckId]['station'] ?? null) === $currentStation) continue;
        //     }

        //     if (isset($temp[$truckId])) {
        //         $prev = $temp[$truckId];
        //         $duration = $this->getDuration(
        //             $prev["date"],
        //             $prev["in"],
        //             $history->date_scan,
        //             $history->time_scan
        //         );

        //         $prev["out"] = Carbon::parse($history->time_scan)->format('g:i A');
        //         $prev["current_station"] = $currentStation;
        //         $prev["duration"] = $duration;

        //         $data[] = $prev;
                
        //         if ($currentStation === "Outside") {
        //             unset($temp[$truckId]);
        //             continue;
        //         }
        //     }

        //     $temp[$truckId] = $this->buildHistoryRecord($history);
        // }

        // $data = array_merge($data, $temp);
        // usort($data, function ($a, $b) {
        //     $dateTimeA = $a['date'] . ' ' . $a['in'];
        //     $dateTimeB = $b['date'] . ' ' . $b['in'];

        //     return strtotime($dateTimeB) <=> strtotime($dateTimeA); // DESC
        // });

        // return array_slice($data, 0, $req['page_size'] ?? 20);
    }

    
    function export($req, HistoryRepository $repo){
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('A1', 'Date');
        $sheet->setCellValue('B1', 'Plate No');
        $sheet->setCellValue('C1', 'Ownership');
        $sheet->setCellValue('D1', 'Location');
        $sheet->setCellValue('E1', 'Pallet Capacity');
        $sheet->setCellValue('F1', 'Truck Source');
        $sheet->setCellValue('G1', 'Station');
        $sheet->setCellValue('H1', 'In');
        $sheet->setCellValue('I1', 'Out');
        $sheet->setCellValue('J1', 'Duration');
        $sheet->setCellValue('K1', 'Current Station');
        $sheet->setCellValue('L1', 'Error');

        $data = $repo->getForDashboardExport($req);
        
        $row = 2;
        foreach ($data as $item) {
            $duration = $item->out_time_scan ? $this->getDuration(
                    $item->date_scan,
                    $item->time_scan,
                    $item->out_date_scan,
                    $item->out_time_scan
                ) : '-';

            $sheet->setCellValue("A$row", Carbon::parse($item->date_scan)->format('m/j/y'));
            $sheet->setCellValue("B$row", $item->truck->plate_no);
            $sheet->setCellValue("C$row", $item->truck->provider);
            $sheet->setCellValue("D$row", $item->location);
            $sheet->setCellValue("E$row", $item->truck->capacity);
            $sheet->setCellValue("F$row", $item->truck->location);
            $sheet->setCellValue("G$row", $item->station);
            $sheet->setCellValue("H$row", Carbon::parse($item->time_scan)->format('g:i A'));
            $sheet->setCellValue("I$row", $item->out_time_scan ? Carbon::parse($item->out_time_scan)->format('g:i A') : '-');
            $sheet->setCellValue("J$row", $duration);
            $sheet->setCellValue("K$row", $item->current_station ?? $item->station);
            $sheet->setCellValue("L$row", $item->entry_error ?? $item->exit_error ?? '-');
            $row++;
        }

        $writer = new Xlsx($spreadsheet);

        // Stream response to download
        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment;filename="dashboard-report.xlsx"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }

}