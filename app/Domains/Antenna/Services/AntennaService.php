<?php

namespace App\Domains\Antenna\Services;

use App\Domains\Antenna\Repositories\AntennaRepository;
class AntennaService {
    function __construct(private AntennaRepository $repo)
    {
    }

    function getByReader($readerId){
        return $this->repo->getByReader($readerId);
    }

    function insert($data){
        if ($this->repo->findByReaderAndPort($data['reader_id'], $data['port'])) return;
        
        $this->repo->insert($data);
    }

    function update($id, $data){
        return $this->repo->update($id, $data);
    }

    function delete($id){
        return $this->repo->delete($id);
    }

}