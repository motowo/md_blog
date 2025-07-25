import type { User } from "./auth";
import type { Tag } from "./tag";

export interface Article {
  id: number;
  user_id: number;
  title: string;
  content: string;
  status: "draft" | "published";
  is_paid: boolean;
  price?: number;
  preview_content?: string;
  excerpt?: string;
  payments_count?: number;
  created_at: string;
  updated_at: string;
  // リレーション
  user?: User;
  tags?: Tag[];
}

export interface ArticlesResponse {
  data: Article[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  status: "draft" | "published";
  is_paid: boolean;
  price?: number;
  preview_content?: string;
  tag_ids?: number[];
}

export interface ArticleUpdateRequest extends Partial<ArticleCreateRequest> {
  id: number;
}
