<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\User;

class TeamController extends Controller
{
    //所属チーム一覧取得
    public function index(Request $request)
    {
        $teams = $request->user()->teams()->with('members')->get();
        $return response()->json($teams);
    }

    //チーム作成
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $team = Team::create([
            'name' => $validated['name'],
            'created_by' => $request->user()->id,
        ]);
        $team->members()->attach($request->user()->id, ['role' => 'owner']);

        return response()->json($team->load('members'), 201);
    }

    //チーム詳細取得
    public function show(Request $request, Team $team)
    {
        if(!$team->members->contains($request->user()->id)){
            return response()->json(['message' => '権限がありません'], 403);
        }

        return response()->json($team->load('members'));
    }

    //チーム削除(論理削除)
    public function destroy(Request $request, Team $team)
    {
        if($team->created_by !== $request->user()->id){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $team->tasks()->each(function($task){
            $task->comments()->delete();
            $task->delete();
        });
        $team->delete();

        return response()->json(['message' => 'チームを削除しました']);
    }

    //メンバー招待
    public function invite(Request $request, Team $team)
    {
        if($team->created_by !== $request->user()->id){
            return response()->json(['message' => '権限がありません'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|email|exists:user,email',
        ]);

        $inviteUser = User::where('email', $validated['email'])->first();

        if($team->members->contains($inviteUser->id)){
            return response()->json(['message' => 'すでにメンバーです'], 409);
        }

        $team->members()->attach($inviteUser->id, ['role' => 'member']);

        return response()->json(['message' => 'メンバーを招待しました']);
    }

    //メンバー削除
    public function removeMember(Request $request, Team $team, User $user)
    {
        if($team->created_by !== $request->user()->id){
            return response()->json(['message' => '権限がありません'], 403);
        }

        if($user->id === $request->user->id){
            return response()->json(['message' => 'オーナーは削除できません'], 409);
        }

        $team->members()->detach($user->id);

        return response()->json(['message' => 'メンバーを削除しました']);
    }
}
