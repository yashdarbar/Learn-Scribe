export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: any; // JSONB content
  excerpt?: string;
  cover_image_url?: string;
  author_id: string;
  status: 'draft' | 'published';
  read_time?: number;
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogWithDetails extends Blog {
  author: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
  category?: BlogCategory;
  like_count: number;
  user_has_liked: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
}

export interface CreateBlogData {
  title: string;
  content: any;
  excerpt?: string;
  cover_image_url?: string;
  category_id?: string;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  status?: 'draft' | 'published';
}

export interface BlogFilters {
  category?: string;
  author?: string;
  status?: 'draft' | 'published';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Editor specific types
export interface EditorBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'code';
  content: string;
  attributes?: Record<string, any>;
  children?: EditorBlock[];
}

export interface BlogContent {
  blocks: EditorBlock[];
  version: string;
}

// Engagement types
export interface BlogLike {
  id: string;
  blog_id: string;
  user_id: string;
  created_at: string;
}

export interface BlogView {
  id: string;
  blog_id: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}