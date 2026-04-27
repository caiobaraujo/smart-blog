"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Feedback = {
  score: number;
  summary: string;
  problems: string[];
  suggestions: string[];
  betterAngle: string;
  needsCodeExample: boolean;
  suggestedTitle: string;
  modelUsed?: string;
};

type GeneratedPost = {
  mdx: string;
  slug: string;
  filename: string;
  modelUsed?: string;
};

type PublishedPost = {
  filename: string;
  path: string;
  message: string;
};

function removeFrontmatter(mdx: string) {
  return mdx.replace(/^---[\s\S]*?---/, "").trim();
}

function getFrontmatterValue(mdx: string, key: string) {
  const regex = new RegExp(`${key}:\\s*"([^"]+)"`);
  const match = mdx.match(regex);
  return match?.[1] ?? "";
}

function getTags(mdx: string) {
  const match = mdx.match(/tags:\s*\[([^\]]+)\]/);
  if (!match) return [];

  return match[1]
    .split(",")
    .map((tag) => tag.replaceAll('"', "").trim())
    .filter(Boolean);
}

export default function StudioPage() {
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [publishedPost, setPublishedPost] = useState<PublishedPost | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "mdx">("preview");

  const preview = useMemo(() => {
    if (!generatedPost) return null;

    return {
      title: getFrontmatterValue(generatedPost.mdx, "title"),
      description: getFrontmatterValue(generatedPost.mdx, "description"),
      date: getFrontmatterValue(generatedPost.mdx, "date"),
      tags: getTags(generatedPost.mdx),
      content: removeFrontmatter(generatedPost.mdx),
    };
  }, [generatedPost]);

  async function handleAnalyze() {
    setLoadingAnalysis(true);
    setError("");
    setFeedback(null);
    setGeneratedPost(null);
    setPublishedPost(null);
    setCopied(false);

    try {
      const res = await fetch("/api/analyze-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.details
          ? `${data.error}\n\nDetalhes técnicos:\n${data.details}`
          : data.error || "Erro ao analisar.";

        setError(message);
        return;
      }

      setFeedback(data);
    } catch {
      setError("Erro de conexão com a API interna do projeto.");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  async function handleGeneratePost() {
    setLoadingPost(true);
    setError("");
    setGeneratedPost(null);
    setPublishedPost(null);
    setCopied(false);
    setViewMode("preview");

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note,
          analysis: feedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.details
          ? `${data.error}\n\nDetalhes técnicos:\n${data.details}`
          : data.error || "Erro ao gerar post.";

        setError(message);
        return;
      }

      setGeneratedPost(data);
    } catch {
      setError("Erro de conexão ao gerar o post.");
    } finally {
      setLoadingPost(false);
    }
  }

  async function handleCopyMdx() {
    if (!generatedPost) return;

    await navigator.clipboard.writeText(generatedPost.mdx);
    setCopied(true);
  }

  async function handlePublishPost() {
    if (!generatedPost) return;

    setPublishing(true);
    setError("");
    setPublishedPost(null);

    try {
      const res = await fetch("/api/publish-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: generatedPost.filename,
          mdx: generatedPost.mdx,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao publicar post.");
        return;
      }

      setPublishedPost(data);
    } catch {
      setError("Erro de conexão ao publicar o post.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] px-6 py-20 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:border-cyan-300/40 hover:text-cyan-200"
            >
              ← Início
            </Link>

            <Link
              href="/blog"
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 transition hover:border-cyan-300/50"
            >
              Ver blog
            </Link>
          </div>

          <div className="mb-4 inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
            Studio privado
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Escreva, critique, visualize e publique.
          </h1>

          <p className="mt-5 max-w-2xl text-white/60">
            A IA transforma sua anotação em post, mas você vê o preview antes de
            publicar no blog.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Anotação bruta</h2>
              <p className="mt-1 text-sm text-white/45">
                Escreva como se fosse um caderno de estudo.
              </p>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[420px] w-full resize-none rounded-3xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50"
              placeholder="Exemplo: Estudei Service Container no Laravel. Entendi que ele resolve dependências automaticamente, mas ainda não sei explicar bem qual problema isso resolve em uma aplicação real..."
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-white/40">
                {note.length} caracteres
              </span>

              <button
                onClick={handleAnalyze}
                disabled={loadingAnalysis || loadingPost || publishing}
                className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#050816] transition hover:bg-cyan-200 disabled:opacity-50"
              >
                {loadingAnalysis ? "Analisando..." : "Analisar com IA"}
              </button>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            {!feedback && !loadingAnalysis && !error && (
              <div className="flex min-h-[420px] items-center justify-center text-center text-sm text-white/40">
                Escreva algo e clique em analisar.
              </div>
            )}

            {loadingAnalysis && (
              <div className="flex min-h-[420px] items-center justify-center text-cyan-300">
                IA analisando sua anotação...
              </div>
            )}

            {error && (
              <div className="whitespace-pre-wrap rounded-3xl border border-red-300/20 bg-red-300/10 p-5 text-sm leading-7 text-red-100">
                {error}
              </div>
            )}

            {feedback && !error && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-sm text-cyan-100/70">Nota da ideia</p>
                  <p className="text-4xl font-semibold">
                    {feedback.score}/100
                  </p>

                  <p className="mt-3 text-sm leading-6 text-cyan-50/80">
                    {feedback.summary}
                  </p>

                  {feedback.modelUsed && (
                    <p className="mt-3 text-xs text-cyan-100/50">
                      Modelo usado: {feedback.modelUsed}
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-red-300/20 bg-red-300/10 p-5">
                  <h3 className="font-semibold text-red-100">Problemas</h3>

                  <ul className="mt-3 space-y-2 text-sm text-red-50/80">
                    {feedback.problems.map((problem) => (
                      <li key={problem}>• {problem}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                  <h3 className="font-semibold text-emerald-100">
                    Melhorias
                  </h3>

                  <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
                    {feedback.suggestions.map((suggestion) => (
                      <li key={suggestion}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-purple-300/20 bg-purple-300/10 p-5">
                  <h3 className="font-semibold text-purple-100">
                    Ângulo melhor
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-purple-50/80">
                    {feedback.betterAngle}
                  </p>
                </div>

                <button
                  onClick={handleGeneratePost}
                  disabled={loadingPost || publishing}
                  className="w-full rounded-full bg-purple-300 px-6 py-3 text-sm font-semibold text-[#050816] transition hover:bg-purple-200 disabled:opacity-50"
                >
                  {loadingPost ? "Gerando post..." : "Gerar post completo"}
                </button>
              </div>
            )}
          </aside>
        </div>

        {generatedPost && preview && (
          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                  Post gerado
                </div>

                <h2 className="text-2xl font-semibold">
                  Revise antes de publicar
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Arquivo sugerido:{" "}
                  <code className="rounded bg-black/40 px-1.5 py-0.5 text-cyan-200">
                    content/posts/{generatedPost.filename}
                  </code>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    viewMode === "preview"
                      ? "bg-cyan-300 text-[#050816]"
                      : "border border-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  Preview
                </button>

                <button
                  onClick={() => setViewMode("mdx")}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    viewMode === "mdx"
                      ? "bg-cyan-300 text-[#050816]"
                      : "border border-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  Ver MDX
                </button>

                <button
                  onClick={handleCopyMdx}
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-cyan-300/40 hover:text-cyan-200"
                >
                  {copied ? "Copiado!" : "Copiar MDX"}
                </button>

                <button
                  onClick={handlePublishPost}
                  disabled={publishing}
                  className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-[#050816] transition hover:bg-emerald-200 disabled:opacity-50"
                >
                  {publishing ? "Publicando..." : "Publicar no blog"}
                </button>
              </div>
            </div>

            {publishedPost && (
              <div className="mb-6 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 text-sm leading-7 text-emerald-100">
                <p className="font-semibold">{publishedPost.message}</p>
                <p className="mt-1 text-emerald-50/70">
                  Criado em: {publishedPost.path}
                </p>

                <Link
                  href={`/blog/${generatedPost.slug}`}
                  className="mt-4 inline-flex rounded-full bg-emerald-300 px-5 py-2 text-sm font-semibold text-[#050816] transition hover:bg-emerald-200"
                >
                  Abrir post publicado
                </Link>
              </div>
            )}

            {viewMode === "preview" ? (
              <article className="rounded-[2rem] border border-white/10 bg-[#080b18]/95 p-8 md:p-12">
                <div className="flex flex-wrap gap-2">
                  {preview.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                  {preview.title}
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
                  {preview.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/40">
                  <span>
                    {preview.date
                      ? new Date(preview.date).toLocaleDateString("pt-BR")
                      : "Sem data"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>Preview antes da publicação</span>
                </div>

                <div className="mt-12 border-t border-white/10 pt-10">
                  <div className="prose prose-invert prose-lg max-w-none
                    prose-headings:font-semibold
                    prose-headings:tracking-tight
                    prose-h2:mt-16
                    prose-h2:border-b
                    prose-h2:border-white/10
                    prose-h2:pb-4
                    prose-h2:text-3xl
                    prose-h3:mt-10
                    prose-h3:text-cyan-100
                    prose-p:text-lg
                    prose-p:leading-9
                    prose-p:text-white/70
                    prose-li:leading-8
                    prose-li:text-white/70
                    prose-strong:text-cyan-100
                    prose-a:text-cyan-300
                    prose-blockquote:rounded-3xl
                    prose-blockquote:border
                    prose-blockquote:border-cyan-300/20
                    prose-blockquote:bg-cyan-300/10
                    prose-blockquote:p-6
                    prose-code:rounded-md
                    prose-code:bg-white/10
                    prose-code:px-1.5
                    prose-code:py-0.5
                    prose-code:text-cyan-200
                    prose-pre:rounded-3xl
                    prose-pre:border
                    prose-pre:border-white/10
                    prose-pre:bg-black/70
                    prose-pre:p-6"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {preview.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </article>
            ) : (
              <pre className="max-h-[620px] overflow-auto rounded-3xl border border-white/10 bg-black/50 p-5 text-sm leading-7 text-white/80">
                <code>{generatedPost.mdx}</code>
              </pre>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
