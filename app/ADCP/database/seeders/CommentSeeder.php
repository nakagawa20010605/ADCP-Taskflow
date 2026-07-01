<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\Task;
use App\Models\User;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user1 = User::where('email', 'user1@example.com')->first();
        $user2 = User::where('email', 'user2@example.com')->first();
        $task1 = Task::where('title', 'ログイン機能の実装')->first();
        $task2 = Task::where('title', 'タスク一覧APIの実装')->first();

        Comment::create([
            'task_id' => $task1->id,
            'user_id' => $user1->id,
            'content' => 'Sanctumのインストールが完了しました。',
        ]);

        Comment::create([
            'task_id' => $task1->id,
            'user_id' => $user2->id,
            'content' => '動作確認しました。問題なしです！',
        ]);

        Comment::create([
            'task_id' => $task2->id,
            'user_id' => $user2->id,
            'content' => 'ルーティングの設定から着手します。',
        ]);

    }
}
