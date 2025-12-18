<?php

namespace App\Domains\Reader\Services;

use App\Domains\Reader\Repositories\ReaderRepository;
class ReaderService {
    function __construct(private ReaderRepository $repo)
    {
    }

    function all($req){
        return $this->repo->all($req);
    }
    function insert($data){
        if ($this->repo->findBySerialNo($data['serial_no'])) return;
        
        $this->repo->insert($data);
    }

    function update($id, $data){
        return $this->repo->update($id, $data);
    }

    function delete($id){
        return $this->repo->delete($id);
    }

}