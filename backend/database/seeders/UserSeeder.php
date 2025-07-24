<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\AvatarService;
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

        // 一般ユーザーアカウント（30名）
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
            $user->profile_public = false; // 管理者は非公開
            $user->last_login_at = now()->subDays(3)->setTime(14, 30);
            $user->save();

            // 管理者にもデフォルトアバターを生成
            $avatarService = new AvatarService();
            $avatarService->generateDefaultAvatar($user);

            $this->command->info('管理者アカウントを作成しました（アバター付き）');
            $this->command->info('Email: '.$adminEmail);
            $this->command->info('Password: password123');
        } else {
            $this->command->info('管理者アカウントは既に存在します');
        }
    }

    /**
     * 一般ユーザーアカウントを作成（30名）
     */
    private function createGeneralUsers(): void
    {
        $users = [
            // 超アクティブユーザー（6名） - 年200記事以上
            [
                'name' => '田中 太郎', 'username' => 'tanaka_taro', 'email' => 'tanaka@example.com', 'password' => 'taro2024',
                'bio' => 'フルスタックエンジニアとして10年以上の経験を持つ技術者です。JavaScript/TypeScript、React、Node.js、PHP/Laravelを中心とした現代的なWebアプリケーション開発を専門としています。',
                'career_description' => '大手IT企業でのシステムエンジニア（5年）→スタートアップでのテックリード（3年）→現在はフリーランスとしてWebアプリケーション開発に従事。',
                'x_url' => 'https://x.com/reactjs', 'github_url' => 'https://github.com/reactjs/react.dev',
                'profile_public' => true, 'activity_level' => 'super_active', 'specialty' => 'fullstack',
            ],
            [
                'name' => '佐藤 花子', 'username' => 'sato_hanako', 'email' => 'sato@example.com', 'password' => 'hanako123',
                'bio' => 'TypeScriptとReactを専門とするフロントエンドエンジニアです。ユーザビリティとアクセシビリティを重視した設計を得意としており、大規模なWebアプリケーションの開発経験が豊富です。',
                'career_description' => 'Web制作会社でのフロントエンドエンジニア（4年）→事業会社でのシニアフロントエンドエンジニア（4年）→現在はフリーランスとしてReact/TypeScript案件を中心に活動。',
                'x_url' => 'https://x.com/reactjs', 'github_url' => 'https://github.com/reactjs/react.dev',
                'profile_public' => true, 'activity_level' => 'super_active', 'specialty' => 'frontend',
            ],
            [
                'name' => '鈴木 一郎', 'username' => 'suzuki_ichiro', 'email' => 'suzuki@example.com', 'password' => 'ichiro2024',
                'bio' => 'Go言語とKubernetesを専門とするバックエンドエンジニアです。マイクロサービス アーキテクチャの設計・構築に豊富な経験を持ち、高トラフィック環境での性能最適化を得意としています。',
                'career_description' => 'スタートアップでのサーバーサイド開発（3年）→メガベンチャーでのマイクロサービス開発リード（4年）→現在は技術顧問として複数企業のアーキテクチャ設計を支援。',
                'x_url' => 'https://x.com/golang', 'github_url' => 'https://github.com/golang/go',
                'profile_public' => true, 'activity_level' => 'super_active', 'specialty' => 'backend',
            ],
            [
                'name' => '高橋 美咲', 'username' => 'takahashi_misaki', 'email' => 'takahashi@example.com', 'password' => 'misaki123',
                'bio' => 'AWSとTerraformを活用したクラウドインフラ設計のスペシャリストです。CI/CDパイプラインの構築から監視・運用の自動化まで、DevOps全般に精通しています。',
                'career_description' => 'オンプレミス運用エンジニア（2年）→クラウドインフラエンジニア（5年）→現在はSREとして複数プロダクトの可用性向上に貢献。',
                'x_url' => 'https://x.com/awscloud', 'github_url' => 'https://github.com/aws/aws-cli',
                'profile_public' => false, 'activity_level' => 'super_active', 'specialty' => 'infrastructure',
            ],
            [
                'name' => '伊藤 健太', 'username' => 'ito_kenta', 'email' => 'ito@example.com', 'password' => 'kenta2024',
                'bio' => 'Python、Django、機械学習を専門とするデータエンジニアです。大規模データ処理基盤の構築とMLOpsの実装に豊富な経験を持ち、ビジネス価値創出に貢献しています。',
                'career_description' => 'データ分析会社でのアナリスト（3年）→AI企業でのMLエンジニア（4年）→現在はデータサイエンス部門のテックリードとしてチームを牽引。',
                'x_url' => 'https://x.com/python', 'github_url' => 'https://github.com/python/cpython',
                'profile_public' => true, 'activity_level' => 'super_active', 'specialty' => 'data_science',
            ],
            [
                'name' => '渡辺 愛美', 'username' => 'watanabe_manami', 'email' => 'watanabe@example.com', 'password' => 'manami123',
                'bio' => 'Vue.js、Nuxt.js、TypeScriptを中心としたモダンフロントエンド開発を専門としています。コンポーネント設計とパフォーマンス最適化に特に力を入れており、大規模SPAの開発経験が豊富です。',
                'career_description' => 'Web制作（2年）→SaaS企業でのフロントエンドエンジニア（5年）→現在はフロントエンドアーキテクトとして技術選定と設計を担当。',
                'x_url' => 'https://x.com/vuejs', 'github_url' => 'https://github.com/vuejs/vue',
                'profile_public' => true, 'activity_level' => 'super_active', 'specialty' => 'frontend',
            ],

            // 中程度アクティブユーザー（18名） - 年50-100記事
            [
                'name' => '中村 大輔', 'username' => 'nakamura_daisuke', 'email' => 'nakamura@example.com', 'password' => 'daisuke2024',
                'bio' => 'バックエンドエンジニアとしてPHP/Laravel、MySQL、AWS等を使用したWebサービス開発に取り組んでいます。API設計からインフラ構築まで幅広く経験し、スケーラブルなシステム構築を得意としています。',
                'career_description' => 'SIerでの業務システム開発（2年）→Web系企業でのバックエンドエンジニア（5年）→現在はテックリードとしてチーム開発をリード。',
                'x_url' => 'https://x.com/laravelphp', 'github_url' => 'https://github.com/laravel/framework',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'backend',
            ],
            [
                'name' => '小林 真由美', 'username' => 'kobayashi_mayumi', 'email' => 'kobayashi@example.com', 'password' => 'mayumi123',
                'bio' => 'UI/UXデザインとフロントエンド開発の両方を手がけるデザインエンジニアです。Figmaでのデザイン設計からReact/Vue.jsでの実装まで一貫して担当しています。',
                'career_description' => 'デザイン事務所でのWebデザイナー（3年）→IT企業でのデザインエンジニア（4年）→現在はフリーランスとしてデザイン・開発の両面でプロダクト制作に携わる。',
                'x_url' => 'https://x.com/reactjs', 'github_url' => null,
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'design',
            ],
            [
                'name' => '加藤 雄一', 'username' => 'kato_yuichi', 'email' => 'kato@example.com', 'password' => 'yuichi2024',
                'bio' => 'インフラエンジニアとしてAWS、Docker、Kubernetesを活用したクラウドネイティブな環境構築を専門としています。CI/CDパイプラインの設計・構築からモニタリング・運用まで幅広く担当しています。',
                'career_description' => 'オンプレミスでのインフラ運用（3年）→クラウドインフラエンジニアとしてAWS案件を多数担当（4年）→現在はDevOpsエンジニアとして開発・運用の両面でチームをサポート。',
                'x_url' => null, 'github_url' => 'https://github.com/laravel/framework',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'infrastructure',
            ],
            [
                'name' => '吉田 智子', 'username' => 'yoshida_tomoko', 'email' => 'yoshida@example.com', 'password' => 'tomoko123',
                'bio' => 'データサイエンス分野でPythonを中心としたデータ分析・機械学習システムの開発を行っています。Django、pandas、scikit-learnを活用したWebアプリケーション開発から、データ可視化まで幅広くカバーしています。',
                'career_description' => '金融系システム開発（2年）→データ分析会社でのデータサイエンティスト（3年）→現在はフリーランスとしてPython/Djangoを活用したデータ分析システムの構築とコンサルティングを提供。',
                'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'moderate', 'specialty' => 'data_science',
            ],
            [
                'name' => '松本 拓也', 'username' => 'matsumoto_takuya', 'email' => 'matsumoto@example.com', 'password' => 'takuya2024',
                'bio' => 'Node.js、Express、MongoDB を使用したサーバーサイド開発とリアルタイム通信システムの構築を専門としています。WebSocket、Socket.ioを活用したチャットアプリケーションやゲーム開発の経験が豊富です。',
                'career_description' => 'ゲーム会社でのサーバーエンジニア（4年）→チャットアプリ開発企業でのバックエンドリード（3年）→現在はリアルタイム通信システムの設計コンサルタント。',
                'x_url' => 'https://x.com/nodejs', 'github_url' => 'https://github.com/nodejs/node',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'backend',
            ],
            [
                'name' => '井上 由美', 'username' => 'inoue_yumi', 'email' => 'inoue@example.com', 'password' => 'yumi2024',
                'bio' => 'SwiftとKotlinを使用したモバイルアプリ開発を専門としています。iOS、Androidの両プラットフォームでの開発経験があり、クロスプラットフォーム開発にも精通しています。',
                'career_description' => 'モバイルアプリ開発会社でのiOSエンジニア（3年）→フリーランスとしてモバイルアプリ開発（4年）→現在は複数企業でモバイル技術アドバイザーとして活動。',
                'x_url' => 'https://x.com/swiftlang', 'github_url' => 'https://github.com/apple/swift',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'mobile',
            ],
            [
                'name' => '木村 慎一', 'username' => 'kimura_shinichi', 'email' => 'kimura@example.com', 'password' => 'shinichi2024',
                'bio' => 'セキュリティエンジニアとしてWebアプリケーションの脆弱性診断とペネトレーションテストを専門としています。セキュアコーディングの指導とセキュリティ基盤の構築に豊富な経験があります。',
                'career_description' => 'セキュリティ会社での診断エンジニア（5年）→金融系企業での情報セキュリティ担当（3年）→現在はセキュリティコンサルタントとして複数企業のセキュリティ強化を支援。',
                'x_url' => null, 'github_url' => null,
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'security',
            ],
            [
                'name' => '林 美穂', 'username' => 'hayashi_miho', 'email' => 'hayashi@example.com', 'password' => 'miho2024',
                'bio' => 'Ruby on Rails を中心としたWebアプリケーション開発を専門としています。MVCアーキテクチャの設計からテスト駆動開発まで、Railsのベストプラクティスを活用した開発を得意としています。',
                'career_description' => 'Web制作会社でのRailsエンジニア（4年）→スタートアップでのシニアエンジニア（3年）→現在はRailsコンサルタントとして技術選定と設計支援を提供。',
                'x_url' => 'https://x.com/rails', 'github_url' => 'https://github.com/rails/rails',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'backend',
            ],
            [
                'name' => '佐々木 健', 'username' => 'sasaki_ken', 'email' => 'sasaki@example.com', 'password' => 'ken2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'moderate', 'specialty' => 'fullstack',
            ],
            [
                'name' => '田村 麻衣', 'username' => 'tamura_mai', 'email' => 'tamura@example.com', 'password' => 'mai2024',
                'bio' => 'QAエンジニアとしてテスト自動化とテスト設計を専門としています。Selenium、Cypress、Playwrightを活用したE2Eテストの構築と、CI/CDパイプラインでの品質保証を得意としています。',
                'career_description' => 'ソフトウェアテスト会社でのテストエンジニア（4年）→Web系企業でのQAリード（3年）→現在は品質管理コンサルタントとしてテスト戦略立案を支援。',
                'x_url' => null, 'github_url' => 'https://github.com/SeleniumHQ/selenium',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'testing',
            ],
            [
                'name' => '森田 悠太', 'username' => 'morita_yuta', 'email' => 'morita@example.com', 'password' => 'yuta2024',
                'bio' => '.NET CoreとC#を使用したエンタープライズアプリケーション開発を専門としています。Azure クラウドサービスの活用とマイクロサービスアーキテクチャの設計に豊富な経験があります。',
                'career_description' => 'SIerでの.NET開発（5年）→外資系企業でのクラウドアーキテクト（3年）→現在は.NETコンサルタントとしてモダナイゼーション支援を提供。',
                'x_url' => 'https://x.com/dotnet', 'github_url' => 'https://github.com/dotnet/core',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'backend',
            ],
            [
                'name' => '藤田 沙織', 'username' => 'fujita_saori', 'email' => 'fujita@example.com', 'password' => 'saori2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'moderate', 'specialty' => 'frontend',
            ],
            [
                'name' => '野口 博', 'username' => 'noguchi_hiroshi', 'email' => 'noguchi@example.com', 'password' => 'hiroshi2024',
                'bio' => 'データベース設計とパフォーマンスチューニングを専門とするデータベースエンジニアです。MySQL、PostgreSQL、MongoDB等のデータベース最適化と大規模データ処理基盤の構築を得意としています。',
                'career_description' => 'システム開発会社でのDB設計（4年）→金融系企業でのDBアドミニストレータ（4年）→現在はデータベースコンサルタントとして性能改善支援を提供。',
                'x_url' => null, 'github_url' => null,
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'database',
            ],
            [
                'name' => '石川 恵子', 'username' => 'ishikawa_keiko', 'email' => 'ishikawa@example.com', 'password' => 'keiko2024',
                'bio' => 'プロダクトマネージャーとしてアジャイル開発とスクラム実践を専門としています。技術的背景を活かした要件定義から開発チームの生産性向上まで、プロダクト開発全般をサポートしています。',
                'career_description' => 'Webエンジニア（3年）→プロダクトオーナー（3年）→現在はプロダクトマネージャーとして複数プロダクトの企画・開発をリード。',
                'x_url' => 'https://x.com/agile', 'github_url' => null,
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'management',
            ],
            [
                'name' => '大野 裕史', 'username' => 'ono_hiroshi', 'email' => 'ono@example.com', 'password' => 'hiroshi2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'moderate', 'specialty' => 'backend',
            ],
            [
                'name' => '村上 直子', 'username' => 'murakami_naoko', 'email' => 'murakami@example.com', 'password' => 'naoko2024',
                'bio' => 'テクニカルライターとして技術ドキュメントの作成と開発者向けコンテンツ制作を専門としています。API ドキュメント、チュートリアル、技術ブログの執筆を通じて技術の普及に貢献しています。',
                'career_description' => 'ソフトウェア開発（3年）→ドキュメンテーションスペシャリスト（4年）→現在はテクニカルライターとして複数企業の技術文書化を支援。',
                'x_url' => 'https://x.com/techwriting', 'github_url' => null,
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'documentation',
            ],
            [
                'name' => '清水 浩二', 'username' => 'shimizu_koji', 'email' => 'shimizu@example.com', 'password' => 'koji2024',
                'bio' => 'ブロックチェーン技術とWeb3開発を専門としています。Ethereum、Solidity を使用したスマートコントラクト開発とDAppsの構築に取り組み、分散型アプリケーションの実用化を推進しています。',
                'career_description' => 'Web開発（3年）→ブロックチェーン企業でのエンジニア（3年）→現在はWeb3コンサルタントとしてブロックチェーン活用支援を提供。',
                'x_url' => 'https://x.com/ethereum', 'github_url' => 'https://github.com/ethereum/go-ethereum',
                'profile_public' => true, 'activity_level' => 'moderate', 'specialty' => 'blockchain',
            ],
            [
                'name' => '長谷川 恵', 'username' => 'hasegawa_megumi', 'email' => 'hasegawa@example.com', 'password' => 'megumi2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'moderate', 'specialty' => 'design',
            ],

            // 無料記事専門ユーザー（3名）
            [
                'name' => '山田 次郎', 'username' => 'yamada_jiro', 'email' => 'yamada@example.com', 'password' => 'jiro2024',
                'bio' => 'プログラミング初学者向けの教育コンテンツ制作を中心に活動しています。JavaScript、Python、Go言語などの基礎から応用まで幅広くカバーし、わかりやすい技術解説を心がけています。',
                'career_description' => 'システムインテグレーター（3年）→教育系スタートアップでのエンジニア兼講師（4年）→現在は独立してプログラミング教育コンテンツの制作と初学者向けメンタリングを提供。',
                'x_url' => 'https://x.com/laravelphp', 'github_url' => 'https://github.com/laravel/framework',
                'profile_public' => true, 'activity_level' => 'free_only', 'specialty' => 'education',
            ],
            [
                'name' => '青木 優子', 'username' => 'aoki_yuko', 'email' => 'aoki@example.com', 'password' => 'yuko2024',
                'bio' => '初学者向けプログラミング教育とHTMLCSSの基礎指導を専門としています。分かりやすい解説とハンズオン形式の学習コンテンツで、プログラミング学習の敷居を下げることを目指しています。',
                'career_description' => 'Web制作（2年）→プログラミングスクール講師（5年）→現在は教育コンテンツ制作者として無料学習リソースの提供に注力。',
                'x_url' => null, 'github_url' => null,
                'profile_public' => true, 'activity_level' => 'free_only', 'specialty' => 'education',
            ],
            [
                'name' => '福田 明', 'username' => 'fukuda_akira', 'email' => 'fukuda@example.com', 'password' => 'akira2024',
                'bio' => 'オープンソースソフトウェアの普及と技術知識の共有を使命として活動しています。LinuxやDockerの基礎から実践的な運用まで、インフラ技術を中心とした教育コンテンツを無料で提供しています。',
                'career_description' => 'インフラエンジニア（6年）→OSS活動家として技術コミュニティ運営（2年）→現在は技術知識の無料共有とオープンソース貢献に専念。',
                'x_url' => 'https://x.com/docker', 'github_url' => 'https://github.com/docker/docker-ce',
                'profile_public' => true, 'activity_level' => 'free_only', 'specialty' => 'infrastructure',
            ],

            // 投稿なしユーザー（3名）
            [
                'name' => '橋本 京子', 'username' => 'hashimoto_kyoko', 'email' => 'hashimoto@example.com', 'password' => 'kyoko2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'none', 'specialty' => null,
            ],
            [
                'name' => '西村 和也', 'username' => 'nishimura_kazuya', 'email' => 'nishimura@example.com', 'password' => 'kazuya2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'none', 'specialty' => null,
            ],
            [
                'name' => '山本 理恵', 'username' => 'yamamoto_rie', 'email' => 'yamamoto@example.com', 'password' => 'rie2024',
                'bio' => null, 'career_description' => null, 'x_url' => null, 'github_url' => null,
                'profile_public' => false, 'activity_level' => 'none', 'specialty' => null,
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
                $user->profile_public = $userData['profile_public'];

                // 最終ログイン日時を固定設定（ユーザーごとに異なる固定値）
                $fixedDays = ($key % 20) + 5;  // 5-24日前の範囲で固定
                $fixedHour = 9 + ($key % 12);  // 9-20時の範囲で固定
                $user->last_login_at = now()->subDays($fixedDays)->setTime($fixedHour, 0);
                $user->save();

                // 各ユーザーにランダムアバターを生成
                $avatarService = new AvatarService();
                $avatarService->generateDefaultAvatar($user);

                $profileInfo = $user->bio ? '（プロフィール設定済み）' : '（プロフィール未設定）';
                $publicInfo = $user->profile_public ? '（公開）' : '（非公開）';
                $this->command->info("一般ユーザーを作成しました: {$userData['email']} {$profileInfo} {$publicInfo} （アバター付き）");
            } else {
                $this->command->info("ユーザーは既に存在します: {$userData['email']}");
            }
        }

        $this->command->info('一般ユーザー30名の作成が完了しました');
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
        $publicProfiles = User::where('role', 'author')->where('profile_public', true)->count();

        $this->command->info('=== ユーザープロフィール統計 ===');
        $this->command->info("総ユーザー数: {$totalUsers}");
        $this->command->info("自己紹介設定済み: {$usersWithBio}名（".round(($usersWithBio / $totalUsers) * 100, 1).'%）');
        $this->command->info("経歴設定済み: {$usersWithCareer}名（".round(($usersWithCareer / $totalUsers) * 100, 1).'%）');
        $this->command->info("X URL設定済み: {$usersWithX}名（".round(($usersWithX / $totalUsers) * 100, 1).'%）');
        $this->command->info("GitHub URL設定済み: {$usersWithGithub}名（".round(($usersWithGithub / $totalUsers) * 100, 1).'%）');
        $this->command->info("プロフィール公開: {$publicProfiles}名（".round(($publicProfiles / $totalUsers) * 100, 1).'%）');

        // アクティビティレベル別統計
        $this->command->info('=== アクティビティレベル統計 ===');
        $this->command->info('超アクティブ: 6名（年200記事以上）');
        $this->command->info('中程度: 18名（年50-100記事）');
        $this->command->info('無料専門: 3名（無料記事のみ）');
        $this->command->info('投稿なし: 3名（記事投稿なし）');
    }
}
