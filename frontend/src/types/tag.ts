export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  articles_count?: number;
}

export interface TagCreateRequest {
  name: string;
  slug: string;
}

export interface TagUpdateRequest {
  name: string;
  slug: string;
}
