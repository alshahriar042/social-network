<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'body',
        'image',
        'image_thumb',
        'image_status',
        'visibility',
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'likes_count'    => 'integer',
        'comments_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->latest();
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }
}
