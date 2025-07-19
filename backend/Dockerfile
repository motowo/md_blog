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
    npm

# PHP拡張機能をインストール
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# セットアップスクリプトをコピー
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh

# ポート8000を公開
EXPOSE 8000

# エントリーポイントスクリプトを作成
RUN echo '#!/bin/bash\n\
if [ ! -f "composer.json" ]; then\n\
    /setup.sh\n\
fi\n\
php artisan serve --host=0.0.0.0 --port=8000' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# エントリーポイントを設定
CMD ["/entrypoint.sh"]