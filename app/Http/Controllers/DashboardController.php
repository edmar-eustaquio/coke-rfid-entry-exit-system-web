<?php

namespace App\Http\Controllers;

use App\Domains\Dashboard\Services\DashboardService;
use App\Domains\ScanHistory\Repositories\HistoryRepository;
use App\Domains\Truck\Services\TruckService;
use Illuminate\Http\Request;

class DashboardController
{

    function index(){
        return inertia('Dashboard', [
            'LOCATIONS' => config('locations'),
            'REFRESH_SECONDS_DURATION' => env('DASHBOARD_REFRESH_SECONDS_DURATION'),
            'LOGISTICS_UNITS' => config('logisticsUnitWithClusters')
        ]);
    }

    function get(Request $request, TruckService $truckService, DashboardService $dashboardService, HistoryRepository $historyRepository){
        [$total, $trucks_total] = $truckService->getPerProviderTotal();
        [$onsite_total, $per_provider, $per_station] = $truckService->getOnsitePerProviderAndPerStationTotal($request);
        [$total_data, $data] = $dashboardService->get($request, $historyRepository);

        return response([
            "data" => $data,
            'total_data' => $total_data,
            "trucks_total" => $trucks_total,
            "trucks_overall_total" => $total,
            "onsite_trucks_total" => $per_provider,
            "onsite_trucks_overall_total" => $onsite_total,
            "onsite_per_station" => $per_station,
        ]);
    }

    

}
