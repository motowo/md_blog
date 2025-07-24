/**
 * 記事内容からタグを提案するユーティリティ
 */

import { TagService } from "./tagApi";

// プログラミング言語とフレームワークのキーワード（デフォルト）
const DEFAULT_PROGRAMMING_KEYWORDS = {
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

// 一般的な技術キーワード（デフォルト）
const DEFAULT_TECH_KEYWORDS = {
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

// データベースから取得したタグを基にしたキーワード辞書
interface TagKeywordMap {
  [tagName: string]: string[];
}

// キーワード辞書のキャッシュ
let cachedTagKeywords: TagKeywordMap | null = null;
let keywordCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

/**
 * データベースからタグを取得し、キーワード辞書を構築
 */
async function buildTagKeywordMap(): Promise<TagKeywordMap> {
  // キャッシュの有効性をチェック
  const now = Date.now();
  if (cachedTagKeywords && now - keywordCacheTimestamp < CACHE_DURATION) {
    return cachedTagKeywords;
  }

  try {
    const tags = await TagService.getTags();
    const tagKeywordMap: TagKeywordMap = {};

    tags.forEach((tag) => {
      const tagNameLower = tag.name.toLowerCase();
      const keywords: string[] = [tagNameLower];

      // タグ名を基にしたキーワード展開
      // 英語のタグの場合、関連キーワードを追加
      if (tagNameLower.includes("javascript") || tagNameLower === "js") {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.javascript);
      } else if (tagNameLower.includes("typescript") || tagNameLower === "ts") {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.typescript);
      } else if (tagNameLower.includes("react")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.react);
      } else if (
        tagNameLower.includes("vue") ||
        tagNameLower.includes("node.js") ||
        tagNameLower.includes("nodejs")
      ) {
        if (tagNameLower.includes("vue")) {
          keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.vue);
        }
        if (
          tagNameLower.includes("node.js") ||
          tagNameLower.includes("nodejs")
        ) {
          keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.javascript);
        }
      } else if (tagNameLower.includes("angular")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.angular);
      } else if (tagNameLower.includes("python") || tagNameLower === "py") {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.python);
      } else if (
        tagNameLower.includes("java") &&
        !tagNameLower.includes("javascript")
      ) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.java);
      } else if (tagNameLower.includes("php")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.php);
      } else if (
        tagNameLower.includes("go") ||
        tagNameLower.includes("golang")
      ) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.go);
      } else if (tagNameLower.includes("rust")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.rust);
      } else if (tagNameLower.includes("css")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.css);
      } else if (tagNameLower.includes("html")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.html);
      } else if (
        tagNameLower.includes("database") ||
        tagNameLower.includes("db")
      ) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.database);
      } else if (tagNameLower.includes("aws")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.aws);
      } else if (tagNameLower.includes("docker")) {
        keywords.push(...DEFAULT_PROGRAMMING_KEYWORDS.docker);
      }

      // 技術分野のキーワード
      if (
        tagNameLower.includes("frontend") ||
        tagNameLower.includes("フロントエンド")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.frontend);
      } else if (
        tagNameLower.includes("backend") ||
        tagNameLower.includes("バックエンド")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.backend);
      } else if (
        tagNameLower.includes("mobile") ||
        tagNameLower.includes("モバイル")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.mobile);
      } else if (
        tagNameLower.includes("ai") ||
        tagNameLower.includes("人工知能") ||
        tagNameLower.includes("機械学習")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.ai);
      } else if (
        tagNameLower.includes("security") ||
        tagNameLower.includes("セキュリティ")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.security);
      } else if (
        tagNameLower.includes("test") ||
        tagNameLower.includes("テスト")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.testing);
      } else if (
        tagNameLower.includes("performance") ||
        tagNameLower.includes("パフォーマンス")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.performance);
      } else if (
        tagNameLower.includes("tutorial") ||
        tagNameLower.includes("チュートリアル") ||
        tagNameLower.includes("入門")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.tutorial);
      } else if (
        tagNameLower.includes("tips") ||
        tagNameLower.includes("コツ")
      ) {
        keywords.push(...DEFAULT_TECH_KEYWORDS.tips);
      }

      // 重複を除去
      tagKeywordMap[tagNameLower] = [...new Set(keywords)];
    });

    // キャッシュに保存
    cachedTagKeywords = tagKeywordMap;
    keywordCacheTimestamp = now;

    return tagKeywordMap;
  } catch (error) {
    console.warn("Failed to fetch tags for keyword mapping:", error);
    // フォールバック: デフォルトキーワードを使用
    return {};
  }
}

/**
 * コードブロックから言語名を抽出
 */
function extractCodeBlockLanguages(text: string): string[] {
  const codeBlockRegex = /```(\w+)/g;
  const languages: string[] = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    languages.push(match[1].toLowerCase());
  }

  return languages;
}

/**
 * テキストから単語を抽出し、小文字に変換
 */
function extractWords(text: string): string[] {
  // コードブロックの言語指定を抽出
  const codeLanguages = extractCodeBlockLanguages(text);

  // Markdownの記法を除去
  const cleanText = text
    .replace(/```[\s\S]*?```/g, "") // コードブロック内容除去（言語指定は上で抽出済み）
    .replace(/`[^`]*`/g, "") // インラインコード除去
    .replace(/#{1,6}\s/g, "") // 見出し記号除去
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // 太字・斜体記号除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // リンク記号除去
    .replace(/[^\w\sあ-んア-ヶ一-龠]/g, " "); // 記号除去

  const textWords = cleanText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1);

  // テキストの単語とコードブロックの言語を結合
  return [...textWords, ...codeLanguages];
}

