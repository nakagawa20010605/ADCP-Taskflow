<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; //論理削除のやつ

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'color',
        'created_by',
    ];

    //チーム作成者
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    //メンバー（多対多）
    public function members()
    {
        return $this->belongsToMany(User::class, 'team_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    //タスク
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
