<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): User
    {
        return User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
        ]);
    }

    public function attemptLogin(array $credentials): string|false
    {
        return auth('api')->attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ]);
    }

    public function logout(): void
    {
        auth('api')->logout();
    }

    public function refreshToken(): string
    {
        return auth('api')->refresh();
    }
}
