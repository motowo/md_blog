-- 初期データベース設定
CREATE DATABASE IF NOT EXISTS md_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- テスト用データベース
CREATE DATABASE IF NOT EXISTS md_blog_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ユーザー権限の設定
GRANT ALL PRIVILEGES ON md_blog.* TO 'dbuser'@'%';
GRANT ALL PRIVILEGES ON md_blog_test.* TO 'dbuser'@'%';

FLUSH PRIVILEGES;