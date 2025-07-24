/**
 * 記事内容からタグを提案するユーティリティ
 */

// プログラミング言語とフレームワークのキーワード
const PROGRAMMING_KEYWORDS = {
  javascript: [
    "javascript",
    "js",
    "node.js",
    "nodejs",
    "npm",
    "yarn",
    "webpack",
    "babel",
  ],
  typescript: ["typescript", "ts", "tsc"],
  react: [
    "react",
    "jsx",
    "tsx",
    "hooks",
    "component",
    "state",
    "props",
    "usestate",
    "useeffect",
  ],
  vue: ["vue", "vue.js", "vuejs", "nuxt", "composition api"],
  angular: ["angular", "ng", "rxjs", "typescript"],
  python: [
    "python",
    "py",
    "pip",
    "django",
    "flask",
    "fastapi",
    "pandas",
    "numpy",
  ],
  java: ["java", "spring", "maven", "gradle", "junit"],
  php: ["php", "laravel", "symfony", "composer"],
  go: ["go", "golang", "gin", "echo"],
  rust: ["rust", "cargo", "rustc"],
  css: ["css", "sass", "scss", "less", "tailwind", "bootstrap"],
  html: ["html", "html5", "semantic"],
  database: ["mysql", "postgresql", "mongodb", "redis", "sqlite", "sql"],
  aws: ["aws", "ec2", "s3", "lambda", "cloudformation", "rds"],
  docker: ["docker", "dockerfile", "container", "kubernetes", "k8s"],
};

// 一般的な技術キーワード
const TECH_KEYWORDS = {
  frontend: ["frontend", "フロントエンド", "ui", "ux", "spa", "pwa"],
  backend: ["backend", "バックエンド", "api", "server", "サーバー"],
  mobile: ["mobile", "モバイル", "android", "ios", "flutter", "react native"],
  ai: [
    "ai",
    "人工知能",
    "machine learning",
    "機械学習",
    "deep learning",
    "tensorflow",
    "pytorch",
  ],
  security: [
    "security",
    "セキュリティ",
    "authentication",
    "認証",
    "authorization",
    "認可",
  ],
  testing: ["test", "testing", "テスト", "unit test", "e2e", "jest", "cypress"],
  performance: ["performance", "パフォーマンス", "最適化", "optimization"],
  tutorial: [
    "tutorial",
    "チュートリアル",
    "入門",
    "基礎",
    "beginner",
    "初心者",
  ],
  tips: ["tips", "コツ", "trick", "ハック", "best practice"],
};

/**
 * テキストから単語を抽出し、小文字に変換
 */
function extractWords(text: string): string[] {
  // Markdownの記法を除去
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "") // コードブロック除去
    .replace(/`[^`]*`/g, "") // インラインコード除去
    .replace(/#{1,6}\s/g, "") // 見出し記号除去
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // 太字・斜体記号除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // リンク記号除去
    .replace(/[^\w\sあ-んア-ヶ一-龠]/g, " "); // 記号除去

  return cleanText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

/**
 * 記事のタイトルと内容からタグを提案
 */
export function suggestTags(
  title: string,
  content: string,
  availableTags: { id: number; name: string }[],
): { id: number; name: string; confidence: number }[] {
  const words = [...extractWords(title), ...extractWords(content)];
  const wordCounts = new Map<string, number>();

  // 単語の出現回数をカウント
  words.forEach((word) => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  const suggestions: { id: number; name: string; confidence: number }[] = [];

  availableTags.forEach((tag) => {
    const tagNameLower = tag.name.toLowerCase();
    let confidence = 0;

    // 直接マッチ
    if (wordCounts.has(tagNameLower)) {
      confidence += wordCounts.get(tagNameLower)! * 10;
    }

    // 部分マッチ
    words.forEach((word) => {
      if (word.includes(tagNameLower) || tagNameLower.includes(word)) {
        confidence += 3;
      }
    });

    // プログラミング言語・フレームワークキーワードマッチ
    Object.entries(PROGRAMMING_KEYWORDS).forEach(([category, keywords]) => {
      if (category === tagNameLower || keywords.includes(tagNameLower)) {
        keywords.forEach((keyword) => {
          if (wordCounts.has(keyword)) {
            confidence += wordCounts.get(keyword)! * 5;
          }
        });
      }
    });

    // 技術キーワードマッチ
    Object.entries(TECH_KEYWORDS).forEach(([category, keywords]) => {
      if (category === tagNameLower || keywords.includes(tagNameLower)) {
        keywords.forEach((keyword) => {
          if (wordCounts.has(keyword)) {
            confidence += wordCounts.get(keyword)! * 3;
          }
        });
      }
    });

    if (confidence > 0) {
      suggestions.push({ ...tag, confidence });
    }
  });

  // 信頼度順にソート
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5); // 上位5つまで
}

/**
 * タグ提案の信頼度レベルを取得
 */
export function getConfidenceLevel(
  confidence: number,
): "high" | "medium" | "low" {
  if (confidence >= 20) return "high";
  if (confidence >= 10) return "medium";
  return "low";
}
