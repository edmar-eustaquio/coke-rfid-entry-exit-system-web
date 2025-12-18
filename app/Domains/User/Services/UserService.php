<?php

namespace App\Domains\User\Services;

use App\Domains\User\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class UserService{
    function __construct(private UserRepository $repo)
    {
    }

    function all($req){
        return $this->repo->all($req);
    }
    function create($data){
        return $this->repo->create($data);
    }

    function update($id, $data){
        return $this->repo->update($id, $data);
    }

    function updatePassword($id, $password){
        $hashedPassword = Hash::make($password);
        $this->repo->updatePassword($id, $hashedPassword);
    }

    function delete($id){
        return $this->repo->delete($id);
    }

}