import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx-components";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const url = `${siteConfig.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [siteConfig.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <section className="relative px-6 pb-24 pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.16),transparent_28%)]" />

        <article className="mx-auto max-w-4xl">
          <div className="mb-10 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-cyan-300 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
            >
              ← Voltar para o blog
            </Link>

            <Link
              href="/"
              className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Início
            </Link>

            <Link
              href="/studio"
              className="inline-flex rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-sm text-purple-200 transition hover:border-purple-300/50"
            >
              Studio privado
            </Link>
          </div>

          <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              {post.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/40">
              <span>{new Date(post.date).toLocaleDateString("pt-BR")}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{post.readingTime}</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Publicado por {siteConfig.author}</span>
            </div>
          </header>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#080b18]/95 p-7 shadow-2xl shadow-black/30 md:p-12">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>

          <footer className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <p className="text-sm leading-7 text-white/55">
              Gostou desse texto? Use o Studio para transformar uma nova
              anotação em outro post técnico.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#050816] transition hover:bg-cyan-200"
              >
                ← Ver todos os posts
              </Link>

              <Link
                href="/studio"
                className="rounded-full border border-purple-300/30 px-6 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-300/10"
              >
                Escrever nova anotação
              </Link>
            </div>
          </footer>
        </article>
      </section>
    </main>
  );
}
