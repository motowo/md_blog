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
     * @param  int  $size  Avatar size in pixels (default: 200)
     */
    public function generateDefaultAvatar(User $user, int $size = 200): AvatarFile
    {
        // ユーザー固有のシードを作成
        $baseData = $user->id.$user->email.$user->username.$user->created_at->timestamp;
        $seed = hash('sha256', $baseData.'avatar_v4');

        // カスタムジオメトリックアバターを生成
        $imageData = $this->generateGeometricAvatar($seed, $size);

        // BASE64エンコード
        $base64Data = 'data:image/png;base64,'.base64_encode($imageData);

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
        $user->update(['avatar_path' => 'avatar_file_'.$avatarFile->id]);

        return $avatarFile;
    }

    /**
     * Check if user has an active avatar.
     */
    public function hasAvatar(User $user): bool
    {
        return $user->avatarFiles()->active()->exists();
    }

    /**
     * Generate default avatars for users without avatars.
     *
     * @param  int|null  $limit  Number of users to process (null for all)
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
                \Log::error("Failed to generate avatar for user {$user->id}: ".$e->getMessage());
            }
        }

        return $count;
    }

    /**
     * Regenerate default avatar for a user.
     */
    public function regenerateDefaultAvatar(User $user, int $size = 200): AvatarFile
    {
        return $this->generateDefaultAvatar($user, $size);
    }

    /**
     * Convert HSL to RGB.
     *
     * @param  float  $h  Hue (0-1)
     * @param  float  $s  Saturation (0-1)
     * @param  float  $l  Lightness (0-1)
     * @return array RGB values [r, g, b] (0-255)
     */
    private function hslToRgb(float $h, float $s, float $l): array
    {
        if ($s == 0) {
            $r = $g = $b = $l; // achromatic
        } else {
            $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
            $p = 2 * $l - $q;
            $r = $this->hueToRgb($p, $q, $h + 1 / 3);
            $g = $this->hueToRgb($p, $q, $h);
            $b = $this->hueToRgb($p, $q, $h - 1 / 3);
        }

        return [
            round($r * 255),
            round($g * 255),
            round($b * 255),
        ];
    }

    /**
     * Helper function for HSL to RGB conversion.
     */
    private function hueToRgb(float $p, float $q, float $t): float
    {
        if ($t < 0) {
            $t += 1;
        }
        if ($t > 1) {
            $t -= 1;
        }
        if ($t < 1 / 6) {
            return $p + ($q - $p) * 6 * $t;
        }
        if ($t < 1 / 2) {
            return $q;
        }
        if ($t < 2 / 3) {
            return $p + ($q - $p) * (2 / 3 - $t) * 6;
        }

        return $p;
    }

    /**
     * Generate a custom geometric avatar using PHP GD.
     *
     * @return string PNG image data
     */
    private function generateGeometricAvatar(string $seed, int $size): string
    {
        // シードから数値を生成
        $hash = md5($seed);
        $values = [];
        for ($i = 0; $i < 32; $i += 2) {
            $values[] = hexdec(substr($hash, $i, 2));
        }

        // 画像を作成
        $im = imagecreatetruecolor($size, $size);

        // 背景色（白）
        $white = imagecolorallocate($im, 255, 255, 255);
        imagefill($im, 0, 0, $white);

        // メインカラーを生成（HSLベース）
        $hue = ($values[0] / 255) * 360;
        $saturation = 0.7;
        $lightness = 0.5;
        $rgb = $this->hslToRgb($hue / 360, $saturation, $lightness);
        $mainColor = imagecolorallocate($im, $rgb[0], $rgb[1], $rgb[2]);

        // 5x5グリッドでシンメトリックパターンを作成
        $gridSize = 5;
        $cellSize = $size / $gridSize;

        for ($y = 0; $y < $gridSize; $y++) {
            for ($x = 0; $x < intval($gridSize / 2) + 1; $x++) {
                $index = $y * intval($gridSize / 2) + $x;
                if ($index < count($values) && $values[$index] > 127) {
                    // 左側に描画
                    imagefilledrectangle(
                        $im,
                        $x * $cellSize,
                        $y * $cellSize,
                        ($x + 1) * $cellSize - 1,
                        ($y + 1) * $cellSize - 1,
                        $mainColor
                    );

                    // 対称の右側に描画（中央以外）
                    if ($x !== intval($gridSize / 2)) {
                        $mirrorX = $gridSize - 1 - $x;
                        imagefilledrectangle(
                            $im,
                            $mirrorX * $cellSize,
                            $y * $cellSize,
                            ($mirrorX + 1) * $cellSize - 1,
                            ($y + 1) * $cellSize - 1,
                            $mainColor
                        );
                    }
                }
            }
        }

        // PNG形式で出力
        ob_start();
        imagepng($im);
        $imageData = ob_get_contents();
        ob_end_clean();

        imagedestroy($im);

        return $imageData;
    }
}
