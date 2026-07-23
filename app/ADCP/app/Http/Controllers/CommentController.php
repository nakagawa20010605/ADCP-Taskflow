<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Task;

class CommentController extends Controller
{
    //コメント一覧取得
    public function index(Request $request, Task $task)
    {
        if(!$task->team->members->contains($request->user()->id)){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $comments = $task->comments()->with('user')->get();

        return response()->json($comments);
    }

    //コメント投稿
    public function store(Request $request, Task $task)
    {
        if(!$task->team->members->contains($request->user()->id)){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $comment = Comment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return response()->json($comment->load('user'), 201);
    }

    //コメント削除
    public function destroy(Request $request, Comment $comment)
    {
        if($comment->user_id !== $request->user()->id){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'コメントを削除しました']);
    }
}
