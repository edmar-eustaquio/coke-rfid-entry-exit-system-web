<?php

namespace App\Http\Controllers;

use App\Domains\Truck\Services\TruckService;
use App\Http\Requests\Truck\TruckRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TruckController
{
    function __construct(private TruckService $truckService)
    {
    }

    function index() {
        return inertia('Truck/Index', [
            'LOCATIONS' => config('locations')
        ]);
    }

    function all(Request $req):Response {
        return response($this->truckService->all($req));
    }

    function upload(Request $req) {
        $req->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:2048',
        ]);

        $this->truckService->upload($req->file('file'));
        return response(null, 201);
    }

    function create(TruckRequest $req) {
        $this->truckService->create($req->validated());
        return response(null, 201);
    }

    function update($id, TruckRequest $req):Response {
        $this->truckService->update($id, $req->validated());
        return response()->noContent();
    }

    function delete($id) :Response {
        $this->truckService->delete($id);
        return response()->noContent();
    }

    public function export(Request $req)
    {
        return $this->truckService->export($req);
    }
}
