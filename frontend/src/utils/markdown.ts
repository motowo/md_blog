import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import stripMarkdown from "strip-markdown";
import remarkStringify from "remark-stringify";

/**
 * マークダウンテキストからプレーンテキストを抽出
 */
export function stripMarkdownToText(markdown: string): string {
  try {
    const result = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(stripMarkdown)
      .use(remarkStringify)
      .processSync(markdown);

    return String(result).trim();
  } catch (error) {
    console.error("Failed to strip markdown:", error);
    // フォールバック: 簡単な正規表現でマークダウンを除去
    return markdown
      .replace(/#{1,6}\s+/g, "") // ヘッダー
      .replace(/\*\*(.*?)\*\*/g, "$1") // 太字
      .replace(/\*(.*?)\*/g, "$1") // イタリック
      .replace(/`(.*?)`/g, "$1") // インラインコード
      .replace(/```[\s\S]*?```/g, "[コードブロック]") // コードブロック
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // リンク
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[画像: $1]") // 画像
      .replace(/>\s+/g, "") // 引用
      .replace(/^[\s]*[-*+]\s+/gm, "") // リスト
      .replace(/^[\s]*\d+\.\s+/gm, "") // 番号付きリスト
      .replace(/\n{3,}/g, "\n\n") // 余分な改行を削除
      .trim();
  }
}

/**
 * 記事コンテンツからプレビューテキストを生成
 */
export function generatePreviewText(
  content: string,
  maxLength: number = 120,
  isPaid: boolean = false,
  isPurchased: boolean = false,
): string {
  // マークダウンをプレーンテキストに変換
  const plainText = stripMarkdownToText(content);

  // 有料記事で未購入の場合、短めのプレビューを生成
  const previewLength =
    isPaid && !isPurchased ? Math.min(maxLength, 80) : maxLength;

  // 指定された長さでトリミング
  if (plainText.length <= previewLength) {
    return plainText;
  }

  // 文字数制限に合わせてカット（単語境界を考慮）
  const truncated = plainText.substring(0, previewLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  // 単語の途中で切れないように調整
  const finalText =
    lastSpaceIndex > previewLength * 0.8
      ? truncated.substring(0, lastSpaceIndex)
      : truncated;

  return finalText + "...";
}

/**
 * 有料記事のぼかし効果用テキストを生成
 */
export function generateBlurredText(text: string): string {
  // テキストの一部を「●」で置き換えてぼかし効果を作る
  return text
    .split("")
    .map((char, index) => {
      // 日本語文字、英数字、記号を適度にぼかす
      if (index % 3 === 0 && /[あ-んア-ンー一-龯a-zA-Z0-9]/.test(char)) {
        return "●";
      }
      return char;
    })
    .join("");
}
