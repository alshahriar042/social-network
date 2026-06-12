<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CommentService
{
    public function getForPost(Post $post, User $user): Collection
    {
        return Comment::with([
                'user',
                'replies' => fn($q) => $q
                    ->with('user')
                    ->withExists(['likes as liked_by_me' => fn($q) => $q->where('user_id', $user->id)])
                    ->latest(),
            ])
            ->withExists(['likes as liked_by_me' => fn($q) => $q->where('user_id', $user->id)])
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->latest()
            ->get();
    }

    public function addComment(Post $post, User $user, string $body): Comment
    {
        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'body'    => $body,
        ]);

        $post->increment('comments_count');

        return $comment;
    }

    public function addReply(Comment $comment, User $user, string $body): Comment
    {
        return Comment::create([
            'post_id'   => $comment->post_id,
            'user_id'   => $user->id,
            'parent_id' => $comment->id,
            'body'      => $body,
        ]);
    }

    public function delete(Comment $comment): void
    {
        if ($comment->parent_id === null) {
            $comment->post()->decrement('comments_count');
        }

        $comment->delete();
    }
}
