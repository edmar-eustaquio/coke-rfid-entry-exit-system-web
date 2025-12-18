<?php

namespace App\Http\Controllers;

use App\Domains\Antenna\Repositories\AntennaRepository;
use App\Domains\Reader\Repositories\ReaderRepository;
use App\Domains\ScanHistory\Repositories\HistoryRepository;
use App\Domains\ScanHistory\Services\HistoryService;
use App\Domains\Truck\Repositories\TruckRepository;
use App\Http\Requests\ScanHistory\HistoryRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class HistoryController extends Controller
{
    function __construct(private HistoryService $historyService)
    {
    }

    function getStatus($location, $code, $station){
        // return response("0");
        if (Cache::get("saved:$location-$code-$station")) return response("2");
        if (Cache::get("read:$location-$code-$station")) return response("1");
        return response("0");
    }

    function getStatusById($arduinoId){
        // return response("0");
        if (Cache::get("saved:$arduinoId")) return response("2");
        if (Cache::get("read:$arduinoId")) return response("1");
        return response("0");
    }

    function storeFromReaderBySerial(
        $serial, 
        Request $req, 
        TruckRepository $truckRepo, 
        ReaderRepository $readerRepo, 
        AntennaRepository $antennaRepo,
        HistoryRepository $historyRepository
    ) {
        $validated = validator($req->post(), [
            '*.data.idHex' => 'required',
            '*.data.antenna' => 'required|integer',
        ])->validate();

        $this->historyService->storeFromReaderBySerial($serial, $validated, $truckRepo, $readerRepo, $antennaRepo, $historyRepository);
    }

    function storeFromReader($location, $code, $station, Request $req, TruckRepository $truckRepo, HistoryRepository $historyRepository)
    {
        $validated = validator($req->post(), [
            '*.data.idHex' => 'required',
            '*.data.antenna' => 'required|integer',
        ])->validate();

        $this->historyService->storeFromReader(
            $req['in_antennas'] ?? [1,2], 
            $location, 
            $code, 
            $station, 
            $validated, 
            $truckRepo,
            $historyRepository
        );
    }

    function storeFromAndroidReader($location, $code, $station, $type, Request $req, TruckRepository $truckRepo)
    {
        $validated = $req->validate([
            'data' => 'required|array',
        ]);
        
        return response(
            $this->historyService->storeFromAndroidReader($location, $code, $station, $type, $validated['data'], $truckRepo)
        );
    }


    function index() {
        return inertia('History/Index', [
            'LOCATIONS' => config('locations')
        ]);
    }

    function all(Request $req):Response {
        return response($this->historyService->all($req));
    }

    function create(HistoryRequest $req) {
        $this->historyService->create($req->validated());
        return response(null, 201);
    }

    public function export(Request $req)
    {
        return $this->historyService->export($req);
    }

}
