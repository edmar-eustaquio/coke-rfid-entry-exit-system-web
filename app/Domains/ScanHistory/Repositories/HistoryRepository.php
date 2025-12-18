<?php

namespace App\Domains\ScanHistory\Repositories;

interface HistoryRepository {
    function all($req);
    function allWithTruck($req);
    function getForDashboard($req);
    function getForDashboardTotal($req);
    function find($id);
    function create(array $data);
    function insert(array $data);
    function updateOutById($id, $date, $time, $station);
}
