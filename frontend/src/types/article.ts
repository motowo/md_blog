export interface Article {
  id: number;
  user_id: number;
  title: string;
  content: string;
  thumbnail_url?: string;
  status: "draft" | "published";
  is_paid: boolean;
  price?: number;
  preview_content?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // リレーション
  user?: User;
  tags?: Tag[];
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: "author" | "admin";
  profile_image_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
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
  thumbnail_url?: string;
  status: "draft" | "published";
  is_paid: boolean;
  price?: number;
  preview_content?: string;
  is_featured?: boolean;
  tag_ids?: number[];
}

export interface ArticleUpdateRequest extends Partial<ArticleCreateRequest> {
  id: number;
}
