<?php

namespace App\Services;

use App\Models\AvatarFile;
use App\Models\User;
use Jdenticon\Identicon;

class AvatarService
{
    /**
     * Generate a default avatar for a user using Identicon.
     *
     * @param User $user
     * @param int $size Avatar size in pixels (default: 200)
     * @return AvatarFile
     */
    public function generateDefaultAvatar(User $user, int $size = 200): AvatarFile
    {
        // ユーザーのIDとemailとusernameを組み合わせてユニークな文字列を作成
        $seed = $user->id . '_' . $user->email . '_' . $user->username . '_' . $user->created_at->timestamp;
        
        // Identiconを生成
        $identicon = new Identicon();
        $imageData = $identicon->getImageData($seed, $size);
        
        // BASE64エンコード
        $base64Data = 'data:image/png;base64,' . base64_encode($imageData);
        
        // 既存のアバターを非アクティブにする
        $user->avatarFiles()->update(['is_active' => false]);
        
        // 新しいアバターファイルを作成
        $avatarFile = AvatarFile::create([
            'user_id' => $user->id,
            'original_filename' => 'default_avatar.png',
            'base64_data' => $base64Data,
            'mime_type' => 'image/png',
            'file_size' => strlen($imageData),
            'width' => $size,
            'height' => $size,
            'crop_data' => null,
            'is_active' => true,
        ]);
        
        // ユーザーのavatar_pathを更新
        $user->update(['avatar_path' => 'avatar_file_' . $avatarFile->id]);
        
        return $avatarFile;
    }
    
    /**
     * Check if user has an active avatar.
     *
     * @param User $user
     * @return bool
     */
    public function hasAvatar(User $user): bool
    {
        return $user->avatarFiles()->active()->exists();
    }
    
    /**
     * Generate default avatars for users without avatars.
     *
     * @param int|null $limit Number of users to process (null for all)
     * @return int Number of avatars created
     */
    public function generateMissingDefaultAvatars(?int $limit = null): int
    {
        $query = User::whereDoesntHave('avatarFiles', function ($query) {
            $query->where('is_active', true);
        });
        
        if ($limit) {
            $query->limit($limit);
        }
        
        $usersWithoutAvatar = $query->get();
        $count = 0;
        
        foreach ($usersWithoutAvatar as $user) {
            try {
                $this->generateDefaultAvatar($user);
                $count++;
            } catch (\Exception $e) {
                // ログに記録するが処理は継続
                \Log::error("Failed to generate avatar for user {$user->id}: " . $e->getMessage());
            }
        }
        
        return $count;
    }
    
    /**
     * Regenerate default avatar for a user.
     *
     * @param User $user
     * @param int $size
     * @return AvatarFile
     */
    public function regenerateDefaultAvatar(User $user, int $size = 200): AvatarFile
    {
        return $this->generateDefaultAvatar($user, $size);
    }
}