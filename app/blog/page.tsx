import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Posts sobre programação, decisões técnicas, Laravel, Vue, Next.js, IA e desenvolvimento web.",
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  const tags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.10),transparent_30%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-200">
              DN
            </div>

            <div>
              <p className="text-sm font-semibold leading-none text-white">
                Dev Notes
              </p>
              <p className="mt-1 text-xs text-white/40">
                Programação & IA
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Início
            </Link>

            <Link
              href="/blog"
              className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200"
            >
              Blog
            </Link>

            <Link
              href="/studio"
              className="rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-sm text-purple-200 transition hover:border-purple-300/50"
            >
              Studio
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              Posts publicados
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
              Ideias técnicas transformadas em textos claros.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Estudos sobre programação, decisões de arquitetura, IA,
              automação, backend, frontend e aprendizados práticos de
              desenvolvimento web.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <p className="text-sm font-medium text-white/50">
              Este blog é construído com
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-semibold text-cyan-200">
                  {posts.length}
                </p>
                <p className="mt-1 text-xs text-white/40">posts publicados</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-semibold text-purple-200">
                  {tags.length}
                </p>
                <p className="mt-1 text-xs text-white/40">temas abordados</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-white/50">
              Cada post nasce de uma anotação bruta, passa por crítica da IA e
              vira um artigo revisado antes da publicação.
            </p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {featuredPost && (
          <section className="mt-16">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                Post em destaque
              </h2>

              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] shadow-2xl shadow-cyan-950/20 transition hover:border-cyan-300/40 lg:grid-cols-[1fr_0.7fr]"
            >
              <article className="p-8 md:p-10">
                <div className="flex flex-wrap gap-2">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mt-8 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white transition group-hover:text-cyan-100 md:text-5xl">
                  {featuredPost.title}
                </h3>

                <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">
                  {featuredPost.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/40">
                  <span>
                    {new Date(featuredPost.date).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{featuredPost.readingTime}</span>
                </div>
              </article>

              <div className="relative hidden border-l border-white/10 bg-black/20 p-10 lg:block">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_45%)]" />

                <div className="relative flex h-full min-h-[260px] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[#050816]/80 p-6">
                  <p className="text-sm text-white/45">
                    Publicado no Dev Notes
                  </p>

                  <div>
                    <p className="text-5xl font-semibold text-cyan-200">→</p>
                    <p className="mt-4 text-sm leading-6 text-white/50">
                      Ler artigo completo, com problema, solução e decisões
                      técnicas.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {otherPosts.length > 0 && (
          <section className="mt-16">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                Mais posts
              </h2>

              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {otherPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/[0.05]"
                >
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold leading-tight text-white transition group-hover:text-cyan-100">
                    {post.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/55">
                    {post.description}
                  </p>

                  <div className="mt-7 flex items-center justify-between gap-4">
                    <p className="text-xs text-white/35">
                      {new Date(post.date).toLocaleDateString("pt-BR")} ·{" "}
                      {post.readingTime}
                    </p>

                    <span className="text-sm text-cyan-300 opacity-0 transition group-hover:opacity-100">
                      Ler →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            Dev Notes — blog técnico sobre programação, IA e desenvolvimento
            web.
          </p>

          <div className="flex gap-4">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-cyan-200"
            >
              GitHub
            </a>

            <Link href="/studio" className="transition hover:text-purple-200">
              Studio privado
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
