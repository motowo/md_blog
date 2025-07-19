<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
            User::create([
                'name' => 'システム管理者',
                'username' => 'admin',
                'email' => $adminEmail,
                'password' => Hash::make('admin123!'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);

            $this->command->info('管理者アカウントを作成しました');
            $this->command->info('Email: '.$adminEmail);
            $this->command->info('Password: admin123!');
        } else {
            $this->command->info('管理者アカウントは既に存在します');
        }
    }
}
