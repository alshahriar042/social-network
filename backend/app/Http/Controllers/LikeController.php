<?php

namespace App\Http\Controllers;

use App\Http\Resources\LikeResource;
use App\Models\Comment;
use App\Models\Post;
use App\Services\LikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LikeController extends Controller
{
    public function __construct(private LikeService $likeService) {}

    public function togglePost(Post $post): JsonResponse
    {
        $result = $this->likeService->toggle($post, auth('api')->user());

        return response()->json($result);
    }

    public function toggleComment(Comment $comment): JsonResponse
    {
        $result = $this->likeService->toggle($comment, auth('api')->user());

        return response()->json($result);
    }

    public function postLikers(Post $post): AnonymousResourceCollection
    {
        $likes = $this->likeService->getLikers($post);

        return LikeResource::collection($likes);
    }

    public function commentLikers(Comment $comment): AnonymousResourceCollection
    {
        $likes = $this->likeService->getLikers($comment);

        return LikeResource::collection($likes);
    }
}
