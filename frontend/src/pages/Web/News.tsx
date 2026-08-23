import { Link } from 'react-router';
import useSWR from 'swr';
import { PageBanner } from '@/components/common/PageBanner';
import { Typography } from '@/components/common/Typography';
import { fetcher } from '@/lib/fetcher';
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

export function News() {
  const { data, isLoading } = useSWR('/cms/global/blog', fetcher);
  const posts: BlogPost[] = (Array.isArray(data?.content) ? data.content : [])
    .filter((post: BlogPost) => post.published !== false)
    .sort((a: BlogPost, b: BlogPost) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <PageBanner
        title="News & Awareness"
        subtitle="Stories, updates, and community programmes from KNT World Welfare Foundation."
      />

      <div className="container mx-auto px-4 max-w-6xl py-16">
        {isLoading ? (
          <div className="w-10 h-10 border-4 border-deep-green/20 border-t-deep-green rounded-full animate-spin mx-auto" />
        ) : posts.length === 0 ? (
          <p className="text-center text-charcoal/50">No news posts yet. Please check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/news/${post.slug}`}
                className="group bg-white border border-charcoal/10 rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform"
              >
                {post.coverImage ? (
                  <img src={getImageUrl(post.coverImage)} alt={post.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-deep-green/10" />
                )}
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-goldenrod mb-2">
                    {new Date(post.publishedAt).toLocaleDateString('en-IN')}
                  </p>
                  <Typography variant="h3" className="!text-xl text-deep-green mb-2 group-hover:text-goldenrod transition-colors">
                    {post.title}
                  </Typography>
                  <p className="text-sm text-charcoal/60 line-clamp-3">{post.excerpt || post.body}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
