<?php

namespace App\Http\Controllers;

use App\Domains\Reader\Services\ReaderService;
use App\Http\Requests\ReaderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReaderController
{
    function __construct(private ReaderService $readerService)
    {
        abort_if(auth()->user()->role !== 'Admin', 404);
    }

    function index(){
        return inertia("Reader/Index", [
            'LOCATIONS' => config('locations')
        ]);
    }

    function all(Request $req):Response {
        return response($this->readerService->all($req));
    }

    function create(ReaderRequest $req) {
        $this->readerService->insert($req->validated());
        return response(null, 201);
    }

    function update($id, ReaderRequest $req):Response {
        $this->readerService->update($id, $req->validated());
        return response()->noContent();
    }

    function delete($id) :Response {
        $this->readerService->delete($id);
        return response()->noContent();
    }
}
