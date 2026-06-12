<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function __construct(private PostService $postService) {}

    public function index(): AnonymousResourceCollection
    {
        $posts = $this->postService->getFeed(auth('api')->user());

        return PostResource::collection($posts);
    }

    public function store(CreatePostRequest $request): JsonResponse
    {
        $post = $this->postService->create($request->validated(), auth('api')->user());

        $post->load('user');

        return response()->json(new PostResource($post), 201);
    }

    public function destroy(Post $post): JsonResponse
    {
        if ($post->user_id !== auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->postService->delete($post);

        return response()->json(['message' => 'Post deleted.']);
    }
}
