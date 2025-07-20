<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class GeneralUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => '田中 太郎',
                'username' => 'tanaka_taro',
                'email' => 'tanaka@example.com',
                'password' => 'taro2024',
            ],
            [
                'name' => '佐藤 花子',
                'username' => 'sato_hanako',
                'email' => 'sato@example.com',
                'password' => 'hanako123',
            ],
            [
                'name' => '山田 次郎',
                'username' => 'yamada_jiro',
                'email' => 'yamada@example.com',
                'password' => 'jiro2024',
            ],
            [
                'name' => '高橋 美咲',
                'username' => 'takahashi_misaki',
                'email' => 'takahashi@example.com',
                'password' => 'misaki123',
            ],
            [
                'name' => '伊藤 健太',
                'username' => 'ito_kenta',
                'email' => 'ito@example.com',
                'password' => 'kenta2024',
            ],
            [
                'name' => '渡辺 愛美',
                'username' => 'watanabe_manami',
                'email' => 'watanabe@example.com',
                'password' => 'manami123',
            ],
            [
                'name' => '中村 大輔',
                'username' => 'nakamura_daisuke',
                'email' => 'nakamura@example.com',
                'password' => 'daisuke2024',
            ],
            [
                'name' => '小林 真由美',
                'username' => 'kobayashi_mayumi',
                'email' => 'kobayashi@example.com',
                'password' => 'mayumi123',
            ],
            [
                'name' => '加藤 雄一',
                'username' => 'kato_yuichi',
                'email' => 'kato@example.com',
                'password' => 'yuichi2024',
            ],
            [
                'name' => '吉田 智子',
                'username' => 'yoshida_tomoko',
                'email' => 'yoshida@example.com',
                'password' => 'tomoko123',
            ],
        ];

        foreach ($users as $userData) {
            // 既にメールアドレスが存在するかチェック
            if (! User::where('email', $userData['email'])->exists()) {
                $user = new User;
                $user->name = $userData['name'];
                $user->username = $userData['username'];
                $user->email = $userData['email'];
                $user->password = $userData['password']; // モデルのキャストでハッシュ化される
                $user->role = 'author'; // 一般ユーザーは author 役割
                $user->email_verified_at = now();
                $user->save();

                $this->command->info("一般ユーザーを作成しました: {$userData['email']}");
            } else {
                $this->command->info("ユーザーは既に存在します: {$userData['email']}");
            }
        }

        $this->command->info('一般ユーザー10名の作成が完了しました');
        $this->command->info('パスワードは各ユーザーの名前から連想される個別のものです');
    }
}
