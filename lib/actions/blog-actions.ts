"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Blog,
  BlogWithDetails,
  BlogCategory,
  CreateBlogData,
  UpdateBlogData,
  BlogFilters,
  ActionResult,
  BlogContent,
} from "@/types/blog";

// Simple approach to get user info using author_id
export async function getUserInfoSimple(userId: string): Promise<ActionResult<{ id: string; email: string; user_metadata: any }>> {
  try {
    const supabase = await createClient();

    // First try to get from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile && !profileError) {
      console.log("Found user profile:", profile);
      return {
        success: true,
        data: {
          id: profile.id,
          email: profile.email || 'Unknown',
          user_metadata: {
            first_name: profile.first_name || profile.full_name?.split(' ')[0] || 'Unknown',
            last_name: profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '',
            full_name: profile.full_name || profile.first_name || 'Unknown Author'
          }
        }
      };
    }

    // If no profiles table or user not found, create a fallback
    console.log("No profile found for user ID:", userId);
    return {
      success: false,
      error: 'User profile not found',
      data: {
        id: userId,
        email: 'Unknown Author',
        user_metadata: {
          first_name: 'Unknown',
          last_name: 'Author',
          full_name: 'Unknown Author'
        }
      }
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return {
      success: false,
      error: 'Failed to get user info',
      data: {
        id: userId,
        email: 'Unknown Author',
        user_metadata: {
          first_name: 'Unknown',
          last_name: 'Author',
          full_name: 'Unknown Author'
        }
      }
    };
  }
}

// Helper function to get user info (for internal use)
async function getUserInfoHelper(userId: string) {
  const result = await getUserInfoSimple(userId);
  return result.data || {
    id: userId,
    email: 'Unknown',
    user_metadata: { first_name: 'Author' }
  };
}

