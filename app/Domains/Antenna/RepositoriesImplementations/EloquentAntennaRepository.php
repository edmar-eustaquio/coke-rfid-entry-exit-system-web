<?php

namespace App\Domains\Antenna\RepositoriesImplementations;

use App\Domains\Antenna\Models\Antenna;
use App\Domains\Antenna\Repositories\AntennaRepository;

class EloquentAntennaRepository implements AntennaRepository {

    public function __construct(private Antenna $model) {
    }

    public function find($id) {
        return $this->model->findOrFail($id);
    }

    public function getByReader($readerId)
    {
        return $this->model->where('reader_id', $readerId)->get();
    }

    public function findByReaderAndPort($readerId, $port)
    {
        return $this->model->where('reader_id', $readerId)->where('port', $port)->first();
    }

    public function insert(array $data) {
        $this->model->insert($data);
    }

    public function update($id, array $data) {
        $antenna = $this->find($id);
        $antenna->update($data);
        return $antenna;
    }

    public function delete($id) {
        $antenna = $this->find($id);
        return $antenna->delete();
    }
}
