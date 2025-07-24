<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            AvatarSeeder::class, // ユーザー作成後、ランダムアバターを生成
            TagSeeder::class,
            BankAccountSeeder::class, // ユーザー作成後、記事作成前に実行
            ArticleSeeder::class,
            CreditCardSeeder::class,
            CommissionSettingSeeder::class,
            PaymentSeeder::class, // 記事作成後に実行
            PayoutSeeder::class, // 決済データ作成後に実行
        ]);
    }
}
