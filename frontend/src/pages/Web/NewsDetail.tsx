import { Link, useParams } from 'react-router';
import useSWR from 'swr';
import { ArrowLeft } from 'lucide-react';
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

export function NewsDetail() {
  const { slug } = useParams();
  const { data, isLoading } = useSWR('/cms/global/blog', fetcher);
  const posts: BlogPost[] = Array.isArray(data?.content) ? data.content : [];
  const post = posts.find((item) => item.slug === slug && item.published !== false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-deep-green/20 border-t-deep-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <PageBanner title="Post not found" subtitle="This news item is unavailable." />
        <div className="container mx-auto px-4 max-w-3xl py-16">
          <Link to="/news" className="text-deep-green font-bold">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <PageBanner title={post.title} subtitle={new Date(post.publishedAt).toLocaleDateString('en-IN')} />
      <div className="container mx-auto px-4 max-w-3xl py-16">
        <Link to="/news" className="inline-flex items-center text-charcoal/60 hover:text-deep-green font-bold mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
        </Link>
        {post.coverImage && (
          <img src={getImageUrl(post.coverImage)} alt={post.title} className="w-full rounded-3xl mb-8 object-cover max-h-[420px]" />
        )}
        {post.excerpt && (
          <Typography variant="body" className="text-charcoal/70 text-lg mb-6">{post.excerpt}</Typography>
        )}
        <div className="text-charcoal leading-8 whitespace-pre-wrap">{post.body}</div>
      </div>
    </div>
  );
}
