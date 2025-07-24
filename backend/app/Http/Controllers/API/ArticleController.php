<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Article::with(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
            $query->active();
        }, 'tags']);

        // デフォルトで公開記事のみに絞り込み
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'published');
        }

        // キーワード検索（タイトル・本文の全文検索）
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('content', 'LIKE', "%{$searchTerm}%");
            });
        }

        // タグによる絞り込み（単一タグ対応）
        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // 複数タグによる絞り込み
        if ($request->has('tags') && ! empty($request->tags)) {
            $tags = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $tags = array_filter($tags); // 空の値を除去

            if (! empty($tags)) {
                $query->whereHas('tags', function ($q) use ($tags) {
                    $q->whereIn('name', $tags);
                }, '=', count($tags)); // すべてのタグを持つ記事のみ（AND検索）
            }
        }

        // ページネーション設定
        $perPage = $request->get('per_page', 12);
        $perPage = min($perPage, 50); // 最大50件まで

        $articles = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $articles->items(),
            'current_page' => $articles->currentPage(),
            'last_page' => $articles->lastPage(),
            'per_page' => $articles->perPage(),
            'total' => $articles->total(),
            'from' => $articles->firstItem(),
            'to' => $articles->lastItem(),
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
            'status' => 'in:draft,published',
            'is_paid' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'preview_content' => 'nullable|string',
        ]);

        // 有料記事の場合は振込口座チェック
        if ($request->is_paid) {
            $user = Auth::user();
            if (! $user->hasActiveBankAccount()) {
                return response()->json([
                    'message' => '有料記事を投稿するには振込口座の登録が必要です',
                    'errors' => ['bank_account' => ['振込口座を登録してください']],
                ], 422);
            }
        }

        $article = Article::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'status' => $request->status ?? 'draft',
            'is_paid' => $request->is_paid ?? false,
            'price' => $request->price,
            'preview_content' => $request->preview_content,
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
        // 公開されていない記事はアクセス拒否（作成者と管理者は除く）
        if ($article->status !== 'published') {
            $user = Auth::user();
            if (! $user || ($user->id !== $article->user_id && $user->role !== 'admin')) {
                return response()->json([
                    'message' => 'この記事にはアクセスできません。',
                ], 403);
            }
        }

        // 有料記事の場合、購入チェック（作成者と管理者は除く）
        if ($article->is_paid) {
            // オプション認証：Sanctumトークンがあれば認証を試行
            $user = null;
            if (request()->bearerToken()) {
                try {
                    // Sanctumガードで認証を試行
                    $user = Auth::guard('sanctum')->user();
                } catch (\Exception $e) {
                    Log::warning('Sanctum認証エラー', ['error' => $e->getMessage()]);
                }
            }

            // 未ログインの場合はプレビューのみ
            if (! $user) {
                $articleData = $article->load(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
                    $query->active();
                }, 'tags']);
                $articleData->content = substr($article->content, 0, 300).'...';

                return response()->json([
                    'data' => $articleData,
                    'is_preview' => true,
                ]);
            } elseif ($user->id === $article->user_id || $user->role === 'admin') {
                // 作成者または管理者の場合は全文表示
                return response()->json([
                    'data' => $article->load(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
                        $query->active();
                    }, 'tags']),
                    'is_preview' => false,
                ]);
            } else {
                // 購入チェック
                $hasPurchased = $user->hasPurchased($article);

                if ($hasPurchased) {
                    // 購入済みの場合は全文表示
                    return response()->json([
                        'data' => $article->load(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
                            $query->active();
                        }, 'tags']),
                        'is_preview' => false,
                        'has_purchased' => true,
                    ]);
                } else {
                    // 未購入の場合はプレビューのみ
                    $articleData = $article->load(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
                        $query->active();
                    }, 'tags']);
                    $articleData->content = substr($article->content, 0, 300).'...';

                    return response()->json([
                        'data' => $articleData,
                        'is_preview' => true,
                        'has_purchased' => false,
                    ]);
                }
            }
        }

        // 無料記事の場合は全文表示
        return response()->json([
            'data' => $article->load(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
                $query->active();
            }, 'tags']),
            'is_preview' => false,
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
            'status' => 'in:draft,published',
            'is_paid' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'preview_content' => 'nullable|string',
        ]);

        // 有料記事への変更の場合は振込口座チェック
        if ($request->is_paid && ! $article->is_paid) {
            $user = Auth::user();
            if (! $user->hasActiveBankAccount()) {
                return response()->json([
                    'message' => '有料記事にするには振込口座の登録が必要です',
                    'errors' => ['bank_account' => ['振込口座を登録してください']],
                ], 422);
            }
        }

        $article->update($request->only([
            'title',
            'content',
            'status',
            'is_paid',
            'price',
            'preview_content',
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

    /**
     * Attach tags to an article.
     */
    public function attachTags(Request $request, Article $article)
    {
        if ($article->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $article->tags()->syncWithoutDetaching($request->tag_ids);

        return response()->json([
            'data' => $article->load('tags'),
        ]);
    }

    /**
     * Detach a tag from an article.
     */
    public function detachTag(Article $article, Tag $tag)
    {
        if ($article->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $article->tags()->detach($tag->id);

        return response()->json(null, 204);
    }

    /**
     * Get recent articles for homepage.
     */
    public function recent(Request $request)
    {
        $limit = $request->get('limit', 10);
        $limit = min($limit, 10); // 最大10件まで

        $articles = Article::with(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
            $query->active();
        }, 'tags'])
            ->where('status', 'published')
            ->latest('created_at') // 作成日時の降順
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $articles,
        ]);
    }

    /**
     * Get trending articles based on sales in the last month.
     */
    public function trending(Request $request)
    {
        $limit = $request->get('limit', 10);
        $limit = min($limit, 10); // 最大10件まで

        // 過去1ヶ月の日付を計算
        $oneMonthAgo = now()->subMonth();

        $articles = Article::with(['user:id,name,username,profile_public,avatar_path', 'user.avatarFiles' => function ($query) {
            $query->active();
        }, 'tags'])
            ->select('articles.*')
            ->selectRaw('COALESCE(SUM(payments.amount), 0) as total_sales')
            ->leftJoin('payments', function ($join) use ($oneMonthAgo) {
                $join->on('articles.id', '=', 'payments.article_id')
                    ->where('payments.status', '=', 'success')
                    ->where('payments.created_at', '>=', $oneMonthAgo);
            })
            ->where('articles.status', 'published')
            ->where('articles.is_paid', true) // 有料記事のみ
            ->groupBy('articles.id')
            ->orderByDesc('total_sales')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $articles,
        ]);
    }
}
