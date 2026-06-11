<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\CreateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommentController extends Controller
{
    public function __construct(private CommentService $commentService) {}

    public function index(Post $post): AnonymousResourceCollection
    {
        $comments = $this->commentService->getForPost($post, auth('api')->user());

        return CommentResource::collection($comments);
    }

    public function store(CreateCommentRequest $request, Post $post): JsonResponse
    {
        $comment = $this->commentService->addComment($post, auth('api')->user(), $request->body);

        $comment->load('user');
        $comment->loadCount('likes');

        return response()->json(new CommentResource($comment), 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        if ($comment->user_id !== auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->commentService->delete($comment);

        return response()->json(['message' => 'Comment deleted.']);
    }
}
