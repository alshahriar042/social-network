<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\CreateReplyRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;

class ReplyController extends Controller
{
    public function __construct(private CommentService $commentService) {}

    public function store(CreateReplyRequest $request, Comment $comment): JsonResponse
    {
        $reply = $this->commentService->addReply($comment, auth('api')->user(), $request->body);

        $reply->load('user');
        $reply->loadCount('likes');

        return response()->json(new CommentResource($reply), 201);
    }

    public function destroy(Comment $reply): JsonResponse
    {
        if ($reply->user_id !== auth('api')->id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $this->commentService->delete($reply);

        return response()->json(['message' => 'Reply deleted.']);
    }
}
