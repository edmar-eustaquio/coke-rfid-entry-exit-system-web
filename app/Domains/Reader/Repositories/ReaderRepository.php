<?php

namespace App\Domains\Reader\Repositories;

interface ReaderRepository {
    function all($req);
    function find($id);
    function findBySerialNo($serialNo);
    function insert(array $data);
    function update($id, array $data);
    function delete($id);
}