/**
 * 記事のタイトルと内容からタグを提案
 */
export async function suggestTags(
  title: string,
  content: string,
  availableTags: { id: number; name: string }[],
): Promise<{ id: number; name: string; confidence: number }[]> {
  const words = [...extractWords(title), ...extractWords(content)];
  const wordCounts = new Map<string, number>();

  // 単語の出現回数をカウント
  words.forEach((word) => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  const suggestions: { id: number; name: string; confidence: number }[] = [];

  // コードブロック言語のカウント（高い重み付け）
  const codeLanguages = extractCodeBlockLanguages(content);
  const codeLanguageCounts = new Map<string, number>();
  codeLanguages.forEach((lang) => {
    codeLanguageCounts.set(lang, (codeLanguageCounts.get(lang) || 0) + 1);
  });

  // データベースから動的にキーワード辞書を構築
  const tagKeywordMap = await buildTagKeywordMap();

  availableTags.forEach((tag) => {
    const tagNameLower = tag.name.toLowerCase();
    let confidence = 0;

    // コードブロック言語の直接マッチ（最高優先度）
    if (codeLanguageCounts.has(tagNameLower)) {
      confidence += codeLanguageCounts.get(tagNameLower)! * 20;
    }

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

    // データベース連動のキーワードマッチ
    const tagKeywords = tagKeywordMap[tagNameLower] || [];
    tagKeywords.forEach((keyword) => {
      // コードブロック言語からのマッチは高く評価
      if (codeLanguageCounts.has(keyword)) {
        confidence += codeLanguageCounts.get(keyword)! * 15;
      }
      if (wordCounts.has(keyword)) {
        confidence += wordCounts.get(keyword)! * 5;
      }
      // 部分マッチも評価
      words.forEach((word) => {
        if (word.includes(keyword) || keyword.includes(word)) {
          confidence += 2;
        }
      });
    });

    // フォールバック: デフォルトキーワードでもマッチング（データベースタグがない場合）
    if (tagKeywords.length === 0) {
      // プログラミング言語・フレームワークキーワードマッチ
      Object.entries(DEFAULT_PROGRAMMING_KEYWORDS).forEach(
        ([category, keywords]) => {
          if (category === tagNameLower || keywords.includes(tagNameLower)) {
            // コードブロック言語からのマッチは高く評価
            keywords.forEach((keyword) => {
              if (codeLanguageCounts.has(keyword)) {
                confidence += codeLanguageCounts.get(keyword)! * 15;
              }
              if (wordCounts.has(keyword)) {
                confidence += wordCounts.get(keyword)! * 5;
              }
            });
          }
        },
      );

      // 技術キーワードマッチ
      Object.entries(DEFAULT_TECH_KEYWORDS).forEach(([category, keywords]) => {
        if (category === tagNameLower || keywords.includes(tagNameLower)) {
          keywords.forEach((keyword) => {
            if (wordCounts.has(keyword)) {
              confidence += wordCounts.get(keyword)! * 3;
            }
          });
        }
      });
    }

    if (confidence > 0) {
      suggestions.push({ ...tag, confidence });
    }
  });

  // 信頼度順にソート
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5); // 上位5つまで
}

/**
 * 同期版のタグ提案（テスト用・後方互換性）
 */
export function suggestTagsSync(
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

  // コードブロック言語のカウント（高い重み付け）
  const codeLanguages = extractCodeBlockLanguages(content);
  const codeLanguageCounts = new Map<string, number>();
  codeLanguages.forEach((lang) => {
    codeLanguageCounts.set(lang, (codeLanguageCounts.get(lang) || 0) + 1);
  });

  availableTags.forEach((tag) => {
    const tagNameLower = tag.name.toLowerCase();
    let confidence = 0;

    // コードブロック言語の直接マッチ（最高優先度）
    if (codeLanguageCounts.has(tagNameLower)) {
      confidence += codeLanguageCounts.get(tagNameLower)! * 20;
    }

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
    Object.entries(DEFAULT_PROGRAMMING_KEYWORDS).forEach(
      ([category, keywords]) => {
        if (category === tagNameLower || keywords.includes(tagNameLower)) {
          // コードブロック言語からのマッチは高く評価
          keywords.forEach((keyword) => {
            if (codeLanguageCounts.has(keyword)) {
              confidence += codeLanguageCounts.get(keyword)! * 15;
            }
            if (wordCounts.has(keyword)) {
              confidence += wordCounts.get(keyword)! * 5;
            }
          });
        }
      },
    );

    // 技術キーワードマッチ
    Object.entries(DEFAULT_TECH_KEYWORDS).forEach(([category, keywords]) => {
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
