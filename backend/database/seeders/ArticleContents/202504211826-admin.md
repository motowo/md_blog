# Laravel APIの設計とベストプラクティス

RESTful APIの設計において、Laravelは強力なツールセットを提供します。この記事では、実際のプロジェクトで使える API設計のポイントを解説します。

## Resource Controllers の活用

Laravel の Resource Controller を使用することで、RESTful な API を効率的に実装できます。

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {
        $articles = Article::with(['user', 'tags'])
                          ->published()
                          ->latest()
                          ->paginate(15);
                          
        return ArticleResource::collection($articles);
    }
    
    public function show(Article $article)
    {
        $article->load(['user', 'tags', 'comments']);
        
        return new ArticleResource($article);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'tags' => 'array|max:5',
            'tags.*' => 'exists:tags,id',
        ]);
        
        $article = $request->user()->articles()->create($validated);
        $article->tags()->sync($validated['tags'] ?? []);
        
        return new ArticleResource($article);
    }
}
```

## API Resources の実装

データの整形と出力制御には API Resources を活用しましょう。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->when($this->shouldShowFullContent(), $this->content),
            'preview' => $this->when($this->is_paid && !$this->shouldShowFullContent(), $this->preview_content),
            'author' => new UserResource($this->whenLoaded('user')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'is_paid' => $this->is_paid,
            'price' => $this->when($this->is_paid, $this->price),
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
    
    private function shouldShowFullContent()
    {
        // 無料記事、投稿者、管理者は全文表示
        return !$this->is_paid || 
               $this->user_id === auth()->id() || 
               auth()->user()?->isAdmin();
    }
}
```

## バリデーション

Form Request を使用してバリデーションを分離し、コントローラーをクリーンに保ちましょう。

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:100',
            'thumbnail_url' => 'nullable|url',
            'is_paid' => 'boolean',
            'price' => 'required_if:is_paid,true|numeric|min:100|max:10000',
            'preview_content' => 'required_if:is_paid,true|string|max:500',
            'tags' => 'array|max:5',
            'tags.*' => 'exists:tags,id',
        ];
    }
    
    public function messages()
    {
        return [
            'title.required' => 'タイトルは必須です',
            'content.min' => 'コンテンツは100文字以上で入力してください',
            'price.required_if' => '有料記事の場合、価格の設定が必要です',
        ];
    }
}
```

## 認証とミドルウェア

API の認証には Laravel Sanctum を活用し、適切な権限制御を実装します。

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('articles', ArticleController::class);
    Route::post('articles/{article}/purchase', [PurchaseController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('tags', TagController::class)->except(['index', 'show']);
});
```

## エラーハンドリング

統一されたエラーレスポンスを返すため、Exception Handler をカスタマイズします。

```php
public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {
        if ($exception instanceof ValidationException) {
            return response()->json([
                'message' => 'バリデーションエラーが発生しました',
                'errors' => $exception->errors(),
            ], 422);
        }
        
        if ($exception instanceof AuthenticationException) {
            return response()->json([
                'message' => '認証が必要です',
            ], 401);
        }
    }
    
    return parent::render($request, $exception);
}
```

## まとめ

Laravel での API 開発では以下の点を意識することが重要です：

- Resource Controller でRESTfulな設計を心がける
- API Resources でデータ出力を制御する  
- Form Request でバリデーションを分離する
- 適切なHTTPステータスコードを返す
- セキュリティを考慮した認証・認可を実装する

これらのベストプラクティスに従うことで、保守性が高く安全な API を構築できます。