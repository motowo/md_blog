FROM php:8.3-fpm-alpine

# 作業ディレクトリを設定
WORKDIR /var/www/html

# 必要なパッケージをインストール
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    bash \
    nodejs \
    npm \
    icu-dev

# PHP拡張機能をインストール
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd intl

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# アプリケーションファイルをコピー
COPY . /var/www/html

# Composerで依存関係をインストール
RUN composer install --optimize-autoloader --no-dev

# 適切な権限を設定
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# ポート8000を公開
EXPOSE 8000

# エントリーポイントスクリプトをコピー
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# エントリーポイントを設定
ENTRYPOINT ["/entrypoint.sh"]