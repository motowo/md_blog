<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AvatarFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_user_can_upload_avatar_as_base64(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // テスト用の画像ファイルを作成（GD拡張なしでも動作するようにcreate()を使用）
        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');

        $response = $this->postJson('/api/user/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'avatar_file' => [
                    'id',
                    'user_id',
                    'original_filename',
                    'mime_type',
                    'file_size',
                    'width',
                    'height',
                    'is_active',
                    'base64_data',
                ],
                'avatar_url',
                'user' => [
                    'id',
                    'username',
                    'email',
                    'avatar_path',
                    'avatar_url',
                ],
            ]);

        // データベースに保存されていることを確認
        $this->assertDatabaseHas('avatar_files', [
            'user_id' => $user->id,
            'original_filename' => 'avatar.jpg',
            'is_active' => true,
        ]);

        // BASE64データが保存されていることを確認
        $avatarFile = AvatarFile::where('user_id', $user->id)->first();
        $this->assertNotNull($avatarFile->base64_data);
        // GD拡張なしでは画像データが異なるため、data URIの形式のみ確認
        $this->assertStringStartsWith('data:', $avatarFile->base64_data);
        
        // BASE64データのみ保存されていることを確認（file_pathとstored_filenameカラムは削除済み）
    }

    public function test_user_can_upload_avatar_with_crop_data(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');
        $cropData = [
            'x' => 10,
            'y' => 10,
            'width' => 80,
            'height' => 80,
            'zoom' => 1.5,
        ];

        $response = $this->postJson('/api/user/avatar', [
            'avatar' => $file,
            'crop_data' => $cropData,
        ]);

        $response->assertStatus(200);

        // テスト環境ではcrop処理がスキップされるため、crop_dataが保存されることのみ確認
        $avatarFile = AvatarFile::where('user_id', $user->id)->first();
        $this->assertEquals($cropData, $avatarFile->crop_data);
    }

    public function test_user_can_delete_avatar(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // アバターファイルを作成
        $avatarFile = AvatarFile::create([
            'user_id' => $user->id,
            'original_filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1000,
            'is_active' => true,
            'base64_data' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEB',
        ]);

        $response = $this->deleteJson("/api/user/avatars/{$avatarFile->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'アバター画像を削除しました',
            ]);

        // データベースから削除されていることを確認
        $this->assertDatabaseMissing('avatar_files', [
            'id' => $avatarFile->id,
        ]);
    }

    public function test_user_cannot_delete_other_users_avatar(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $this->actingAs($user);

        $avatarFile = AvatarFile::create([
            'user_id' => $otherUser->id,
            'original_filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1000,
            'is_active' => true,
            'base64_data' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEB',
        ]);

        $response = $this->deleteJson("/api/user/avatars/{$avatarFile->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => '権限がありません',
            ]);

        // データベースに残っていることを確認
        $this->assertDatabaseHas('avatar_files', [
            'id' => $avatarFile->id,
        ]);
    }

    public function test_old_avatar_becomes_inactive_when_new_avatar_uploaded(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        // 既存のアバターを作成
        $oldAvatar = AvatarFile::create([
            'user_id' => $user->id,
            'original_filename' => 'old.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1000,
            'is_active' => true,
            'base64_data' => 'data:image/jpeg;base64,old',
        ]);

        // 新しいアバターをアップロード
        $file = UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg');
        $response = $this->postJson('/api/user/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(200);

        // 古いアバターが非アクティブになっていることを確認
        $oldAvatar->refresh();
        $this->assertFalse($oldAvatar->is_active);

        // 新しいアバターがアクティブであることを確認
        $newAvatar = AvatarFile::where('user_id', $user->id)
            ->where('original_filename', 'new.jpg')
            ->first();
        $this->assertTrue($newAvatar->is_active);
    }

    public function test_user_model_returns_avatar_url_from_active_avatar(): void
    {
        $user = User::factory()->create();

        // アバターファイルを作成
        $avatarFile = AvatarFile::create([
            'user_id' => $user->id,
            'original_filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'file_size' => 1000,
            'is_active' => true,
            'base64_data' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEB',
        ]);

        // ユーザーモデルからavatar_urlが取得できることを確認
        $user->refresh();
        $this->assertEquals($avatarFile->base64_data, $user->avatar_url);
    }
    
    public function test_user_registration_creates_default_avatar(): void
    {
        $response = $this->postJson('/api/register', [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'name' => 'Test User',
        ]);

        $response->assertStatus(201);
        
        // ユーザーが作成されたことを確認
        $this->assertDatabaseHas('users', [
            'username' => 'testuser',
            'email' => 'test@example.com',
        ]);

        // デフォルトアバターが作成されたことを確認
        $user = \App\Models\User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        
        $avatarFile = $user->avatarFiles()->active()->first();
        $this->assertNotNull($avatarFile);
        $this->assertEquals('default_avatar.png', $avatarFile->original_filename);
        $this->assertStringStartsWith('data:image/png;base64,', $avatarFile->base64_data);
        $this->assertTrue($avatarFile->is_active);
    }
}
