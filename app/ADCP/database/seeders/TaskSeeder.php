<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user1 = User::where('email', 'user1@example.com')->first();
        $user2 = User::where('email', 'user2@example.com')->first();
        $user3 = User::where('email', 'user3@example.com')->first();
        $team1 = Team::where('name', 'テストチーム1')->first();
        $team2 = Team::where('name', 'テストチーム2')->first();

        //チーム1のタスク
        Task::create([
            'team_id' => $team1->id,
            'created_by' => $user1->id,
            'assigned_to' => $user1->id,
            'title' => 'ログイン機能の実装',
            'description' => 'Laravel SanctumでAPI認証を実装する',
            'status' => '完了',
            'priority' => '高',
            'due_date' => '2026-06-01',
        ]);

        Task::create([
            'team_id' => $team1->id,
            'created_by' => $user1->id,
            'assigned_to' => $user2->id,
            'title' => 'タスク一覧APIの実装',
            'description' => 'チームごとのタスク一覧を返すAPIを実装する',
            'status' => '進行中',
            'priority' => '高',
            'due_date' => '2026-06-20',
        ]);

        Task::create([
            'team_id' => $team1->id,
            'created_by' => $user2->id,
            'assigned_to' => null,
            'title' => 'フロントエンドのUI実装',
            'description' => 'HTML/CSS/JSでホーム画面を実装する',
            'status' => '未着手',
            'priority' => '中',
            'due_date' => '2026-07-01',
        ]);

        //チーム2のタスク
        Task::create([
            'team_id' => $team2->id,
            'created_by' => $user2->id,
            'assigned_to' => $user3->id,
            'title' => 'DB設計',
            'description' => 'テーブル定義書を作成する',
            'status' => '完了',
            'priority' => '高',
            'due_date' => '2026-05-20',
        ]);

        Task::create([
            'team_id' => $team2->id,
            'created_by' => $user3->id,
            'assigned_to' => $user2->id,
            'title' => 'コメント機能の実装',
            'description' => 'タスクへのコメント投稿・削除APIを実装する',
            'status' => '未着手',
            'priority' => '低',
            'due_date' => '2026-07-15',
        ]);
    }
}
