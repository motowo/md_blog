FROM node:20-alpine

WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# ポート80を公開
EXPOSE 80

# 開発サーバーを起動
CMD ["npm", "run", "dev"]