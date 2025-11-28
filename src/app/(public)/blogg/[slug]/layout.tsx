import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { generateBlogPostMetadata, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/blog-metadata';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

async function getPost(slug: string) {
  const post = await db.blogPost.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Artikkel ikke funnet',
      description: 'Denne artikkelen eksisterer ikke eller er ikke publisert.',
    };
  }

  return generateBlogPostMetadata(post);
}

export default async function BlogPostLayout({ params, children }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema(post);

  return (
    <>
      {/* Article Schema for AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      {children}
    </>
  );
}

