import { describe, it, expect, vi } from "vitest";
import {
  suggestTags,
  suggestTagsSync,
  getConfidenceLevel,
} from "../tagSuggestion";

// TagServiceをモック
vi.mock("../tagApi", () => ({
  TagService: {
    getTags: vi.fn(() =>
      Promise.resolve([
        { id: 1, name: "React", slug: "react" },
        { id: 2, name: "JavaScript", slug: "javascript" },
        { id: 3, name: "TypeScript", slug: "typescript" },
        { id: 4, name: "Python", slug: "python" },
        { id: 5, name: "フロントエンド", slug: "frontend" },
        { id: 6, name: "テスト", slug: "test" },
        { id: 7, name: "チュートリアル", slug: "tutorial" },
        { id: 8, name: "Vue", slug: "vue" },
        { id: 9, name: "Node.js", slug: "nodejs" },
        { id: 10, name: "AWS", slug: "aws" },
      ]),
    ),
  },
}));

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

  describe("suggestTags (データベース連動版)", () => {
    it("記事タイトルから関連タグを提案する", async () => {
      const title = "React + TypeScriptでモダンなフロントエンド開発";
      const content = "";

      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.name === "React")).toBe(true);
      expect(suggestions.some((s) => s.name === "TypeScript")).toBe(true);
      expect(suggestions.some((s) => s.name === "フロントエンド")).toBe(true);
    });

    it("記事内容から関連タグを提案する", async () => {
      const title = "";
      const content = `
        # JavaScriptとPythonの比較
        
        JavaScriptはフロントエンド開発で広く使われています。
        一方、Pythonはバックエンドや機械学習で人気です。
        
        ## テスト手法について
        両言語ともテストフレームワークが充実しています。
      `;

      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(true);
      expect(suggestions.some((s) => s.name === "Python")).toBe(true);
      expect(suggestions.some((s) => s.name === "テスト")).toBe(true);
    });

    it("信頼度順にソートされる", async () => {
      const title = "JavaScript JavaScript JavaScript";
      const content = "React hooks tutorial for beginners";

      const suggestions = await suggestTags(title, content, mockTags);

      // JavaScriptが最も高い信頼度を持つはず
      expect(suggestions[0]?.name).toBe("JavaScript");

      // 信頼度が降順でソートされているかチェック
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].confidence).toBeGreaterThanOrEqual(
          suggestions[i].confidence,
        );
      }
    });

    it("最大5つまでの提案を返す", async () => {
      const title =
        "JavaScript React TypeScript Python フロントエンド テスト チュートリアル";
      const content = "";

      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it("関連のないタグは提案されない", async () => {
      const title = "C++ programming guide";
      const content = "This is about C++ programming fundamentals.";

      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(false);
      expect(suggestions.some((s) => s.name === "React")).toBe(false);
      expect(suggestions.some((s) => s.name === "Python")).toBe(false);
    });

    it("空のタイトルと内容では提案されない", async () => {
      const title = "";
      const content = "";

      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.length).toBe(0);
    });

    it("Markdownの記法を適切に除去する", async () => {
      const title = "";
      const content = `
        # JavaScript入門
        
        **JavaScript**は*プログラミング言語*です。
        
        \`\`\`javascript
        console.log('Hello World');
        \`\`\`
        
        [React公式サイト](https://react.dev)も参考にしてください。
      `;

      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(true);
    });

    it("コードブロックの言語指定からタグを提案する", async () => {
      const title = "プログラミング言語比較";
      const content = `
        JavaScriptの基本的な書き方を説明します。

        \`\`\`javascript
        const message = "Hello World";
        console.log(message);
        \`\`\`

        次にPythonでも同じことを実装してみましょう。

        \`\`\`python
        message = "Hello World"
        print(message)
        \`\`\`
      `;

      const suggestions = await suggestTags(title, content, mockTags);

      // JavaScriptとPythonがコードブロックから検出される
      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(true);
      expect(suggestions.some((s) => s.name === "Python")).toBe(true);

      const jsTag = suggestions.find((s) => s.name === "JavaScript");
      const pythonTag = suggestions.find((s) => s.name === "Python");

      // コードブロック由来のタグは高い信頼度を持つ
      expect(jsTag!.confidence).toBeGreaterThan(15);
      expect(pythonTag!.confidence).toBeGreaterThan(15);
    });

    it("データベースから取得したタグのキーワード展開をテスト", async () => {
      // VueとAWSタグを含む拡張版mockTagsを作成
      const extendedMockTags = [
        ...mockTags,
        { id: 8, name: "Vue" },
        { id: 9, name: "AWS" },
        { id: 10, name: "Node.js" },
      ];

      const title = "Node.js + Vue.jsでモダンな開発";
      const content = "AWS S3を使用したファイルストレージの実装";

      const suggestions = await suggestTags(title, content, extendedMockTags);

      // Node.jsはJavaScriptのキーワードから高いスコアを得る
      expect(suggestions.some((s) => s.name === "JavaScript")).toBe(true);
      // Vue.jsは直接マッチまたはキーワードマッチ
      expect(suggestions.some((s) => s.name === "Vue")).toBe(true);
      // AWSキーワードからのマッチ
      expect(suggestions.some((s) => s.name === "AWS")).toBe(true);
    });

    it("キャッシュ機能のテスト", async () => {
      const title = "React開発";
      const content = "";

      // 初回呼び出し
      await suggestTags(title, content, mockTags);

      // 2回目の呼び出し（キャッシュが使われる）
      const suggestions = await suggestTags(title, content, mockTags);

      expect(suggestions.some((s) => s.name === "React")).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("suggestTagsSync (同期版・後方互換性)", () => {
    it("記事タイトルから関連タグを提案する", () => {
      const title = "React + TypeScriptでモダンなフロントエンド開発";
      const content = "";

      const suggestions = suggestTagsSync(title, content, mockTags);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.name === "React")).toBe(true);
      expect(suggestions.some((s) => s.name === "TypeScript")).toBe(true);
      expect(suggestions.some((s) => s.name === "フロントエンド")).toBe(true);
    });

    it("コードブロック言語がテキスト内容より優先される", () => {
      const title = "";
      const content = `
        この記事はJavaについての記事ですが、実際のコードはPythonで書かれています。

        \`\`\`python
        def hello():
            print("Hello from Python")
        \`\`\`
        
        Javaについて簡単に説明します。
      `;

      // JavaタグをモックTのみタグに追加
      const extendedMockTags = [...mockTags, { id: 8, name: "Java" }];
      const suggestions = suggestTagsSync(title, content, extendedMockTags);

      const pythonTag = suggestions.find((s) => s.name === "Python");
      const javaTag = suggestions.find((s) => s.name === "Java");

      expect(pythonTag).toBeDefined();
      expect(javaTag).toBeDefined();

      // コードブロックのPythonがテキストのJavaより高い信頼度を持つ
      expect(pythonTag!.confidence).toBeGreaterThan(javaTag!.confidence);
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
