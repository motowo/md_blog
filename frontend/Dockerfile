FROM node:20-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションのソースコードをコピー
COPY . .

# ポートを公開
EXPOSE 3000

# 開発サーバーを起動（Viteのホストを0.0.0.0に設定）
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]