<?php

namespace App\Domains\Dashboard\Services;

use App\Domains\ScanHistory\Repositories\HistoryRepository;
use Carbon\Carbon;

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
        return [
            $repo->getForDashboardTotal($req),
            $histories->map(function ($history) {
                $duration = $history->out_time_scan ? $this->getDuration(
                    $history->date_scan,
                    $history->time_scan,
                    $history->out_date_scan,
                    $history->out_time_scan
                ) : null;
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

}