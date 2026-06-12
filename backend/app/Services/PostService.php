<?php

namespace App\Services;

use App\Jobs\ProcessPostImage;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\Cursor;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class PostService
{
    private const PER_PAGE = 15;

    public function getFeed(User $user): CursorPaginator
    {
        $encoded = request()->query('cursor');
        $cursor = $encoded ? Cursor::fromEncoded($encoded) : null;

        // Only the first page (no cursor yet) is cached — it's the page
        // almost every request hits. A short TTL keeps it from going too
        // stale while avoiding a full query on every feed refresh.
        if ($cursor === null) {
            return Cache::remember("feed:user:{$user->id}:page1", 30, fn () => $this->buildFeedPage($user, null));
        }

        return $this->buildFeedPage($user, $cursor);
    }

    /**
     * `visibility = public OR user_id = me`, ordered + limited, can't use
     * either posts index — MySQL falls back to a full table scan + filesort
     * (confirmed via EXPLAIN at 100k rows: ~175ms). The two halves of that OR
     * are mutually exclusive with `visibility = private`, so querying each
     * half separately lets each hit its own index
     * (posts_visibility_created_at_index / posts_user_id_created_at_index)
     * and merging the two small results is ~150x faster.
     */
    private function buildFeedPage(User $user, ?Cursor $cursor): CursorPaginator
    {
        $perPage = self::PER_PAGE;

        $public = Post::where('visibility', 'public')
            ->orderByDesc('created_at')->orderByDesc('id')
            ->cursorPaginate($perPage + 1, ['*'], 'cursor', $cursor);

        $own = Post::where('visibility', 'private')->where('user_id', $user->id)
            ->orderByDesc('created_at')->orderByDesc('id')
            ->cursorPaginate($perPage + 1, ['*'], 'cursor', $cursor);

        $merged = collect($public->items())->concat($own->items());

        $merged = $cursor?->pointsToPreviousItems()
            ? $merged->sortBy(fn ($post) => [$post->created_at, $post->id])
            : $merged->sortByDesc(fn ($post) => [$post->created_at, $post->id]);

        $merged = EloquentCollection::make($merged->values()->take($perPage + 1));

        $merged->load('user');

        $likedPostIds = Like::where('user_id', $user->id)
            ->where('likeable_type', Post::class)
            ->whereIn('likeable_id', $merged->pluck('id'))
            ->pluck('likeable_id');

        $merged->each(fn ($post) => $post->liked_by_me = $likedPostIds->contains($post->id));

        return new CursorPaginator($merged, $perPage, $cursor, [
            'path' => request()->url(),
            'cursorName' => 'cursor',
            'parameters' => ['created_at', 'id'],
        ]);
    }

    public function create(array $data, User $user): Post
    {
        $imagePath = null;

        if (!empty($data['image']) && $data['image'] instanceof UploadedFile) {
            $imagePath = $data['image']->store('posts', config('filesystems.post_images_disk'));
        }

        $post = Post::create([
            'user_id'      => $user->id,
            'body'         => $data['body'] ?? null,
            'image'        => $imagePath,
            'visibility'   => $data['visibility'],
            'image_status' => $imagePath ? 'pending' : null,
        ]);

        if ($imagePath) {
            ProcessPostImage::dispatch($post);
        }

        return $post;
    }

    public function delete(Post $post): void
    {
        $disk = Storage::disk(config('filesystems.post_images_disk'));

        if ($post->image) {
            $disk->delete($post->image);
        }

        if ($post->image_thumb) {
            $disk->delete($post->image_thumb);
        }

        $post->delete();
    }
}
