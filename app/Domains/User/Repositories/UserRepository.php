<?php

namespace App\Domains\User\Repositories;

interface UserRepository {
    function all($req);
    function find($id);
    function create(array $data);
    function update($id, array $data);
    function updatePassword($id, $password);
    function delete($id);
}
