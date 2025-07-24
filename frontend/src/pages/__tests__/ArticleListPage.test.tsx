import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ArticleListPage } from "../ArticleListPage";
import { AuthContext } from "../../contexts/AuthContextDefinition";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { ArticleService } from "../../utils/articleApi";
import { TagService } from "../../utils/tagApi";
import { paymentApi } from "../../api/payment";

// モック
vi.mock("../../utils/articleApi");
vi.mock("../../utils/tagApi");
vi.mock("../../api/payment");

const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  role: "user" as const,
};

const mockTags = [
  {
    id: 1,
    name: "JavaScript",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  { id: 2, name: "React", created_at: "2024-01-01", updated_at: "2024-01-01" },
  {
    id: 3,
    name: "TypeScript",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockArticles = [
  {
    id: 1,
    title: "Test Article 1",
    content: "Test content 1",
    is_paid: false,
    price: 0,
    status: "published" as const,
    user_id: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    tags: ["JavaScript"],
    author: { username: "testuser" },
  },
  {
    id: 2,
    title: "Test Article 2",
    content: "Test content 2",
    is_paid: true,
    price: 100,
    status: "published" as const,
    user_id: 2,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    tags: ["React", "TypeScript"],
    author: { username: "author2" },
  },
];

const mockArticlesResponse = {
  data: mockArticles,
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 2,
};

const mockPaymentHistory = {
  data: [],
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthContext.Provider
        value={{
          user: mockUser,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          loading: false,
        }}
      >
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  </BrowserRouter>
);

// matchMedia のモック
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("ArticleListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(TagService.getTags).mockResolvedValue(mockTags);
    vi.mocked(ArticleService.getPublishedArticles).mockResolvedValue(
      mockArticlesResponse,
    );
    vi.mocked(paymentApi.getPaymentHistory).mockResolvedValue(
      mockPaymentHistory,
    );
  });

  it("renders article list page with database tags", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    // データベースからタグが取得されて表示される
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事一覧" }),
      ).toBeInTheDocument();
      expect(screen.getByText("#JavaScript")).toBeInTheDocument();
      expect(screen.getByText("#React")).toBeInTheDocument();
      expect(screen.getByText("#TypeScript")).toBeInTheDocument();
    });

    // 記事が表示される
    await waitFor(() => {
      expect(screen.getByText("Test Article 1")).toBeInTheDocument();
      expect(screen.getByText("Test Article 2")).toBeInTheDocument();
    });
  });

  it("allows multiple tag selection", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    // タグが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.getByText("#JavaScript")).toBeInTheDocument();
    });

    // JavaScriptタグを選択
    const jsTag = screen.getByText("#JavaScript");
    await act(async () => {
      fireEvent.click(jsTag);
    });

    // Reactタグを選択
    const reactTag = screen.getByText("#React");
    await act(async () => {
      fireEvent.click(reactTag);
    });

    // 選択状態が表示される
    await waitFor(() => {
      expect(
        screen.getByText(/選択中:.*JavaScript.*React.*2個/),
      ).toBeInTheDocument();
    });

    // チェックマークが表示される
    const selectedJsTag = screen.getByText("#JavaScript").closest("button");
    expect(selectedJsTag).toHaveTextContent("✓");

    const selectedReactTag = screen.getByText("#React").closest("button");
    expect(selectedReactTag).toHaveTextContent("✓");
  });

  it("can deselect tags by clicking again", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("#JavaScript")).toBeInTheDocument();
    });

    // JavaScriptタグを選択
    const jsTag = screen.getByText("#JavaScript");
    await act(async () => {
      fireEvent.click(jsTag);
    });

    // 選択状態を確認 - タグボタンの状態を確認
    await waitFor(() => {
      const selectedButton = screen.getByText("#JavaScript").closest("button");
      expect(selectedButton).toHaveClass("bg-blue-600");
    });

    // 再度クリックして選択解除
    await act(async () => {
      fireEvent.click(jsTag);
    });

    // 選択解除が確認できる - ボタンの状態で確認
    await waitFor(() => {
      const deselectedButton = screen
        .getByText("#JavaScript")
        .closest("button");
      expect(deselectedButton).not.toHaveClass("bg-blue-600");
    });
  });

  it("clears all tags when 'すべて' is clicked", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("#JavaScript")).toBeInTheDocument();
    });

    // いくつかのタグを選択
    await act(async () => {
      fireEvent.click(screen.getByText("#JavaScript"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("#React"));
    });

    // 選択状態を確認
    await waitFor(() => {
      expect(
        screen.getByText(/選択中:.*JavaScript.*React.*2個/),
      ).toBeInTheDocument();
    });

    // 「すべて」ボタンをクリック
    const allButton = screen.getAllByText("すべて")[0]; // 最初の「すべて」ボタン
    await act(async () => {
      fireEvent.click(allButton);
    });

    // すべてのタグが選択解除される
    await waitFor(() => {
      expect(screen.queryByText("選択中:")).not.toBeInTheDocument();
    });
  });

  it("clears all tags when 'すべて解除' is clicked", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("#JavaScript")).toBeInTheDocument();
    });

    // いくつかのタグを選択
    await act(async () => {
      fireEvent.click(screen.getByText("#JavaScript"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("#React"));
    });

    // 選択状態と「すべて解除」ボタンを確認
    await waitFor(() => {
      expect(
        screen.getByText(/選択中:.*JavaScript.*React.*2個/),
      ).toBeInTheDocument();
      expect(screen.getByText("すべて解除")).toBeInTheDocument();
    });

    // 「すべて解除」ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("すべて解除"));
    });

    // すべてのタグが選択解除される
    await waitFor(() => {
      expect(screen.queryByText("選択中:")).not.toBeInTheDocument();
      expect(screen.queryByText("すべて解除")).not.toBeInTheDocument();
    });
  });

  it("calls ArticleService with selected tags", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("#JavaScript")).toBeInTheDocument();
    });

    // JavaScriptとReactタグを選択
    await act(async () => {
      fireEvent.click(screen.getByText("#JavaScript"));
    });
    await act(async () => {
      fireEvent.click(screen.getByText("#React"));
    });

    // ArticleServiceが複数タグで呼び出されることを確認
    await waitFor(() => {
      expect(ArticleService.getPublishedArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: "JavaScript,React",
        }),
      );
    });
  });

  it("shows search input and allows searching", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    // コンポーネントが完全に読み込まれるまで待つ
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事一覧" }),
      ).toBeInTheDocument();
    });

    // 検索入力フィールドが表示される
    const searchInput = screen.getByPlaceholderText("記事を検索...");
    expect(searchInput).toBeInTheDocument();

    // 検索ボタンが表示される
    expect(screen.getByText("検索")).toBeInTheDocument();

    // 検索テキストを入力
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "test search" } });
    });
    expect(searchInput).toHaveValue("test search");
  });

  it("shows pagination when there are multiple pages", async () => {
    const multiPageResponse = {
      ...mockArticlesResponse,
      last_page: 3,
      total: 36,
    };

    vi.mocked(ArticleService.getPublishedArticles).mockResolvedValue(
      multiPageResponse,
    );

    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    // ページネーションが表示される
    await waitFor(() => {
      expect(screen.getAllByTitle("先頭ページ")).toHaveLength(2); // 上下に表示
      expect(screen.getAllByTitle("最後のページ")).toHaveLength(2);
    });
  });

  it("shows create article button for logged in users", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ArticleListPage />
        </TestWrapper>,
      );
    });

    // コンポーネントが完全に読み込まれるまで待つ
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "記事一覧" }),
      ).toBeInTheDocument();
    });

    // ログインユーザーには記事作成ボタンが表示される
    expect(screen.getByText("✏️ 新しい記事を書く")).toBeInTheDocument();
  });
});
