<?php

namespace App\Domains\ScanHistory\RepositoriesImplementations;

use App\Domains\ScanHistory\Models\History;
use App\Domains\ScanHistory\Repositories\HistoryRepository;

class EloquentHistoryRepository implements HistoryRepository {

    public function __construct(private History $model) {
    }

    private function buildSearchQuery($q, $req) {
        $user = auth()->user();
        if ($user->role != 'Admin')
            $q->where('location', $user->branch);

        $search = $req['search'];
        if ($req['search']){
            $search = "%$search%";
            $q->whereHas('truck', function($q) use($search){
                $q->where('vehicle_id', "LIKE", $search)
                    ->orWhere('plate_no', "LIKE", $search)
                    ->orWhere('location', "LIKE", $search);
            });
        }
        if ($req['date_from'])
            $q->where('date_scan', '>=', $req['date_from']);
        if ($req['date_until'])
            $q->where('date_scan', '<=', $req['date_until']);
        // if ($req['type'])
        //     $q->where('type', $req['type']);
        if ($req['location_code'])
            $q->where('location_code', $req['location_code']);
        if ($req['station'])
            $q->where('station', $req['station']);
    }

    public function all($req) {
        return $this->model
            ->with('truck:id,vehicle_id,plate_no')
            ->where(fn ($q) => $this->buildSearchQuery($q, $req))
            ->orderByDesc('date_scan')
            ->orderByDesc('time_scan')
            ->paginate($req['page_size'] ?? 10);
    }

    public function allWithTruck($req) {
        $page_size = $req['page_size'] ?? 10;
        return $this->model
            ->with('truck')
            ->where(fn ($q) => $this->buildSearchQuery($q, $req))
            ->offset($req['page'] ? ($req['page'] -1) * $page_size : 0)
            ->limit($page_size)
            ->orderByDesc('date_scan')
            ->orderByDesc('time_scan')
            ->get();
    }

    private function getForDashboardQuery($q, $req){
        $q->where(function($q) use($req){
                if (!empty($req['date'])){
                    $q->where('date_scan', $req['date']);
                }
                if (!empty($req['location_codes'])){
                    $q->whereIn('location_code', $req['location_codes']);
                }
        });

        if (empty($req['plate_no']) && empty($req['capacity'])) return;

        $q->whereHas('truck', function ($q) use($req){
            if (!empty($req['plate_no'])){
                $q->where('plate_no', 'LIKE',  '%' . $req['plate_no'] . '%');
            }
            if (!empty($req['capacity'])){
                $q->where('capacity', $req['capacity']);
            }
        });
    }

    public function getForDashboard($req)
    {
        $page_size = $req['page_size'] ?? 20;

        return $this->model
            ->with('truck')
            ->joinSub(
                // Latest IN per truck
                $this->model
                    ->selectRaw('MAX(id) as id')
                    ->where(fn($q) => $this->getForDashboardQuery($q, $req))
                    ->where('entry_or_exit_site', 'Entry')
                    ->groupBy('truck_id'),
                'latest_in',
                'histories.id',
                '=',
                'latest_in.id'
            )
            ->leftJoinSub(
                // Latest OUT per truck
                $this->model
                    ->selectRaw('truck_id, MAX(id) as out_id')
                    ->where(fn($q) => $this->getForDashboardQuery($q, $req))
                    // ->where('entry_or_exit_site', 'Out')
                    ->groupBy('truck_id'),
                'latest_out',
                'histories.truck_id',
                '=',
                'latest_out.truck_id'
            )
            ->leftJoin('histories as out_h', 'out_h.id', '=', 'latest_out.out_id')
            ->orderByDesc('histories.date_scan')
            ->orderByDesc('histories.time_scan')
            ->offset(($req['page'] ?? 0) * $page_size)
            ->limit($page_size)
            ->get([
                'histories.*',
                'out_h.out_date_scan',
                'out_h.out_time_scan',
                'out_h.entry_or_exit_site',
            ]);
        
        return $this->model
            ->with('truck')
            ->where(fn ($q) => $this->getForDashboardQuery($q, $req))
            ->orderByDesc('date_scan')
            ->orderByDesc('time_scan')
            ->offset(($req['page'] ?? 0) * $page_size)
            ->limit($page_size)
            ->get();
            // ->sortBy([
            //     ['date_scan', 'asc'],  
            //     ['time_scan', 'asc'],
            // ]);
    }
    public function getForDashboardExport($req)
    {
        $page_size = $req['page_size'] ?? 20;
        
        return $this->model
            ->with('truck')
            ->where(fn ($q) => $this->getForDashboardQuery($q, $req))
            ->orderByDesc('date_scan')
            ->orderByDesc('time_scan')
            ->offset(($req['page'] ?? 0) * $page_size)
            ->limit($page_size)
            ->get();
    }
    public function getForDashboardTotal($req)
    {
        return $this->model
            ->where(fn ($q) => $this->getForDashboardQuery($q, $req))
            ->groupBy('truck_id')
            ->count();
    }

    public function find($id) {
        return $this->model->findOrFail($id);
    }

    public function create(array $data) {
        $this->model->create($data);
    }

    public function insert(array $data) {
        $this->model->insert($data);
    }

    function updateOutById($id, $date, $time, $station, $exit_error = null)
    {
        $data = [
                'out_date_scan' => $date,
                'out_time_scan' => $time,
                'current_station' => $station,
                'exit_error' => $exit_error,
        ];
        if ($station === 'Exit'){
            $data['entry_or_exit_site'] = 'Exit';
        }
        $this->model
            ->where('id', $id)
            ->update($data);
    }

}
