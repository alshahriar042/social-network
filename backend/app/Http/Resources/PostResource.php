<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $disk = Storage::disk(config('filesystems.post_images_disk'));

        return [
            'id'             => $this->id,
            'body'           => $this->body,
            'image'          => $this->image ? $disk->url($this->image) : null,
            'image_thumb'    => $this->image_thumb ? $disk->url($this->image_thumb) : null,
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
