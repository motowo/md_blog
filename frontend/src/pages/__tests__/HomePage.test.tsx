import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import HomePage from "../HomePage";
import { AuthProvider } from "../../contexts/AuthContextDefinition";
import { ArticleService } from "../../utils/articleApi";
import { paymentApi } from "../../api/payment";

// モック
jest.mock("../../utils/articleApi");
jest.mock("../../api/payment");

const mockArticleService = ArticleService as jest.Mocked<typeof ArticleService>;
const mockPaymentApi = paymentApi as jest.Mocked<typeof paymentApi>;

const mockRecentArticles = [
  {
    id: 1,
    title: "新着記事1",
    content: "記事内容1",
    is_paid: false,
    price: 0,
    status: "published",
    user_id: 1,
    created_at: "2025-07-24T10:00:00Z",
    updated_at: "2025-07-24T10:00:00Z",
    user: {
      id: 1,
      name: "テストユーザー1",
      username: "test1",
      profile_public: true,
      avatar_path: null,
    },
    tags: [],
  },
  {
    id: 2,
    title: "新着記事2",
    content: "記事内容2",
    is_paid: true,
    price: 500,
    status: "published",
    user_id: 2,
    created_at: "2025-07-24T09:00:00Z",
    updated_at: "2025-07-24T09:00:00Z",
    user: {
      id: 2,
      name: "テストユーザー2",
      username: "test2",
      profile_public: true,
      avatar_path: null,
    },
    tags: [],
  },
];

const mockTrendingArticles = [
  {
    id: 3,
    title: "注目記事1",
    content: "記事内容3",
    is_paid: true,
    price: 1000,
    status: "published",
    user_id: 3,
    created_at: "2025-07-20T10:00:00Z",
    updated_at: "2025-07-20T10:00:00Z",
    user: {
      id: 3,
      name: "テストユーザー3",
      username: "test3",
      profile_public: true,
      avatar_path: null,
    },
    tags: [],
  },
];

const mockAuthContextValue = {
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
};

const renderHomePage = (authValue = mockAuthContextValue) => {
  return render(
    <BrowserRouter>
      <AuthProvider value={authValue}>
        <HomePage />
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockArticleService.getRecentArticles.mockResolvedValue(mockRecentArticles);
    mockArticleService.getTrendingArticles.mockResolvedValue(
      mockTrendingArticles,
    );
    mockPaymentApi.getPaymentHistory.mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    });
  });

  it("renders homepage with welcome message", async () => {
    renderHomePage();

    expect(screen.getByText("MD Blog へようこそ")).toBeInTheDocument();
    expect(
      screen.getByText(
        "マークダウンで記事を投稿・管理できるブログプラットフォーム",
      ),
    ).toBeInTheDocument();
  });

  it("displays recent articles section", async () => {
    renderHomePage();

    expect(screen.getByText("新着記事")).toBeInTheDocument();
    expect(screen.getByText("すべて見る")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("新着記事1")).toBeInTheDocument();
      expect(screen.getByText("新着記事2")).toBeInTheDocument();
    });

    expect(mockArticleService.getRecentArticles).toHaveBeenCalledWith(10);
  });

  it("displays trending articles section", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("注目記事")).toBeInTheDocument();
      expect(screen.getByText("（過去1ヶ月の売上上位）")).toBeInTheDocument();
      expect(screen.getByText("注目記事1")).toBeInTheDocument();
    });

    expect(mockArticleService.getTrendingArticles).toHaveBeenCalledWith(10);
  });

  it("shows loading state", () => {
    mockArticleService.getRecentArticles.mockImplementation(
      () => new Promise(() => {}), // 永続的にペンディング状態
    );

    renderHomePage();

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("handles error state for recent articles", async () => {
    mockArticleService.getRecentArticles.mockRejectedValue(
      new Error("API Error"),
    );

    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByText("新着記事の取得に失敗しました"),
      ).toBeInTheDocument();
      expect(screen.getByText("再試行")).toBeInTheDocument();
    });
  });

  it("handles error state for trending articles", async () => {
    mockArticleService.getTrendingArticles.mockRejectedValue(
      new Error("API Error"),
    );

    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByText("注目記事の取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  it("does not show trending section when no trending articles", async () => {
    mockArticleService.getTrendingArticles.mockResolvedValue([]);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("新着記事")).toBeInTheDocument();
    });

    expect(screen.queryByText("注目記事")).not.toBeInTheDocument();
  });

  it("fetches purchased articles for logged in user", async () => {
    const loggedInUser = {
      id: 1,
      username: "testuser",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      profile_public: true,
      avatar_path: null,
      bio: null,
      career: null,
      x_url: null,
      github_url: null,
      created_at: "2025-07-24T10:00:00Z",
      updated_at: "2025-07-24T10:00:00Z",
    };

    const mockPaymentHistory = {
      data: [
        {
          id: 1,
          article_id: 2,
          amount: 500,
          status: "success",
          created_at: "2025-07-24T09:00:00Z",
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 1,
    };

    mockPaymentApi.getPaymentHistory.mockResolvedValue(mockPaymentHistory);

    renderHomePage({
      ...mockAuthContextValue,
      user: loggedInUser,
    });

    await waitFor(() => {
      expect(mockPaymentApi.getPaymentHistory).toHaveBeenCalledWith(1);
    });
  });

  it("shows empty state when no articles", async () => {
    mockArticleService.getRecentArticles.mockResolvedValue([]);

    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByText("まだ記事が投稿されていません"),
      ).toBeInTheDocument();
      expect(screen.getByText("記事を見る")).toBeInTheDocument();
    });
  });
});
