<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 管理者アカウント
        $this->createAdminUser();

        // 一般ユーザーアカウント
        $this->createGeneralUsers();
    }

    /**
     * 管理者アカウントを作成
     */
    private function createAdminUser(): void
    {
        $adminEmail = 'admin@md-blog.local';

        if (! User::where('email', $adminEmail)->exists()) {
            $user = new User;
            $user->name = 'システム管理者';
            $user->username = 'admin';
            $user->email = $adminEmail;
            $user->password = 'password123';
            $user->role = 'admin';
            $user->email_verified_at = now();
            // 管理者は最近ログインしたことにする（3日前の14時）
            $user->last_login_at = now()->subDays(3)->setTime(14, 30);
            $user->save();

            $this->command->info('管理者アカウントを作成しました');
            $this->command->info('Email: '.$adminEmail);
            $this->command->info('Password: password123');
        } else {
            $this->command->info('管理者アカウントは既に存在します');
        }
    }

    /**
     * 一般ユーザーアカウントを作成
     */
    private function createGeneralUsers(): void
    {
        $users = [
            [
                'name' => '田中 太郎',
                'username' => 'tanaka_taro',
                'email' => 'tanaka@example.com',
                'password' => 'taro2024',
                'bio' => 'フルスタックエンジニアとして10年以上の経験を持つ技術者です。JavaScript/TypeScript、React、Node.js、PHP/Laravelを中心とした現代的なWebアプリケーション開発を専門としています。技術記事の執筆を通じて、開発者コミュニティに知識を還元することを心がけています。',
                'career_description' => '大手IT企業でのシステムエンジニア（5年）→スタートアップでのテックリード（3年）→現在はフリーランスとしてWebアプリケーション開発に従事。複数のプロダクトを立ち上げから運用まで経験し、現在は技術顧問としても活動中。',
                'x_url' => 'https://x.com/reactjs',
                'github_url' => 'https://github.com/reactjs/react.dev',
            ],
            [
                'name' => '佐藤 花子',
                'username' => 'sato_hanako',
                'email' => 'sato@example.com',
                'password' => 'hanako123',
                'bio' => 'TypeScriptとReactを専門とするフロントエンドエンジニアです。ユーザビリティとアクセシビリティを重視した設計を得意としており、大規模なWebアプリケーションの開発経験が豊富です。技術記事執筆とOSS活動にも積極的に取り組んでいます。',
                'career_description' => 'Web制作会社でのフロントエンドエンジニア（4年）→事業会社でのシニアフロントエンドエンジニア（4年）→現在はフリーランスとしてReact/TypeScript案件を中心に活動。技術ブログ執筆とコミュニティ活動にも注力。',
                'x_url' => 'https://x.com/reactjs',
                'github_url' => 'https://github.com/reactjs/react.dev',
            ],
            [
                'name' => '山田 次郎',
                'username' => 'yamada_jiro',
                'email' => 'yamada@example.com',
                'password' => 'jiro2024',
                'bio' => 'プログラミング初学者向けの教育コンテンツ制作を中心に活動しています。JavaScript、Python、Go言語などの基礎から応用まで幅広くカバーし、わかりやすい技術解説を心がけています。誰でもプログラミングを楽しく学べる環境づくりに貢献したいと考えています。',
                'career_description' => 'システムインテグレーター（3年）→教育系スタートアップでのエンジニア兼講師（4年）→現在は独立してプログラミング教育コンテンツの制作と初学者向けメンタリングを提供。無料コンテンツでの知識共有を重視。',
                'x_url' => 'https://x.com/laravelphp',
                'github_url' => 'https://github.com/laravel/framework',
            ],
            [
                'name' => '高橋 美咲',
                'username' => 'takahashi_misaki',
                'email' => 'takahashi@example.com',
                'password' => 'misaki123',
                'bio' => null, // 3割のユーザーが未記入
                'career_description' => null,
                'x_url' => null,
                'github_url' => null,
            ],
            [
                'name' => '伊藤 健太',
                'username' => 'ito_kenta',
                'email' => 'ito@example.com',
                'password' => 'kenta2024',
                'bio' => null, // 3割のユーザーが未記入
                'career_description' => null,
                'x_url' => null,
                'github_url' => null,
            ],
            [
                'name' => '渡辺 愛美',
                'username' => 'watanabe_manami',
                'email' => 'watanabe@example.com',
                'password' => 'manami123',
                'bio' => null, // 3割のユーザーが未記入
                'career_description' => null,
                'x_url' => null,
                'github_url' => null,
            ],
            [
                'name' => '中村 大輔',
                'username' => 'nakamura_daisuke',
                'email' => 'nakamura@example.com',
                'password' => 'daisuke2024',
                'bio' => 'バックエンドエンジニアとしてPHP/Laravel、MySQL、AWS等を使用したWebサービス開発に取り組んでいます。API設計からインフラ構築まで幅広く経験し、スケーラブルなシステム構築を得意としています。技術記事を通じてバックエンド開発の知識を共有しています。',
                'career_description' => 'SIerでの業務システム開発（2年）→Web系企業でのバックエンドエンジニア（5年）→現在はテックリードとしてチーム開発をリード。Laravel、AWS、Docker等を活用したモダンな開発手法を推進。',
                'x_url' => 'https://x.com/laravelphp',
                'github_url' => 'https://github.com/laravel/framework',
            ],
            [
                'name' => '小林 真由美',
                'username' => 'kobayashi_mayumi',
                'email' => 'kobayashi@example.com',
                'password' => 'mayumi123',
                'bio' => 'UI/UXデザインとフロントエンド開発の両方を手がけるデザインエンジニアです。Figmaでのデザイン設計からReact/Vue.jsでの実装まで一貫して担当。ユーザー中心の設計思想でプロダクト開発に貢献し、デザインシステム構築にも注力しています。',
                'career_description' => 'デザイン事務所でのWebデザイナー（3年）→IT企業でのデザインエンジニア（4年）→現在はフリーランスとしてデザイン・開発の両面でプロダクト制作に携わる。デザインツール活用とフロントエンド技術の融合を探求。',
                'x_url' => 'https://x.com/reactjs',
                'github_url' => null,
            ],
            [
                'name' => '加藤 雄一',
                'username' => 'kato_yuichi',
                'email' => 'kato@example.com',
                'password' => 'yuichi2024',
                'bio' => 'インフラエンジニアとしてAWS、Docker、Kubernetesを活用したクラウドネイティブな環境構築を専門としています。CI/CDパイプラインの設計・構築からモニタリング・運用まで幅広く担当し、開発チームの生産性向上に貢献しています。',
                'career_description' => 'オンプレミスでのインフラ運用（3年）→クラウドインフラエンジニアとしてAWS案件を多数担当（4年）→現在はDevOpsエンジニアとして開発・運用の両面でチームをサポート。コンテナ技術とCI/CDの専門知識を活用。',
                'x_url' => null,
                'github_url' => 'https://github.com/laravel/framework',
            ],
            [
                'name' => '吉田 智子',
                'username' => 'yoshida_tomoko',
                'email' => 'yoshida@example.com',
                'password' => 'tomoko123',
                'bio' => 'データサイエンス分野でPythonを中心としたデータ分析・機械学習システムの開発を行っています。Django、pandas、scikit-learnを活用したWebアプリケーション開発から、データ可視化まで幅広くカバー。データドリブンな課題解決を得意としています。',
                'career_description' => '金融系システム開発（2年）→データ分析会社でのデータサイエンティスト（3年）→現在はフリーランスとしてPython/Djangoを活用したデータ分析システムの構築とコンサルティングを提供。統計解析と機械学習の実用化に注力。',
                'x_url' => null,
                'github_url' => null,
            ],
        ];

        foreach ($users as $key => $userData) {
            if (! User::where('email', $userData['email'])->exists()) {
                $user = new User;
                $user->name = $userData['name'];
                $user->username = $userData['username'];
                $user->email = $userData['email'];
                $user->password = $userData['password'];
                $user->role = 'author';
                $user->email_verified_at = now();

                // プロフィール情報を設定
                $user->bio = $userData['bio'];
                $user->career_description = $userData['career_description'];
                $user->x_url = $userData['x_url'];
                $user->github_url = $userData['github_url'];

                // 最終ログイン日時を固定設定（ユーザーごとに異なる固定値）
                $fixedDays = ($key % 10) + 5;  // 5-14日前の範囲で固定
                $fixedHour = 9 + ($key % 12);  // 9-20時の範囲で固定
                $user->last_login_at = now()->subDays($fixedDays)->setTime($fixedHour, 0);
                $user->save();

                $profileInfo = $user->bio ? '（プロフィール設定済み）' : '（プロフィール未設定）';
                $this->command->info("一般ユーザーを作成しました: {$userData['email']} {$profileInfo}");
            } else {
                $this->command->info("ユーザーは既に存在します: {$userData['email']}");
            }
        }

        $this->command->info('一般ユーザー10名の作成が完了しました');
        $this->command->info('パスワードは各ユーザーの名前から連想される個別のものです');

        // 統計情報を表示
        $this->showUserStatistics();
    }

    /**
     * ユーザー統計情報を表示
     */
    private function showUserStatistics(): void
    {
        $totalUsers = User::where('role', 'author')->count();
        $usersWithBio = User::where('role', 'author')->whereNotNull('bio')->count();
        $usersWithCareer = User::where('role', 'author')->whereNotNull('career_description')->count();
        $usersWithX = User::where('role', 'author')->whereNotNull('x_url')->count();
        $usersWithGithub = User::where('role', 'author')->whereNotNull('github_url')->count();

        $this->command->info('=== ユーザープロフィール統計 ===');
        $this->command->info("総ユーザー数: {$totalUsers}");
        $this->command->info("自己紹介設定済み: {$usersWithBio}名（".round(($usersWithBio / $totalUsers) * 100, 1).'%）');
        $this->command->info("経歴設定済み: {$usersWithCareer}名（".round(($usersWithCareer / $totalUsers) * 100, 1).'%）');
        $this->command->info("X URL設定済み: {$usersWithX}名（".round(($usersWithX / $totalUsers) * 100, 1).'%）');
        $this->command->info("GitHub URL設定済み: {$usersWithGithub}名（".round(($usersWithGithub / $totalUsers) * 100, 1).'%）');
    }
}
