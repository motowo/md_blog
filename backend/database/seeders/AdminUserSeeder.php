<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 管理者アカウントがすでに存在するかチェック
        $adminEmail = 'admin@md-blog.local';

        if (! User::where('email', $adminEmail)->exists()) {
            $user = new User;
            $user->name = 'システム管理者';
            $user->username = 'admin';
            $user->email = $adminEmail;
            $user->password = 'password123'; // Let the model cast handle hashing
            $user->role = 'admin';
            $user->email_verified_at = now();
            $user->save();

            $this->command->info('管理者アカウントを作成しました');
            $this->command->info('Email: '.$adminEmail);
            $this->command->info('Password: password123');
        } else {
            $this->command->info('管理者アカウントは既に存在します');
        }
    }
}
