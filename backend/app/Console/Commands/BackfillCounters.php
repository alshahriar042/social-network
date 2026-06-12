<?php

namespace App\Console\Commands;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillCounters extends Command
{
    protected $signature = 'app:backfill-counters';

    protected $description = 'Recalculate posts.likes_count, posts.comments_count and comments.likes_count from the likes/comments tables';

    public function handle(): int
    {
        $this->info('Backfilling post counters...');
        $postBar = $this->output->createProgressBar(Post::count());

        Post::query()->orderBy('id')->chunkById(1000, function ($posts) use ($postBar) {
            $ids = $posts->pluck('id')->implode(',');

            DB::statement("
                UPDATE posts p
                SET p.likes_count = (
                        SELECT COUNT(*) FROM likes l
                        WHERE l.likeable_type = ? AND l.likeable_id = p.id
                    ),
                    p.comments_count = (
                        SELECT COUNT(*) FROM comments c
                        WHERE c.post_id = p.id AND c.parent_id IS NULL
                    )
                WHERE p.id IN ({$ids})
            ", [Post::class]);

            $postBar->advance($posts->count());
        });
        $postBar->finish();
        $this->newLine();

        $this->info('Backfilling comment counters...');
        $commentBar = $this->output->createProgressBar(Comment::count());

        Comment::query()->orderBy('id')->chunkById(1000, function ($comments) use ($commentBar) {
            $ids = $comments->pluck('id')->implode(',');

            DB::statement("
                UPDATE comments c
                SET c.likes_count = (
                    SELECT COUNT(*) FROM likes l
                    WHERE l.likeable_type = ? AND l.likeable_id = c.id
                )
                WHERE c.id IN ({$ids})
            ", [Comment::class]);

            $commentBar->advance($comments->count());
        });
        $commentBar->finish();
        $this->newLine();

        $this->info('Done.');

        return self::SUCCESS;
    }
}
