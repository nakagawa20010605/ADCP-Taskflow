<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; //論理削除のやつ

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'created_by',
        'assigned_to',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
    ];

    //所属チーム
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    //作成者
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    //担当者
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    //コメント
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
