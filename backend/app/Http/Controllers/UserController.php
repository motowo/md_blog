<?php

namespace App\Http\Controllers;

use App\Models\AvatarFile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get current user profile.
     */
    public function profile(): JsonResponse
    {
        $user = Auth::user();

        return response()->json($user);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::user();

        $request->validate([
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
            'bio' => 'nullable|string|max:1000',
            'career_description' => 'nullable|string|max:2000',
            'x_url' => 'nullable|url|max:255',
            'github_url' => 'nullable|url|max:255',
            'profile_public' => 'boolean',
        ]);

        $user->update($request->only([
            'name',
            'username',
            'email',
            'bio',
            'career_description',
            'x_url',
            'github_url',
            'profile_public',
        ]));

        return response()->json([
            'message' => 'プロフィールを更新しました',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Upload avatar image.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB limit
            'crop_data' => 'nullable|array',
            'crop_data.x' => 'nullable|numeric',
            'crop_data.y' => 'nullable|numeric',
            'crop_data.width' => 'nullable|numeric',
            'crop_data.height' => 'nullable|numeric',
            'crop_data.zoom' => 'nullable|numeric|between:0.1,3',
        ]);

        $user = Auth::user();
        $file = $request->file('avatar');
        $cropData = $request->input('crop_data');

        // Get image dimensions
        $imageInfo = getimagesize($file->getPathname());
        $width = $imageInfo[0];
        $height = $imageInfo[1];

        // Generate unique filename
        $storedFilename = uniqid().'.'.$file->getClientOriginalExtension();

        // Store the original file temporarily
        $tempPath = $file->storeAs('temp', 'temp_'.$storedFilename, 'public');
        $fullTempPath = Storage::disk('public')->path($tempPath);

        // If crop data is provided, crop the image
        if ($cropData) {
            $croppedPath = $this->cropImage($fullTempPath, $cropData, $storedFilename);
            $path = 'avatars/'.$storedFilename;

            // Clean up temp file
            Storage::disk('public')->delete($tempPath);
        } else {
            // Move temp file to avatars directory
            $path = $file->storeAs('avatars', $storedFilename, 'public');
            Storage::disk('public')->delete($tempPath);
        }

        // Deactivate old avatar files
        $user->avatarFiles()->update(['is_active' => false]);

        // Create avatar file record
        $avatarFile = AvatarFile::create([
            'user_id' => $user->id,
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename' => $storedFilename,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'crop_data' => $cropData,
            'is_active' => true,
        ]);

        // Update user avatar_path for backward compatibility
        $user->update(['avatar_path' => $path]);

        return response()->json([
            'message' => 'アバター画像をアップロードしました',
            'avatar_file' => $avatarFile,
            'avatar_url' => Storage::url($path),
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Update avatar crop data.
     */
    public function updateAvatarCrop(Request $request, AvatarFile $avatarFile): JsonResponse
    {
        $user = Auth::user();

        if ($avatarFile->user_id !== $user->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $request->validate([
            'crop_data' => 'required|array',
            'crop_data.x' => 'required|numeric',
            'crop_data.y' => 'required|numeric',
            'crop_data.width' => 'required|numeric',
            'crop_data.height' => 'required|numeric',
            'crop_data.zoom' => 'nullable|numeric|between:0.1,3',
        ]);

        $avatarFile->update([
            'crop_data' => $request->input('crop_data'),
        ]);

        return response()->json([
            'message' => 'トリミング情報を更新しました',
            'avatar_file' => $avatarFile->fresh(),
        ]);
    }

    /**
     * Delete avatar file.
     */
    public function deleteAvatar(AvatarFile $avatarFile): JsonResponse
    {
        $user = Auth::user();

        if ($avatarFile->user_id !== $user->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        // Delete file from storage
        if (Storage::exists($avatarFile->file_path)) {
            Storage::delete($avatarFile->file_path);
        }

        // Delete database record
        $avatarFile->delete();

        // If this was the active avatar, clear user's avatar_path
        if ($avatarFile->is_active) {
            $user->update(['avatar_path' => null]);
        }

        return response()->json([
            'message' => 'アバター画像を削除しました',
        ]);
    }

    /**
     * Get user's avatar files.
     */
    public function getAvatarFiles(): JsonResponse
    {
        $user = Auth::user();
        $avatarFiles = $user->avatarFiles()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'avatar_files' => $avatarFiles,
        ]);
    }

    /**
     * Get user article posting activity for heatmap.
     */
    public function getArticleActivity(?\App\Models\User $user = null): JsonResponse
    {
        // userパラメータが指定されていない場合は認証ユーザーを使用
        if (! $user) {
            $user = Auth::user();
        }

        $activities = $user->getArticleActivity();

        return response()->json([
            'activities' => $activities,
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (! password_verify($request->current_password, $user->password)) {
            return response()->json([
                'message' => '現在のパスワードが正しくありません',
            ], 400);
        }

        $user->update([
            'password' => bcrypt($request->new_password),
        ]);

        return response()->json([
            'message' => 'パスワードを変更しました',
        ]);
    }

    /**
     * Delete user account.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user();

        if (! password_verify($request->password, $user->password)) {
            return response()->json([
                'message' => 'パスワードが正しくありません',
            ], 400);
        }

        // Delete user avatar if exists
        if ($user->avatar_path && Storage::exists($user->avatar_path)) {
            Storage::delete($user->avatar_path);
        }

        // Logout and delete user
        $user->tokens()->delete(); // Delete all tokens
        $user->delete();

        return response()->json([
            'message' => 'アカウントを削除しました',
        ]);
    }

    /**
     * Crop image based on provided crop data.
     */
    private function cropImage(string $sourcePath, array $cropData, string $filename): string
    {
        // Get image info
        $imageInfo = getimagesize($sourcePath);
        if (! $imageInfo) {
            throw new \Exception('Invalid image file');
        }

        $sourceWidth = $imageInfo[0];
        $sourceHeight = $imageInfo[1];
        $mimeType = $imageInfo['mime'];

        // Create source image resource
        switch ($mimeType) {
            case 'image/jpeg':
                $sourceImage = imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $sourceImage = imagecreatefrompng($sourcePath);
                break;
            case 'image/gif':
                $sourceImage = imagecreatefromgif($sourcePath);
                break;
            default:
                throw new \Exception('Unsupported image format');
        }

        if (! $sourceImage) {
            throw new \Exception('Failed to create image resource');
        }

        // Calculate crop dimensions
        $cropX = max(0, (int) $cropData['x']);
        $cropY = max(0, (int) $cropData['y']);
        $cropWidth = min($sourceWidth - $cropX, (int) $cropData['width']);
        $cropHeight = min($sourceHeight - $cropY, (int) $cropData['height']);

        // Ensure square crop
        $cropSize = min($cropWidth, $cropHeight);

        // Create cropped image (256x256 for avatar)
        $avatarSize = 256;
        $croppedImage = imagecreatetruecolor($avatarSize, $avatarSize);

        // Preserve transparency for PNG
        if ($mimeType === 'image/png') {
            imagealphablending($croppedImage, false);
            imagesavealpha($croppedImage, true);
            $transparent = imagecolorallocatealpha($croppedImage, 255, 255, 255, 127);
            imagefill($croppedImage, 0, 0, $transparent);
        }

        // Copy and resize the cropped area
        imagecopyresampled(
            $croppedImage,
            $sourceImage,
            0, 0,
            $cropX, $cropY,
            $avatarSize, $avatarSize,
            $cropSize, $cropSize
        );

        // Save cropped image
        $avatarPath = Storage::disk('public')->path('avatars/'.$filename);

        // Ensure avatars directory exists
        $avatarDir = dirname($avatarPath);
        if (! is_dir($avatarDir)) {
            mkdir($avatarDir, 0755, true);
        }

        $saved = false;
        switch ($mimeType) {
            case 'image/jpeg':
                $saved = imagejpeg($croppedImage, $avatarPath, 90);
                break;
            case 'image/png':
                $saved = imagepng($croppedImage, $avatarPath, 8);
                break;
            case 'image/gif':
                $saved = imagegif($croppedImage, $avatarPath);
                break;
        }

        // Clean up resources
        imagedestroy($sourceImage);
        imagedestroy($croppedImage);

        if (! $saved) {
            throw new \Exception('Failed to save cropped image');
        }

        return $avatarPath;
    }
}
