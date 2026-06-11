<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'body'           => $this->body,
            'image'          => $this->image ? '/storage/' . $this->image : null,
            'visibility'     => $this->visibility,
            'author'         => new UserResource($this->whenLoaded('user')),
            'likes_count'    => $this->likes_count ?? 0,
            'liked_by_me'    => (bool) ($this->liked_by_me ?? false),
            'comments_count' => $this->comments_count ?? 0,
            'created_at'     => $this->created_at->diffForHumans(),
            'created_at_iso' => $this->created_at->toISOString(),
        ];
    }
}
