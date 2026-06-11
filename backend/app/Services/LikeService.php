<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class LikeService
{
    public function toggle(Model $likeable, User $user): array
    {
        $existing = $likeable->likes()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            $likeable->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return [
            'liked' => $liked,
            'count' => $likeable->likes()->count(),
        ];
    }

    public function getLikers(Model $likeable): \Illuminate\Database\Eloquent\Collection
    {
        return $likeable->likes()->with('user')->latest('created_at')->get();
    }
}
