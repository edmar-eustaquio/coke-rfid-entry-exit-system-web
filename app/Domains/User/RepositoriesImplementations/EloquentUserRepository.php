<?php

namespace App\Domains\User\RepositoriesImplementations;

use App\Domains\User\Repositories\UserRepository;
use App\Models\User;

class EloquentUserRepository implements UserRepository {

    public function __construct(private User $model) {
    }

    public function all($req) {
        return $this->model
            ->where(function ($q) use($req){
                if (!$req['search']) return;
                
                $search = "%" . $req['search'] . "%";
                $q
                    ->where('name', 'like', $search)
                    ->orWhere('role', 'like', $search)
                    ->orWhere('branch', 'like', $search)
                    ->orWhere('email', 'like', $search);
            })
            ->where('id', '!=', auth()->user()?->id)
            ->paginate($req['page_size'] ?? 10);
    }

    public function find($id) {
        return $this->model->findOrFail($id);
    }

    public function create(array $data) {
        return $this->model->create($data);
    }

    public function update($id, array $data) {
        $user = $this->find($id);
        $user->update($data);
        return $user;
    }

    public function updatePassword($id, $password)
    {
        $user = $this->find($id);
        $user->update(['password' => $password]);
    }

    public function delete($id) {
        $user = $this->find($id);
        return $user->delete();
    }
}
