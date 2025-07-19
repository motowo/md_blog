<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $articles = Article::with('user')->latest()->get();

        return response()->json([
            'data' => $articles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'thumbnail_url' => 'nullable|url',
            'status' => 'in:draft,published',
            'is_paid' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'preview_content' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        $article = Article::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'thumbnail_url' => $request->thumbnail_url,
            'status' => $request->status ?? 'draft',
            'is_paid' => $request->is_paid ?? false,
            'price' => $request->price,
            'preview_content' => $request->preview_content,
            'is_featured' => $request->is_featured ?? false,
        ]);

        return response()->json([
            'data' => $article->load('user'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article)
    {
        return response()->json([
            'data' => $article->load('user', 'tags'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Article $article)
    {
        if ($article->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'thumbnail_url' => 'nullable|url',
            'status' => 'in:draft,published',
            'is_paid' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'preview_content' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        $article->update($request->only([
            'title',
            'content',
            'thumbnail_url',
            'status',
            'is_paid',
            'price',
            'preview_content',
            'is_featured',
        ]));

        return response()->json([
            'data' => $article->load('user'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        if ($article->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $article->delete();

        return response()->json(null, 204);
    }
}
