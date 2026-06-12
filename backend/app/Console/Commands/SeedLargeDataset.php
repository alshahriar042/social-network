<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SeedLargeDataset extends Command
{
    protected $signature = 'app:seed-large-dataset
        {--users=1000 : Number of users to create}
        {--posts=100000 : Number of posts to create}
        {--comments=500000 : Number of comments to create}
        {--likes=2000000 : Number of likes to create}
        {--chunk=1000 : Rows per insert batch}';

    protected $description = 'Bulk-insert a large dataset of users/posts/comments/likes for load testing the feed and likes queries';

    public function handle(): int
    {
        $chunk = max(1, (int) $this->option('chunk'));

        [$minUserId, $maxUserId] = $this->seedUsers((int) $this->option('users'), $chunk);
        [$minPostId, $maxPostId] = $this->seedPosts((int) $this->option('posts'), $chunk, $minUserId, $maxUserId);

        $this->seedComments((int) $this->option('comments'), $chunk, $minUserId, $maxUserId, $minPostId, $maxPostId);
        $this->seedLikes((int) $this->option('likes'), $chunk, $minUserId, $maxUserId, $minPostId, $maxPostId);

        $this->newLine();
        $this->info('Done. Run `php artisan app:backfill-counters` to populate likes_count/comments_count.');

        return self::SUCCESS;
    }

    /**
     * @return array{0: int, 1: int} [minId, maxId] of users after insertion
     */
    private function seedUsers(int $total, int $chunk): array
    {
        $this->info("Seeding {$total} users...");
        $password = Hash::make('password');
        $bar = $this->output->createProgressBar($total);

        for ($i = 0; $i < $total; $i += $chunk) {
            $rows = [];
            for ($j = 0, $n = min($chunk, $total - $i); $j < $n; $j++) {
                $rows[] = [
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'email' => fake()->unique()->safeEmail(),
                    'password' => $password,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('users')->insert($rows);
            $bar->advance(count($rows));
        }
        $bar->finish();
        $this->newLine();

        return [
            (int) DB::table('users')->min('id'),
            (int) DB::table('users')->max('id'),
        ];
    }

    /**
     * @return array{0: int, 1: int} [minId, maxId] of posts after insertion
     */
    private function seedPosts(int $total, int $chunk, int $minUserId, int $maxUserId): array
    {
        $this->info("Seeding {$total} posts...");
        $bar = $this->output->createProgressBar($total);

        for ($i = 0; $i < $total; $i += $chunk) {
            $rows = [];
            for ($j = 0, $n = min($chunk, $total - $i); $j < $n; $j++) {
                $rows[] = [
                    'user_id' => rand($minUserId, $maxUserId),
                    'body' => fake()->sentence(rand(5, 30)),
                    'visibility' => fake()->boolean(85) ? 'public' : 'private',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('posts')->insert($rows);
            $bar->advance(count($rows));
        }
        $bar->finish();
        $this->newLine();

        return [
            (int) Post::min('id'),
            (int) Post::max('id'),
        ];
    }

    private function seedComments(int $total, int $chunk, int $minUserId, int $maxUserId, int $minPostId, int $maxPostId): void
    {
        $this->info("Seeding {$total} comments...");
        $bar = $this->output->createProgressBar($total);

        for ($i = 0; $i < $total; $i += $chunk) {
            $rows = [];
            for ($j = 0, $n = min($chunk, $total - $i); $j < $n; $j++) {
                $rows[] = [
                    'post_id' => rand($minPostId, $maxPostId),
                    'user_id' => rand($minUserId, $maxUserId),
                    'parent_id' => null,
                    'body' => fake()->sentence(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('comments')->insert($rows);
            $bar->advance(count($rows));
        }
        $bar->finish();
        $this->newLine();
    }

    private function seedLikes(int $total, int $chunk, int $minUserId, int $maxUserId, int $minPostId, int $maxPostId): void
    {
        $this->info("Seeding {$total} likes...");
        $bar = $this->output->createProgressBar($total);

        for ($i = 0; $i < $total; $i += $chunk) {
            $rows = [];
            for ($j = 0, $n = min($chunk, $total - $i); $j < $n; $j++) {
                $rows[] = [
                    'user_id' => rand($minUserId, $maxUserId),
                    'likeable_id' => rand($minPostId, $maxPostId),
                    'likeable_type' => Post::class,
                    'created_at' => now(),
                ];
            }
            // insertOrIgnore: random (user_id, likeable_id, likeable_type)
            // combinations can collide with the unique constraint.
            DB::table('likes')->insertOrIgnore($rows);
            $bar->advance(count($rows));
        }
        $bar->finish();
        $this->newLine();
    }
}
