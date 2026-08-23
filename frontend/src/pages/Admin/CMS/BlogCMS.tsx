import { useState } from 'react';
import { Plus, Trash2, Edit2, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { fetcher, api } from '@/lib/fetcher';
import { getImageUrl } from '@/utils/getImageUrl';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  published: boolean;
  publishedAt: string;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm = {
  title: '',
  excerpt: '',
  body: '',
  coverImage: '',
  published: true,
};

export function BlogCMS() {
  const { data, mutate } = useSWR('/cms/global/blog', fetcher);
  const posts: BlogPost[] = Array.isArray(data?.content) ? data.content : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);

  const openModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        excerpt: post.excerpt || '',
        body: post.body || '',
        coverImage: post.coverImage || '',
        published: post.published !== false,
      });
    } else {
      setEditingPost(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const savePosts = async (nextPosts: BlogPost[], message: string) => {
    try {
      mutate({ content: nextPosts }, false);
      await api.put('/cms/global/blog', { content: nextPosts });
      toast.success(message);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save blog posts');
      mutate();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const upload = new FormData();
    upload.append('image', file);
    try {
      setIsUploading(true);
      const res = await api.post('/cms/upload/gallery-image', upload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, coverImage: res.data.data.fileUrl });
      toast.success('Cover image uploaded');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const slug = slugify(formData.title);
    const duplicate = posts.some((post) => post.slug === slug && post.id !== editingPost?.id);
    if (duplicate) {
      toast.error('A post with this title already exists');
      return;
    }

    let nextPosts = [...posts];
    if (editingPost) {
      nextPosts = nextPosts.map((post) =>
        post.id === editingPost.id
          ? {
              ...post,
              ...formData,
              slug,
              publishedAt: formData.published ? post.publishedAt || new Date().toISOString() : post.publishedAt,
            }
          : post
      );
    } else {
      nextPosts.unshift({
        id: Date.now(),
        ...formData,
        slug,
        publishedAt: new Date().toISOString(),
      });
    }

    savePosts(nextPosts, editingPost ? 'Post updated' : 'Post published');
    setIsModalOpen(false);
  };

  const handleDelete = (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    savePosts(posts.filter((item) => item.id !== post.id), 'Post deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="h2" className="!text-2xl text-deep-green mb-1">
            Blog / News
          </Typography>
          <Typography variant="body" className="text-charcoal/60 text-sm">
            Publish awareness posts and updates for the public News page.
          </Typography>
        </div>
        <Button onClick={() => openModal()} className="bg-goldenrod hover:bg-yellow-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {posts.length === 0 && (
          <div className="col-span-full bg-white border border-charcoal/10 rounded-3xl p-10 text-center text-charcoal/50">
            <Newspaper className="w-10 h-10 mx-auto mb-3 text-charcoal/30" />
            No posts yet. Add the first news update.
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-charcoal/10 rounded-3xl overflow-hidden">
            {post.coverImage ? (
              <img src={getImageUrl(post.coverImage)} alt={post.title} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-fog-gray" />
            )}
            <div className="p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${post.published ? 'text-green-700' : 'text-charcoal/40'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-charcoal/40">{new Date(post.publishedAt).toLocaleDateString('en-IN')}</span>
              </div>
              <h3 className="font-bold text-charcoal mb-2">{post.title}</h3>
              <p className="text-sm text-charcoal/60 line-clamp-3 mb-4">{post.excerpt || post.body}</p>
              <div className="flex gap-2">
                <button onClick={() => openModal(post)} className="p-2 rounded-lg hover:bg-gray-50 text-charcoal/60">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(post)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <Typography variant="h3">{editingPost ? 'Edit Post' : 'New Post'}</Typography>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              className="w-full p-3 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green"
            />
            <input
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Short excerpt"
              className="w-full p-3 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green"
            />
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Full article"
              rows={8}
              className="w-full p-3 border border-charcoal/10 rounded-xl outline-none focus:border-deep-green"
            />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal/50 block mb-2">Cover image</label>
              {formData.coverImage && (
                <img src={getImageUrl(formData.coverImage)} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              Published on website
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isUploading}>Save Post</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
