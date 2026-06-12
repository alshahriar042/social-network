<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;
use Throwable;

class ProcessPostImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public Post $post)
    {
    }

    /**
     * Resize the uploaded image down to a feed-friendly width and store the
     * result alongside the original, off the request/response cycle.
     */
    public function handle(): void
    {
        $disk = Storage::disk(config('filesystems.post_images_disk'));

        $image = (new ImageManager(new Driver()))->read($disk->get($this->post->image));
        $image->scaleDown(width: 1080);

        $pathInfo  = pathinfo($this->post->image);
        $thumbPath = "{$pathInfo['dirname']}/{$pathInfo['filename']}_feed.jpg";

        $disk->put($thumbPath, (string) $image->encode(new JpegEncoder(quality: 80)));

        $this->post->update([
            'image_thumb'  => $thumbPath,
            'image_status' => 'ready',
        ]);
    }

    public function failed(Throwable $e): void
    {
        $this->post->update(['image_status' => 'failed']);
    }
}
