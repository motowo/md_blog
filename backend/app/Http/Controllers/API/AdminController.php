<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // ミドルウェアはルート定義で設定するため、コンストラクタは不要

    // ===== ユーザー管理機能 =====

    /**
     * 全ユーザー一覧を取得
     */
    public function getUsers(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $query = User::query()
            ->withCount(['articles', 'payments'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * 特定ユーザーの詳細情報を取得
     */
    public function getUser(User $user): JsonResponse
    {
        $user->load([
            'articles' => function ($query) {
                $query->latest()->take(10);
            },
            'payments' => function ($query) {
                $query->where('status', 'success')->latest()->take(10);
            },
        ]);

        $user->loadCount(['articles', 'payments']);

        return response()->json(['user' => $user]);
    }

    /**
     * ユーザー情報を更新
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,'.$user->id,
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'role' => 'sometimes|in:author,admin',
            'bio' => 'nullable|string|max:1000',
        ]);

        $user->update($request->only(['name', 'username', 'email', 'role', 'bio']));

        return response()->json([
            'message' => 'ユーザー情報を更新しました',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * ユーザーアカウントの有効/無効を切り替え
     */
    public function toggleUserStatus(User $user): JsonResponse
    {
        // 管理者自身は無効化できない
        if ($user->id === Auth::id()) {
            return response()->json(['message' => '自分自身のアカウントは変更できません'], 422);
        }

        // is_activeフィールドを切り替え
        $user->is_active = ! $user->is_active;
        $user->save();

        $status = $user->is_active ? '有効化' : '無効化';

        return response()->json([
            'message' => "ユーザーアカウントを{$status}しました",
            'user' => $user->fresh(),
        ]);
    }

    /**
     * ユーザーアカウントを削除
     */
    public function deleteUser(User $user): JsonResponse
    {
        // 管理者自身は削除できない
        if ($user->id === Auth::id()) {
            return response()->json(['message' => '自分自身のアカウントは削除できません'], 422);
        }

        // 関連する記事を削除
        $user->articles()->delete();

        // アバターファイルも削除
        $user->avatarFiles()->delete();

        // ユーザーを削除
        $user->delete();

        return response()->json(['message' => 'ユーザーアカウントと関連データを削除しました']);
    }

    // ===== 記事管理機能 =====

    /**
     * 全記事一覧を取得
     */
    public function getArticles(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');

        $query = Article::with(['user', 'tags'])
            ->withCount('payments')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('username', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $articles = $query->paginate($perPage);

        return response()->json([
            'articles' => $articles->items(),
            'pagination' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    /**
     * 記事の詳細情報を取得
     */
    public function getArticle(Article $article): JsonResponse
    {
        $article->load(['user', 'tags']);
        $article->loadCount('payments');

        return response()->json(['article' => $article]);
    }

    /**
     * 記事情報を更新（特集設定など）
     */
    public function updateArticle(Request $request, Article $article): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|in:published,draft',
            'is_featured' => 'sometimes|boolean',
            'title' => 'sometimes|string|max:255',
        ]);

        $article->update($request->only(['status', 'is_featured', 'title']));

        return response()->json([
            'message' => '記事情報を更新しました',
            'article' => $article->fresh(['user', 'tags']),
        ]);
    }

    /**
     * 記事を削除
     */
    public function deleteArticle(Article $article): JsonResponse
    {
        $article->delete();

        return response()->json(['message' => '記事を削除しました']);
    }

    // ===== ダッシュボード機能 =====

    /**
     * 管理者ダッシュボードの統計情報を取得
     */
    public function getDashboardStats(): JsonResponse
    {
        // 基本統計
        $totalUsers = User::count();
        $totalArticles = Article::count();
        $publishedArticles = Article::where('status', 'published')->count();
        $totalPayments = Payment::where('status', 'success')->count();

        // 収益統計
        $totalRevenue = Payment::where('status', 'success')->sum('amount');
        $thisMonthRevenue = Payment::where('status', 'success')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        // 今月の新規ユーザー数
        $thisMonthUsers = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // 今月の新規記事数
        $thisMonthArticles = Article::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // 最近の活動（過去30日間のデータ）
        $recentPayments = Payment::with(['user', 'article'])
            ->where('status', 'success')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // 月別収益データ（過去12ヶ月）
        $monthlyRevenue = Payment::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(amount) as revenue')
        )
            ->where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->year.'-'.str_pad($item->month, 2, '0', STR_PAD_LEFT),
                    'revenue' => $item->revenue,
                ];
            });

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_articles' => $totalArticles,
                'published_articles' => $publishedArticles,
                'total_payments' => $totalPayments,
                'total_revenue' => $totalRevenue,
                'this_month_revenue' => $thisMonthRevenue,
                'this_month_users' => $thisMonthUsers,
                'this_month_articles' => $thisMonthArticles,
            ],
            'recent_payments' => $recentPayments,
            'monthly_revenue' => $monthlyRevenue,
        ]);
    }

    /**
     * 収益詳細データを取得
     */
    public function getRevenueDetails(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // month, week, year
        $perPage = $request->get('per_page', 15);

        $query = Payment::with(['user', 'article'])
            ->where('status', 'success')
            ->orderBy('created_at', 'desc');

        // 期間フィルター
        switch ($period) {
            case 'week':
                $query->where('created_at', '>=', now()->subWeek());
                break;
            case 'month':
                $query->where('created_at', '>=', now()->subMonth());
                break;
            case 'year':
                $query->where('created_at', '>=', now()->subYear());
                break;
        }

        $payments = $query->paginate($perPage);

        return response()->json([
            'payments' => $payments->items(),
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
            'summary' => [
                'total_amount' => $query->sum('amount'),
                'total_count' => $query->count(),
            ],
        ]);
    }
}
