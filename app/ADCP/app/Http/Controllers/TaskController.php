<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\Team;

class TaskController extends Controller
{
    //タスク一覧取得
    public function index(Request $request, Team $team)
    {
        if(!$team->members->contains($request->user()->id)){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $tasks = $team->tasks()->with(['creator', 'assignee'])->get();

        return response()->json($tasks);
    }

    //タスク作成
    public function store(Request $request, Team $team)
    {
        if(!$team->members->contains($request->user()->id)){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:低,中,高',
            'due_date' => 'nullable|date',
        ]);

        $task = Task::create([
            'team_id' => $team->id,
            'created_by' => $request->user()->id,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => '未着手',
            'priority' => $validated['priority'] ?? '中',
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return response()->json($task->load(['creator', 'assignee']), 201);
    }

    //タスク詳細取得
    public function show(Request $request, Task $task)
    {
        if(is_null($task->team_id)) {
            if($task->created_by !== $request->user()->id) {
                return response()->json(['message' => '権限がありません'], 403);
            }
        } else {
            if(!$task->team->members->contains($request->user()->id)){
                return response()->json(['message' => '権限がありません'], 403);
            }
        }

        return response()->json($task->load(['creator', 'assignee', 'comments.user']));
    }

    //タスク編集
    public function update(Request $request, Task $task)
    {
        if(is_null($task->team_id)) {
            if($task->created_by !== $request->user()->id) {
                return response()->json(['message' => '権限がありません'], 403);
            }
        } else {
            if(!$task->team->members->contains($request->user()->id)){
                return response()->json(['message' => '権限がありません'], 403);
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:低,中,高',
            'due_date' => 'nullable|date',
        ]);

        $task->update($validated);

        return response()->json($task->load(['creator', 'assignee']));
    }

    //タスク削除
    public function destroy(Request $request, Task $task)
    {
        if(is_null($task->team_id)) {
            if($task->created_by !== $request->user()->id) {
                return response()->json(['message' => '権限がありません'], 403);
            }
        } else {
            if(!$task->team->members->contains($request->user()->id)){
                return response()->json(['message' => '権限がありません'], 403);
            }
        }

        $task->comments()->delete();
        $task->delete();

        return response()->json(['message' => 'タスクを削除しました']);
    }

    //ステータス更新
    public function updateStatus(Request $request, Task $task)
    {
        if(is_null($task->team_id)) {
            if($task->created_by !== $request->user()->id) {
                return response()->json(['message' => '権限がありません'], 403);
            }
        } else {
            if(!$task->team->members->contains($request->user()->id)){
                return response()->json(['message' => '権限がありません'], 403);
            }
        }

        $validated = $request->validate([
            'status' => 'required|in:未着手,進行中,完了',
        ]);

        $task->update(['status' => $validated['status']]);

        return response()->json($task);
    }

    //個人タスク一覧取得（チーム未所属の個人的なタスク）
    public function myTasks(Request $request)
    {
        $tasks = Task::whereNull('team_id')
                ->where('created_by', $request->user()->id)
                ->with(['creator', 'assignee'])
                ->get();
        
        return response()->json($tasks);
    }

    //個人タスク作成（チーム未所属の個人的なタスク）
    public function storeMyTask(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:低,中,高',
            'due_date' => 'nullable|date',
        ]);

        $task = Task::create([
            'team_id' => null,
            'created_by' => $request->user()->id,
            'assigned_to' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => '未着手',
            'priority' => $validated['priority'] ?? '中',
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return response()->json($task->load(['creator', 'assignee']), 201);
    }
}
