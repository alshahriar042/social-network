<?php

namespace App\Services;

use App\Models\Like;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;

class LikeService
{
    public function toggle(Model $likeable, User $user): array
    {
        $existing = $likeable->likes()->where('user_id', $user->id)->first();

        if ($existing) {
            // Use a fresh delete (not $existing->delete()) so we know whether
            // this request actually removed the row — avoids a double
            // decrement if a concurrent request unliked it first.
            if (Like::where('id', $existing->id)->delete()) {
                $likeable->decrement('likes_count');
            }
            $liked = false;
        } else {
            try {
                $likeable->likes()->create(['user_id' => $user->id]);
                $likeable->increment('likes_count');
                $liked = true;
            } catch (QueryException $e) {
                // unique(user_id, likeable_id, likeable_type) was violated by
                // a concurrent request — it's already liked, don't increment again.
                $liked = true;
            }
        }

        return [
            'liked' => $liked,
            'count' => $likeable->likes_count,
        ];
    }

    public function getLikers(Model $likeable, int $perPage = 20): CursorPaginator
    {
        return $likeable->likes()->with('user')->latest('created_at')->cursorPaginate($perPage);
    }
}
