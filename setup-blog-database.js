const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const blogSchema = `
-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content JSONB NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Likes Table
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

-- Blog Views Table (for analytics)
CREATE TABLE IF NOT EXISTS blog_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_blog_id ON blog_views(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_created_at ON blog_views(created_at);

-- RLS Policies for blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow users to read published blogs
CREATE POLICY "Anyone can read published blogs" ON blogs
  FOR SELECT USING (status = 'published');

-- Allow users to read their own blogs (draft or published)
CREATE POLICY "Users can read their own blogs" ON blogs
  FOR SELECT USING (auth.uid() = author_id);

-- Allow users to insert their own blogs
CREATE POLICY "Users can insert their own blogs" ON blogs
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own blogs
CREATE POLICY "Users can update their own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = author_id);

-- Allow users to delete their own blogs
CREATE POLICY "Users can delete their own blogs" ON blogs
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for blog_categories table
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories
CREATE POLICY "Anyone can read blog categories" ON blog_categories
  FOR SELECT USING (true);

-- RLS Policies for blog_likes table
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;

-- Allow users to read likes
CREATE POLICY "Anyone can read blog likes" ON blog_likes
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own likes
CREATE POLICY "Users can insert their own likes" ON blog_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete their own likes" ON blog_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for blog_views table
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;

-- Allow users to read views
CREATE POLICY "Anyone can read blog views" ON blog_views
  FOR SELECT USING (true);

-- Allow users to insert views
CREATE POLICY "Users can insert blog views" ON blog_views
  FOR INSERT WITH CHECK (true);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
  ('Technology', 'technology', 'Tech-related articles and tutorials', '#3b82f6'),
  ('Writing', 'writing', 'Writing tips and techniques', '#10b981'),
  ('AI & Machine Learning', 'ai-ml', 'Artificial intelligence and machine learning content', '#8b5cf6'),
  ('Productivity', 'productivity', 'Productivity tips and tools', '#f59e0b'),
  ('Research', 'research', 'Research methodologies and findings', '#ef4444'),
  ('Education', 'education', 'Educational content and learning resources', '#06b6d4')
ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function setupBlogDatabase() {
  try {
    console.log('🚀 Setting up blog database schema...');

    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: blogSchema });

    if (error) {
      console.error('❌ Error setting up database:', error);
      return;
    }

    console.log('✅ Blog database schema created successfully!');
    console.log('📝 Tables created:');
    console.log('  - blog_categories');
    console.log('  - blogs');
    console.log('  - blog_likes');
    console.log('  - blog_views');
    console.log('🎉 You can now create blogs!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupBlogDatabase();