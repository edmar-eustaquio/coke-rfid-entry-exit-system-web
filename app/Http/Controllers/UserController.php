<?php

namespace App\Http\Controllers;

use App\Domains\User\Services\UserService;
use App\Http\Requests\User\UserRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    function __construct(private UserService $userService)
    {
        abort_if(auth()->user()->role !== 'Admin', 404);
    }

    function index(){
        return inertia("User/Index", [
            'LOCATIONS' => config('locations')
        ]);
    }

    function all(Request $req):Response {
        return response($this->userService->all($req));
    }

    function create(UserRequest $req) {
        $this->userService->create($req->validated());
        return response(null, 201);
    }

    function update($id, Request $req):Response {
        $validated = $req->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$id,
            'role' => 'required|string',
            'branch' => 'required|string',
        ]);
        $this->userService->update($id, $validated);
        return response()->noContent();
    }

    function updatePassword($id, Request $req):Response {
        $validated = $req->validate([
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);
        $this->userService->updatePassword($id, $validated['password']);
        return response()->noContent();
    }

    function delete($id) :Response {
        $this->userService->delete($id);
        return response()->noContent();
    }
}
