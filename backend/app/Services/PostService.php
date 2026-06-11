<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function getFeed(User $user): LengthAwarePaginator
    {
        return Post::with('user')
            ->withCount(['likes', 'comments'])
            ->withExists(['likes as liked_by_me' => fn($q) => $q->where('user_id', $user->id)])
            ->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                  ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->paginate(15);
    }

    public function create(array $data, User $user): Post
    {
        $imagePath = null;

        if (!empty($data['image']) && $data['image'] instanceof UploadedFile) {
            $imagePath = $data['image']->store('posts', 'public');
        }

        return Post::create([
            'user_id'    => $user->id,
            'body'       => $data['body'] ?? null,
            'image'      => $imagePath,
            'visibility' => $data['visibility'],
        ]);
    }

    public function delete(Post $post): void
    {
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();
    }
}
