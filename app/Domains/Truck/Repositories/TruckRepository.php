<?php

namespace App\Domains\Truck\Repositories;

interface TruckRepository {
    function all($req);
    function allForExport($req);
    function find($id);
    function findByVehicleId($vehicleId);
    function getWhereInRfid($rfids);
    function getWhereInRfidAndDoesntExistsInLast($type, $location_code, $station, array $rfids);
    function getPerProviderTotal();
    function getOnsiteTrucks($request);
    function create(array $data);
    function insert(array $data);
    function update($id, array $data);
    function delete($id);
}
