<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; //論理削除のやつ

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'task_id',
        'user_id',
        'content',
    ];

    //タスク
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    //投稿ユーザー
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
