<?php

namespace App\Domains\Reader\RepositoriesImplementations;

use App\Domains\Reader\Models\Reader;
use App\Domains\Reader\Repositories\ReaderRepository;

class EloquentReaderRepository implements ReaderRepository {

    public function __construct(private Reader $model) {
    }

    private function allQuery($q, $req){
        if (!$req['search']) return;

        $search = '%' . $req['search'] . '%';
        $q->where('serial_no', "LIKE", $search)
            ->orWhere('arduino_id', "LIKE", $search)
            ->orWhere('location', "LIKE", $search)
            ->orWhere('location_code', "LIKE", $search);
    }

    public function all($req) {
        return $this->model
            ->where(function ($q) use($req){
                $this->allQuery($q, $req);
            })
            ->paginate($req['page_size'] ?? 10);
    }

    public function find($id) {
        return $this->model->findOrFail($id);
    }

    public function findBySerialNo($serialNo)
    {
        return $this->model->where('serial_no', $serialNo)->first();
    }

    public function insert(array $data) {
        $this->model->insert($data);
    }

    public function update($id, array $data) {
        $reader = $this->find($id);
        $reader->update($data);
        return $reader;
    }

    public function delete($id) {
        $reader = $this->find($id);
        return $reader->delete();
    }
}
