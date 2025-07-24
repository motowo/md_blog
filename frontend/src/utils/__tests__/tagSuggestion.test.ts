import { describe, it, expect } from "vitest";
import { suggestTags, getConfidenceLevel } from "../tagSuggestion";

describe("tagSuggestion", () => {
  const mockTags = [
    { id: 1, name: "React" },
    { id: 2, name: "JavaScript" },
    { id: 3, name: "TypeScript" },
    { id: 4, name: "Python" },
    { id: 5, name: "フロントエンド" },
    { id: 6, name: "テスト" },
    { id: 7, name: "チュートリアル" },
  ];

  describe("suggestTags", () => {
    it("記事タイトルから関連タグを提案する", () => {
      const title = "React + TypeScriptでモダンなフロントエンド開発";
      const content = "";

      const suggestions = suggestTags(title, content, mockTags);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.name === "React")).toBe(true);
      expect(suggestions.some((s) => s.name === "TypeScript")).toBe(true);
      expect(suggestions.some((s) => s.name === "フロントエンド")).toBe(true);
    });

    it("記事内容から関連タグを提案する", () => {
      const title = "";
      const content = `
        # JavaScriptとPythonの比較
        
        JavaScriptはフロントエンド開発で広く使われています。
        一方、Pythonはバックエンドや機械学習で人気です。
        
        ## テスト手法について
        両言語ともテストフレームワークが充実しています。
      `;

      const suggestions = suggestTags(title, content, mockTags);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(true);
      expect(suggestions.some((s) => s.name === "Python")).toBe(true);
      expect(suggestions.some((s) => s.name === "テスト")).toBe(true);
    });

    it("信頼度順にソートされる", () => {
      const title = "JavaScript JavaScript JavaScript";
      const content = "React hooks tutorial for beginners";

      const suggestions = suggestTags(title, content, mockTags);

      // JavaScriptが最も高い信頼度を持つはず
      expect(suggestions[0]?.name).toBe("JavaScript");

      // 信頼度が降順でソートされているかチェック
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].confidence).toBeGreaterThanOrEqual(
          suggestions[i].confidence,
        );
      }
    });

    it("最大5つまでの提案を返す", () => {
      const title =
        "JavaScript React TypeScript Python フロントエンド テスト チュートリアル";
      const content = "";

      const suggestions = suggestTags(title, content, mockTags);

      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it("関連のないタグは提案されない", () => {
      const title = "C++ programming guide";
      const content = "This is about C++ programming fundamentals.";

      const suggestions = suggestTags(title, content, mockTags);

      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(false);
      expect(suggestions.some((s) => s.name === "React")).toBe(false);
      expect(suggestions.some((s) => s.name === "Python")).toBe(false);
    });

    it("空のタイトルと内容では提案されない", () => {
      const title = "";
      const content = "";

      const suggestions = suggestTags(title, content, mockTags);

      expect(suggestions.length).toBe(0);
    });

    it("Markdownの記法を適切に除去する", () => {
      const title = "";
      const content = `
        # JavaScript入門
        
        **JavaScript**は*プログラミング言語*です。
        
        \`\`\`javascript
        console.log('Hello World');
        \`\`\`
        
        [React公式サイト](https://react.dev)も参考にしてください。
      `;

      const suggestions = suggestTags(title, content, mockTags);

      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(true);
    });
  });

  describe("getConfidenceLevel", () => {
    it("信頼度20以上でhighを返す", () => {
      expect(getConfidenceLevel(25)).toBe("high");
      expect(getConfidenceLevel(20)).toBe("high");
    });

    it("信頼度10以上20未満でmediumを返す", () => {
      expect(getConfidenceLevel(15)).toBe("medium");
      expect(getConfidenceLevel(10)).toBe("medium");
      expect(getConfidenceLevel(19)).toBe("medium");
    });

    it("信頼度10未満でlowを返す", () => {
      expect(getConfidenceLevel(9)).toBe("low");
      expect(getConfidenceLevel(5)).toBe("low");
      expect(getConfidenceLevel(1)).toBe("low");
    });
  });
});
