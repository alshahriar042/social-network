<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReplyController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->group(function () {
    // Posts
    Route::get('posts', [PostController::class, 'index']);
    Route::post('posts', [PostController::class, 'store']);
    Route::delete('posts/{post}', [PostController::class, 'destroy']);

    // Comments on a post
    Route::get('posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('posts/{post}/comments', [CommentController::class, 'store']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    // Replies on a comment
    Route::post('comments/{comment}/replies', [ReplyController::class, 'store']);
    Route::delete('replies/{reply}', [ReplyController::class, 'destroy']);

    // Likes
    Route::post('posts/{post}/likes', [LikeController::class, 'togglePost']);
    Route::delete('posts/{post}/likes', [LikeController::class, 'togglePost']);
    Route::get('posts/{post}/likes', [LikeController::class, 'postLikers']);

    Route::post('comments/{comment}/likes', [LikeController::class, 'toggleComment']);
    Route::delete('comments/{comment}/likes', [LikeController::class, 'toggleComment']);
    Route::get('comments/{comment}/likes', [LikeController::class, 'commentLikers']);
});
