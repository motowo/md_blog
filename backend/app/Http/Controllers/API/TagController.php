<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tags = Tag::withCount('articles')->get();

        return response()->json([
            'data' => $tags,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 管理者のみタグ作成可能
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:tags',
            'slug' => 'nullable|string|max:255|unique:tags',
        ]);

        $tag = Tag::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
        ]);

        return response()->json([
            'data' => $tag,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        return response()->json([
            'data' => $tag->load('articles'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        // 管理者のみタグ更新可能
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:tags,name,'.$tag->id,
            'slug' => 'sometimes|nullable|string|max:255|unique:tags,slug,'.$tag->id,
        ]);

        $updateData = [];
        if ($request->has('name')) {
            $updateData['name'] = $request->name;
            // nameが更新されたらslugも自動更新（slugが明示的に指定されていない場合）
            if (! $request->has('slug')) {
                $updateData['slug'] = Str::slug($request->name);
            }
        }
        if ($request->has('slug')) {
            $updateData['slug'] = $request->slug;
        }

        $tag->update($updateData);

        return response()->json([
            'data' => $tag,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        // 管理者のみタグ削除可能
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $tag->delete();

        return response()->json(null, 204);
    }
}