// Alternative approach to get user info without admin access
export async function getUserInfoAlternative(userId: string): Promise<ActionResult<{ id: string; email: string; user_metadata: any }>> {
  try {
    const supabase = await createClient();

    // Try to get user info from profiles table if it exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile && !profileError) {
      console.log("Found user profile:", profile);
      return {
        success: true,
        data: {
          id: profile.id,
          email: profile.email || 'Unknown',
          user_metadata: {
            first_name: profile.first_name || profile.full_name?.split(' ')[0] || 'Unknown',
            last_name: profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '',
            full_name: profile.full_name || profile.first_name || 'Unknown Author'
          }
        }
      };
    }

    // Fallback: try to get from auth.users with admin access
    try {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

      if (user && !error) {
        console.log("Found user via admin:", user);
        const userMetadata = user.user_metadata || {};
        const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Unknown';
        const lastName = userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
        const fullName = userMetadata.full_name || `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'Unknown Author';

        return {
          success: true,
          data: {
            id: user.id,
            email: user.email || 'Unknown',
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
              ...userMetadata
            }
          }
        };
      }
    } catch (adminError) {
      console.log("Admin access failed, using fallback");
    }

    // Final fallback
    console.log("Using fallback user data for ID:", userId);
    return {
      success: false,
      error: 'User not found',
      data: {
        id: userId,
        email: 'Unknown Author',
        user_metadata: {
          first_name: 'Unknown',
          last_name: 'Author',
          full_name: 'Unknown Author'
        }
      }
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return {
      success: false,
      error: 'Failed to get user info',
      data: {
        id: userId,
        email: 'Unknown Author',
        user_metadata: {
          first_name: 'Unknown',
          last_name: 'Author',
          full_name: 'Unknown Author'
        }
      }
    };
  }
}

// Core CRUD operations
export async function createBlog(data: CreateBlogData): Promise<ActionResult<Blog>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Generate slug from title
    const slug = await generateSlug(data.title);

    // Calculate read time
    const readTime = await calculateReadTime(data.content);

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert({
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        cover_image_url: data.cover_image_url,
        author_id: user.id,
        status: 'draft',
        read_time: readTime,
        view_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog:', error);
      return { success: false, error: 'Failed to create blog' };
    }

    // Add category relationship if category_id is provided
    if (data.category_id && blog) {
      const { error: relationError } = await supabase
        .from('blog_category_relations')
        .insert({
          blog_id: blog.id,
          category_id: data.category_id
        });

      if (relationError) {
        console.error('Error creating category relation:', relationError);
        // Don't fail the entire operation, just log the error
      }
    }

    revalidatePath('/blogs');
    revalidatePath('/dashboard');

    return { success: true, data: blog };
  } catch (error) {
    console.error('Error in createBlog:', error);
    return { success: false, error: 'Failed to create blog' };
  }
}

export async function updateBlog(id: string, data: UpdateBlogData): Promise<ActionResult<Blog>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Check if user owns the blog
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingBlog || existingBlog.author_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const updateData: any = { ...data };

    // Remove category_id from updateData since we handle it separately
    delete updateData.category_id;

    // Recalculate read time if content changed
    if (data.content) {
      updateData.read_time = await calculateReadTime(data.content);
    }

    // Set published_at if publishing
    if (data.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data: blog, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog:', error);
      return { success: false, error: 'Failed to update blog' };
    }

    // Update category relationship if category_id is provided
    if (data.category_id) {
      // Remove existing category relations
      await supabase
        .from('blog_category_relations')
        .delete()
        .eq('blog_id', id);

      // Add new category relation
      const { error: relationError } = await supabase
        .from('blog_category_relations')
        .insert({
          blog_id: id,
          category_id: data.category_id
        });

      if (relationError) {
        console.error('Error updating category relation:', relationError);
        // Don't fail the entire operation, just log the error
      }
    }

    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);

    return { success: true, data: blog };
  } catch (error) {
    console.error('Error in updateBlog:', error);
    return { success: false, error: 'Failed to update blog' };
  }
}

export async function deleteBlog(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Check if user owns the blog
    const { data: blog } = await supabase
      .from('blogs')
      .select('author_id, slug')
      .eq('id', id)
      .single();

    if (!blog || blog.author_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog:', error);
      return { success: false, error: 'Failed to delete blog' };
    }

    revalidatePath('/blogs');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBlog:', error);
    return { success: false, error: 'Failed to delete blog' };
  }
}

export async function getBlogBySlug(slug: string): Promise<ActionResult<BlogWithDetails>> {
  try {
    const supabase = await createClient();

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Error fetching blog:', error);
      return { success: false, error: 'Blog not found' };
    }

    // Get category for this blog
    const { data: categoryRelations } = await supabase
      .from('blog_category_relations')
      .select(`
        category:blog_categories(*)
      `)
      .eq('blog_id', blog.id)
      .limit(1);

    // Get likes count
    const { count: likeCount } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('blog_id', blog.id);

    // Check if current user has liked
    const { data: { user } } = await supabase.auth.getUser();
    let userHasLiked = false;
    if (user) {
      const { data: like } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_id', blog.id)
        .eq('user_id', user.id)
        .single();
      userHasLiked = !!like;
    }

    // Get author info
    const authorResult = await getUserInfoSimple(blog.author_id);
    const author = authorResult.data || {
      id: blog.author_id,
      email: 'Unknown Author',
      user_metadata: {
        first_name: 'Unknown',
        last_name: 'Author',
        full_name: 'Unknown Author'
      }
    };

    // Increment view count
    await incrementBlogViews(blog.id);

    const blogWithDetails: BlogWithDetails = {
      ...blog,
      category: categoryRelations?.[0]?.category || null,
      author,
      like_count: likeCount || 0,
      user_has_liked: userHasLiked,
    };

    return { success: true, data: blogWithDetails };
  } catch (error) {
    console.error('Error in getBlogBySlug:', error);
    return { success: false, error: 'Failed to fetch blog' };
  }
}

export async function getBlogById(id: string): Promise<ActionResult<BlogWithDetails>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Get the blog data
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .eq('author_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching blog:', error);
      return { success: false, error: 'Blog not found' };
    }

    // Get category for this blog
    const { data: categoryRelations } = await supabase
      .from('blog_category_relations')
      .select(`
        category:blog_categories(*)
      `)
      .eq('blog_id', blog.id)
      .limit(1);

    // Get author info
    const author = await getUserInfoSimple(blog.author_id);

    const blogWithDetails: BlogWithDetails = {
      ...blog,
      category: categoryRelations?.[0]?.category || null,
      author,
      like_count: 0,
      user_has_liked: false
    };

    return { success: true, data: blogWithDetails };
  } catch (error) {
    console.error('Error in getBlogById:', error);
    return { success: false, error: 'Failed to fetch blog' };
  }
}

// Listing and filtering
export async function getPublishedBlogs(filters?: BlogFilters): Promise<ActionResult<BlogWithDetails[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (filters?.author) {
      query = query.eq('author_id', filters.author);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
    }

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data: blogs, error } = await query;

    if (error) {
      console.error('Error fetching blogs:', error);
      return { success: false, error: 'Failed to fetch blogs' };
    }

    // Get categories for each blog
    const blogsWithDetails = await Promise.all(
      (blogs || []).map(async (blog) => {
        // Get category for this blog
        const { data: categoryRelations } = await supabase
          .from('blog_category_relations')
          .select(`
            category:blog_categories(*)
          `)
          .eq('blog_id', blog.id)
          .limit(1);

        // Get author info
        const author = await getUserInfoSimple(blog.author_id);

        return {
          ...blog,
          category: categoryRelations?.[0]?.category || null,
          author,
          like_count: 0,
          user_has_liked: false
        };
      })
    );

    // Filter by category if specified
    let filteredBlogs = blogsWithDetails;
    if (filters?.category) {
      filteredBlogs = blogsWithDetails.filter(blog =>
        blog.category?.id === filters.category
      );
    }

    return { success: true, data: filteredBlogs };
  } catch (error) {
    console.error('Error in getPublishedBlogs:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

export async function getUserBlogs(userId: string): Promise<ActionResult<Blog[]>> {
  try {
    const supabase = await createClient();

    const { data: blogs, error } = await supabase
      .from('blogs')
      .select(`
        *,
        category:blog_categories(*)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user blogs:', error);
      return { success: false, error: 'Failed to fetch blogs' };
    }

    return { success: true, data: blogs || [] };
  } catch (error) {
    console.error('Error in getUserBlogs:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

export async function getBlogsByCategory(categorySlug: string): Promise<ActionResult<Blog[]>> {
  try {
    const supabase = await createClient();

    // First get the category
    const { data: category } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    // Get blogs with this category
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching blogs by category:', error);
      return { success: false, error: 'Failed to fetch blogs' };
    }

    // Filter blogs that have this category
    const blogsWithCategory = await Promise.all(
      (blogs || []).map(async (blog) => {
        const { data: categoryRelations } = await supabase
          .from('blog_category_relations')
          .select('category_id')
          .eq('blog_id', blog.id)
          .eq('category_id', category.id)
          .limit(1);

        return categoryRelations && categoryRelations.length > 0 ? blog : null;
      })
    );

    const filteredBlogs = blogsWithCategory.filter(blog => blog !== null);

    return { success: true, data: filteredBlogs };
  } catch (error) {
    console.error('Error in getBlogsByCategory:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

// Publishing and status
export async function publishBlog(id: string): Promise<ActionResult<Blog>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Check if user owns the blog
    const { data: blog } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!blog || blog.author_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: updatedBlog, error } = await supabase
      .from('blogs')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error publishing blog:', error);
      return { success: false, error: 'Failed to publish blog' };
    }

    revalidatePath('/blogs');
    revalidatePath(`/blogs/${updatedBlog.slug}`);

    return { success: true, data: updatedBlog };
  } catch (error) {
    console.error('Error in publishBlog:', error);
    return { success: false, error: 'Failed to publish blog' };
  }
}

export async function unpublishBlog(id: string): Promise<ActionResult<Blog>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Check if user owns the blog
    const { data: blog } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!blog || blog.author_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: updatedBlog, error } = await supabase
      .from('blogs')
      .update({
        status: 'draft',
        published_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error unpublishing blog:', error);
      return { success: false, error: 'Failed to unpublish blog' };
    }

    revalidatePath('/blogs');
    revalidatePath(`/blogs/${updatedBlog.slug}`);

    return { success: true, data: updatedBlog };
  } catch (error) {
    console.error('Error in unpublishBlog:', error);
    return { success: false, error: 'Failed to unpublish blog' };
  }
}

