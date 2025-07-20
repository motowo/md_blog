import { describe, it, expect } from "vitest";
import { translateErrorMessage, translateApiError } from "../errorMessages";
import type { ApiError } from "../../types/auth";

describe("translateErrorMessage", () => {
  it("translates basic authentication errors", () => {
    expect(
      translateErrorMessage("These credentials do not match our records."),
    ).toBe("メールアドレスまたはパスワードが正しくありません。");
    expect(translateErrorMessage("Invalid credentials")).toBe(
      "メールアドレスまたはパスワードが正しくありません。",
    );
  });

  it("translates validation errors", () => {
    expect(translateErrorMessage("The email field is required.")).toBe(
      "メールアドレスを入力してください。",
    );
    expect(translateErrorMessage("The username has already been taken.")).toBe(
      "このユーザー名は既に使用されています。",
    );
  });

  it("translates network errors", () => {
    expect(translateErrorMessage("Network Error")).toBe(
      "ネットワークエラーが発生しました。インターネット接続を確認してください。",
    );
  });

  it("returns original message if no translation found", () => {
    expect(translateErrorMessage("Unknown error message")).toBe(
      "Unknown error message",
    );
  });

  it("handles Laravel validation patterns", () => {
    expect(
      translateErrorMessage("The password must be at least 6 characters."),
    ).toBe("パスワードは6文字以上で入力してください。");
  });
});

describe("translateApiError", () => {
  it("translates API error with field errors", () => {
    const apiError: ApiError = {
      message: "The given data was invalid.",
      errors: {
        email: ["The email field is required."],
        password: ["The password must be at least 6 characters."],
      },
    };

    const translated = translateApiError(apiError);

    expect(translated.errors?.email?.[0]).toBe(
      "メールアドレスを入力してください。",
    );
    expect(translated.errors?.password?.[0]).toBe(
      "パスワードは6文字以上で入力してください。",
    );
  });

  it("translates API error without field errors", () => {
    const apiError: ApiError = {
      message: "These credentials do not match our records.",
      errors: {},
    };

    const translated = translateApiError(apiError);

    expect(translated.message).toBe(
      "メールアドレスまたはパスワードが正しくありません。",
    );
  });
});
