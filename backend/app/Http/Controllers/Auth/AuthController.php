<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user  = $this->authService->register($request->validated());
        $token = auth('api')->login($user);

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $token = $this->authService->attemptLogin($request->validated());

        if (!$token) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        return response()->json([
            'user'  => new UserResource(auth('api')->user()),
            'token' => $token,
        ]);
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(): JsonResponse
    {
        return response()->json(new UserResource(auth('api')->user()));
    }
}
