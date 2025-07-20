<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * 現在のユーザー情報取得
     */
    public function show()
    {
        $user = Auth::user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * プロフィール更新
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
        ], [
            'name.required' => '名前は必須です',
            'name.max' => '名前は255文字以内で入力してください',
            'username.required' => 'ユーザー名は必須です',
            'username.max' => 'ユーザー名は255文字以内で入力してください',
            'username.alpha_dash' => 'ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます',
            'username.unique' => 'このユーザー名は既に使用されています',
            'email.required' => 'メールアドレスは必須です',
            'email.email' => '有効なメールアドレスを入力してください',
            'email.max' => 'メールアドレスは255文字以内で入力してください',
            'email.unique' => 'このメールアドレスは既に使用されています',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'バリデーションエラーが発生しました',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'message' => 'プロフィールが更新されました',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * パスワード変更
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => '現在のパスワードは必須です',
            'new_password.required' => '新しいパスワードは必須です',
            'new_password.min' => 'パスワードは8文字以上である必要があります',
            'new_password.confirmed' => 'パスワード確認が一致しません',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'バリデーションエラーが発生しました',
                'errors' => $validator->errors(),
            ], 422);
        }

        // 現在のパスワードを確認
        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => '現在のパスワードが正しくありません',
                'errors' => [
                    'current_password' => ['現在のパスワードが正しくありません'],
                ],
            ], 422);
        }

        // 新しいパスワードと現在のパスワードが同じかチェック
        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'message' => '新しいパスワードは現在のパスワードと異なる必要があります',
                'errors' => [
                    'new_password' => ['新しいパスワードは現在のパスワードと異なる必要があります'],
                ],
            ], 422);
        }

        // パスワードを更新
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'パスワードが変更されました',
        ]);
    }

    /**
     * アカウント削除
     */
    public function deleteAccount(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ], [
            'password.required' => 'パスワードは必須です',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'バリデーションエラーが発生しました',
                'errors' => $validator->errors(),
            ], 422);
        }

        // パスワードを確認
        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'パスワードが正しくありません',
                'errors' => [
                    'password' => ['パスワードが正しくありません'],
                ],
            ], 422);
        }

        // ユーザーのトークンを無効化
        $user->tokens()->delete();

        // ユーザーを削除
        $user->delete();

        return response()->json([
            'message' => 'アカウントが削除されました',
        ]);
    }

    /**
     * ユーザーの記事一覧取得
     */
    public function articles(Request $request)
    {
        $user = Auth::user();

        $query = $user->articles();

        // ステータスでフィルター
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // ページネーション
        $perPage = $request->get('per_page', 10);
        $articles = $query->with('tags')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $articles->items(),
            'current_page' => $articles->currentPage(),
            'last_page' => $articles->lastPage(),
            'per_page' => $articles->perPage(),
            'total' => $articles->total(),
        ]);
    }
}