// Engagement
export async function likeBlog(blogId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('blog_likes')
      .insert({
        blog_id: blogId,
        user_id: user.id,
      });

    if (error) {
      console.error('Error liking blog:', error);
      return { success: false, error: 'Failed to like blog' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in likeBlog:', error);
    return { success: false, error: 'Failed to like blog' };
  }
}

export async function unlikeBlog(blogId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('blog_likes')
      .delete()
      .eq('blog_id', blogId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error unliking blog:', error);
      return { success: false, error: 'Failed to unlike blog' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unlikeBlog:', error);
    return { success: false, error: 'Failed to unlike blog' };
  }
}

export async function incrementBlogViews(blogId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('blogs')
      .update({
        view_count: (await supabase
          .from('blogs')
          .select('view_count')
          .eq('id', blogId)
          .single()).data?.view_count + 1 || 1,
      })
      .eq('id', blogId);

    if (error) {
      console.error('Error incrementing blog views:', error);
      return { success: false, error: 'Failed to increment views' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in incrementBlogViews:', error);
    return { success: false, error: 'Failed to increment views' };
  }
}

// Categories
export async function getAllCategories(): Promise<ActionResult<BlogCategory[]>> {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: 'Failed to fetch categories' };
    }

    return { success: true, data: categories || [] };
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function setBlogCategory(blogId: string, categoryId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    // Check if user owns the blog
    const { data: blog } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', blogId)
      .single();

    if (!blog || blog.author_id !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Remove existing category relations for this blog
    await supabase
      .from('blog_category_relations')
      .delete()
      .eq('blog_id', blogId);

    // Add new category relation
    const { error } = await supabase
      .from('blog_category_relations')
      .insert({
        blog_id: blogId,
        category_id: categoryId
      });

    if (error) {
      console.error('Error setting blog category:', error);
      return { success: false, error: 'Failed to set category' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in setBlogCategory:', error);
    return { success: false, error: 'Failed to set category' };
  }
}

// Utility functions
export async function generateSlug(title: string): Promise<string> {
  try {
    const supabase = await createClient();

    // Create base slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug exists
    let counter = 1;
    let finalSlug = slug;

    while (true) {
      const { data: existing } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', finalSlug)
        .single();

      if (!existing) {
        break;
      }

      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  } catch (error) {
    console.error('Error generating slug:', error);
    // Fallback to timestamp-based slug
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}

export async function calculateReadTime(content: any): Promise<number> {
  try {
    if (!content || !content.blocks) {
      return 1;
    }

    let wordCount = 0;

    // Count words in content blocks
    content.blocks.forEach((block: any) => {
      if (block.content) {
        const words = block.content.trim().split(/\s+/).length;
        wordCount += words;
      }
    });

    // Average reading speed: 200 words per minute
    const readTime = Math.ceil(wordCount / 200);
    return Math.max(1, readTime); // Minimum 1 minute
  } catch (error) {
    console.error('Error calculating read time:', error);
    return 1;
  }
}