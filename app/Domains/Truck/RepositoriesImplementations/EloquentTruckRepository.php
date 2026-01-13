<?php

namespace App\Domains\Truck\RepositoriesImplementations;

use App\Domains\Truck\Models\Truck;
use App\Domains\Truck\Repositories\TruckRepository;
use Illuminate\Support\Facades\DB;

class EloquentTruckRepository implements TruckRepository {

    public function __construct(private Truck $model) {
    }

    private function allQuery($q, $req){
        $user = auth()->user();
        if ($user->role != 'Admin'){
            $q->where('location', $user->branch);
        }
        
        if (!$req['search']) return;

        $search = '%' . $req['search'] . '%';
        $q->where('vehicle_id', "LIKE", $search)
            ->orWhere('vehicle_id', "LIKE", $search)
            ->orWhere('location', "LIKE", $search);
    }

    public function all($req) {
        return $this->model
            ->where(fn ($q) => $this->allQuery($q, $req))
            ->paginate($req['page_size'] ?? 10);
    }

    public function allForExport($req) {
        $page_size = $req['page_size'] ?? 10;
        return $this->model
            ->where(fn ($q) => $this->allQuery($q, $req))
            ->offset($req['page'] ? ($req['page'] -1) * $page_size : 0)
            ->limit($page_size)
            ->get();
    }

    public function find($id) {
        return $this->model->findOrFail($id);
    }

    public function findByVehicleId($vehicleId) {
        return $this->model->where('vehicle_id', $vehicleId)->first();
    }

    public function getWhereInRfid($rfids) {
        return $this->model->whereIn('rfid', $rfids)->get();
    }

    public function getWhereInRfidAndDoesntExistsInLast($type, $location_code, $station, $rfids) {
        return $this->model
            ->with(['latestHistory' => function($q){
                $q->select(
                    'histories.id', 
                    'histories.truck_id', 
                    'out_date_scan', 
                    'station',
                    'histories.location_code',
                    'entry_or_exit_site',
                );
            }])
            ->whereIn('rfid', $rfids)
            ->whereDoesntHave('latestHistory', function ($query) use ($type, $location_code, $station) {
                $query
                    ->where('type', $type)
                    ->where('location_code', $location_code)
                    ->where(function($q) use($station){
                        $q->where(function($q) use($station){
                            $q->whereNull('current_station')
                                ->where('station', $station);
                        })
                        ->orWhere(function($q) use($station){
                            $q->whereNotNull('current_station')
                                ->where('current_station', $station);
                        });
                    });
            })
            ->get();
    }

    function getPerProviderTotal()
    {
        return DB::select("select provider, count(*) as total from trucks group by provider");
    }

    function getOnsiteTrucks($request)
    {
        return $this->model->select('provider', 'id')
            ->with('latestHistory', function($q){
                $q->select(
                    'station', 
                    'current_station', 
                    'histories.truck_id', 
                    'date_scan', 
                    'time_scan', 
                    'histories.location_code'
                );
            })
            ->where(function($q) use($request){
                if ($request['capacity'])
                    $q->where('capacity', $request['capacity']);
                if ($request['plate_no'])
                    $q->where('plate_no', 'LIKE', '%' . $request['plate_no'] . '%');
            })
            ->whereHas('latestHistory', function($q) use($request){
                $q->whereIn('location_code', $request['location_codes'])
                    ->where(function($q){
                        $q->whereNull('current_station')
                            ->orWhere('current_station', '!=', 'Exit');
                    });
                if ($request['date'])
                    $q->where('date_scan', $request['date']);
            })
            ->get();

        // return DB::select("select provider, count(*) as total from trucks where location_code=? group by provider", [$location_code]);
    }

    public function create(array $data) {
        $this->model->create($data);
    }

    public function insert(array $data) {
        $this->model->insert($data);
    }

    public function update($id, array $data) {
        $truck = $this->find($id);
        $truck->update($data);
        return $truck;
    }

    public function delete($id) {
        $truck = $this->find($id);
        return $truck->delete();
    }
}
