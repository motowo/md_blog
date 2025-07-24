import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import UserProfileView from "../UserProfileView";
import { ThemeProvider } from "../../contexts/ThemeContext";
import type { User } from "../../types/auth";

// matchMediaのmock
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

// react-router-domのmock
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ArticleServiceのmock
vi.mock("../../utils/articleApi", () => ({
  ArticleService: {
    getUserArticles: vi.fn().mockResolvedValue([
      {
        id: 1,
        title: "テスト記事1",
        content: "テスト内容",
        status: "published",
        is_paid: false,
        price: 0,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        title: "テスト記事2",
        content: "テスト内容",
        status: "draft",
        is_paid: true,
        price: 100,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-02T00:00:00.000Z",
      },
    ]),
  },
}));

// UserServiceのmock
vi.mock("../../utils/userApi", () => ({
  UserService: {
    getArticleActivity: vi.fn().mockResolvedValue({}),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    deleteAccount: vi.fn(),
    getAvatarFiles: vi.fn().mockResolvedValue([]),
  },
}));

// paymentApiのmock
vi.mock("../../api/payment", () => ({
  paymentApi: {
    getPaymentHistory: vi.fn().mockResolvedValue([]),
  },
}));

// モックデータ
const mockUser: User = {
  id: 1,
  name: "テストユーザー",
  username: "testuser",
  email: "test@example.com",
  bio: "テスト用のユーザーです",
  career_description: "エンジニア",
  x_url: "https://x.com/test",
  github_url: "https://github.com/test",
  profile_public: true,
  avatar_path: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  role: "user",
};

describe("UserProfileView - 記事投稿導線", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderComponent = (isReadOnly = false) => {
    return render(
      <BrowserRouter>
        <ThemeProvider>
          <UserProfileView
            user={mockUser}
            isReadOnly={isReadOnly}
            initialTab="articles"
          />
        </ThemeProvider>
      </BrowserRouter>,
    );
  };

  it("記事管理タブで記事一覧見出しに「新しい記事を作成」ボタンが表示される", async () => {
    renderComponent(false);

    await waitFor(() => {
      expect(screen.getByText("記事一覧")).toBeInTheDocument();
    });

    const createButton = await screen.findByRole("button", {
      name: "新しい記事を作成",
    });
    expect(createButton).toBeInTheDocument();
  });

  it("記事がない場合に「最初の記事を作成する」ボタンが表示される", async () => {
    // 空の記事リストを返すようにモックを一時的に変更
    const { ArticleService } = await import("../../utils/articleApi");
    vi.mocked(ArticleService.getUserArticles).mockResolvedValueOnce([]);

    renderComponent(false);

    await waitFor(() => {
      expect(screen.getByText("記事がありません")).toBeInTheDocument();
      expect(
        screen.getByText("記事を作成すると、ここに表示されます"),
      ).toBeInTheDocument();
    });

    const createFirstButton = await screen.findByRole("button", {
      name: "最初の記事を作成する",
    });
    expect(createFirstButton).toBeInTheDocument();
  });

  it("「新しい記事を作成」ボタンクリックで記事作成ページに遷移する", async () => {
    renderComponent(false);

    const createButton = await screen.findByRole("button", {
      name: "新しい記事を作成",
    });
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/articles/new");
  });

  it("「最初の記事を作成する」ボタンクリックで記事作成ページに遷移する", async () => {
    // 空の記事リストを返すようにモックを一時的に変更
    const { ArticleService } = await import("../../utils/articleApi");
    vi.mocked(ArticleService.getUserArticles).mockResolvedValueOnce([]);

    renderComponent(false);

    const createFirstButton = await screen.findByRole("button", {
      name: "最初の記事を作成する",
    });
    fireEvent.click(createFirstButton);

    expect(mockNavigate).toHaveBeenCalledWith("/articles/new");
  });

  it("読み取り専用モードでは記事投稿ボタンが表示されない", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText("投稿記事一覧")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "新しい記事を作成" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "最初の記事を作成する" }),
    ).not.toBeInTheDocument();
  });

  it("他のタブでは記事投稿ボタンが表示されない", () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <UserProfileView
            user={mockUser}
            isReadOnly={false}
            initialTab="profile"
          />
        </ThemeProvider>
      </BrowserRouter>,
    );

    expect(
      screen.queryByRole("button", { name: "新しい記事を作成" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "最初の記事を作成する" }),
    ).not.toBeInTheDocument();
  });

  it("記事一覧に編集ボタンと詳細ボタンが表示される", async () => {
    renderComponent(false);

    await waitFor(() => {
      expect(screen.getByText("テスト記事1")).toBeInTheDocument();
      expect(screen.getByText("テスト記事2")).toBeInTheDocument();
    });

    // 編集ボタンがすべての記事に表示される（読み取り専用ではない）
    const editButtons = await screen.findAllByRole("button", { name: "編集" });
    expect(editButtons).toHaveLength(2);

    // 詳細ボタンがすべての記事に表示される
    const detailButtons = await screen.findAllByRole("button", {
      name: "詳細",
    });
    expect(detailButtons).toHaveLength(2);
  });

  it("編集ボタンクリックで記事編集ページに遷移する", async () => {
    renderComponent(false);

    await waitFor(() => {
      expect(screen.getByText("テスト記事1")).toBeInTheDocument();
    });

    const editButtons = await screen.findAllByRole("button", { name: "編集" });
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/articles/1/edit");
  });

  it("詳細ボタンクリックで記事詳細ページに遷移する", async () => {
    renderComponent(false);

    await waitFor(() => {
      expect(screen.getByText("テスト記事1")).toBeInTheDocument();
    });

    const detailButtons = await screen.findAllByRole("button", {
      name: "詳細",
    });
    fireEvent.click(detailButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/articles/1");
  });

  it("読み取り専用モードでは編集ボタンが表示されない", async () => {
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText("テスト記事1")).toBeInTheDocument();
    });

    // 編集ボタンは表示されない
    expect(
      screen.queryByRole("button", { name: "編集" }),
    ).not.toBeInTheDocument();

    // 詳細ボタンは表示される
    const detailButtons = await screen.findAllByRole("button", {
      name: "詳細",
    });
    expect(detailButtons).toHaveLength(2);
  });
});
