<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ユーザー登録
     */
    public function register(Request $request)
    {
        // JSONリクエストを手動でパース
        if ($request->isJson()) {
            $jsonData = json_decode($request->getContent(), true);
            if ($jsonData) {
                $request->merge($jsonData);
            }
        }

        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name ?: $request->username, // 名前が空の場合はユーザー名を使用
            'role' => 'author', // 全ユーザーを投稿者として登録
        ]);

        // デフォルトアバターを生成
        $avatarService = new AvatarService();
        $avatarService->generateDefaultAvatar($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * ユーザーログイン
     */
    public function login(Request $request)
    {
        // JSONリクエストを手動でパース
        if ($request->isJson()) {
            $jsonData = json_decode($request->getContent(), true);
            if ($jsonData && is_array($jsonData)) {
                $request->merge($jsonData);
            }
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember_me' => 'nullable|boolean',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        // ユーザーが無効化されているかチェック
        if (! $user->is_active) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['このアカウントは無効化されています。管理者にお問い合わせください。'],
            ]);
        }

        // Remember me機能に応じてトークンの有効期限を設定
        $rememberMe = $request->boolean('remember_me', false);
        $tokenName = $rememberMe ? 'auth_token_persistent' : 'auth_token';

        // Remember meが有効な場合は30日、無効な場合は7日の有効期限
        $expiresAt = $rememberMe ? now()->addDays(30) : now()->addDays(7);

        $token = $user->createToken($tokenName, ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * ユーザーログアウト
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
