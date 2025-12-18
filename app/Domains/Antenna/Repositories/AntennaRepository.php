<?php

namespace App\Domains\Antenna\Repositories;

interface AntennaRepository {
    function find($id);
    function getByReader($readerId);
    function findByReaderAndPort($readerId, $port);
    function insert(array $data);
    function update($id, array $data);
    function delete($id);
}
