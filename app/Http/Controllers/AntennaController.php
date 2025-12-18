<?php

namespace App\Http\Controllers;

use App\Domains\Antenna\Services\AntennaService;
use App\Domains\Reader\Repositories\ReaderRepository;
use App\Http\Requests\AntennaRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AntennaController
{
    function __construct(private AntennaService $antennaService)
    {
        abort_if(auth()->user()->role !== 'Admin', 404);
    }

    function index($reader_id, ReaderRepository $readerRepository){
        $reader = $readerRepository->find($reader_id);
        return inertia("Reader/Antenna", [
            'reader' => $reader
        ]);
    }

    function getByReader($readerId):Response {
        return response($this->antennaService->getByReader($readerId));
    }

    function create(AntennaRequest $req) {
        $this->antennaService->insert($req->validated());
        return response(null, 201);
    }

    function update($id, AntennaRequest $req):Response {
        $this->antennaService->update($id, $req->validated());
        return response()->noContent();
    }

    function delete($id) :Response {
        $this->antennaService->delete($id);
        return response()->noContent();
    }
}
