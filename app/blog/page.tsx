const posts = [
  {
    title: "Como transformar anotações em posts técnicos melhores",
    description:
      "Um primeiro exemplo de como uma ideia solta pode virar um artigo com problema, contexto, solução e conclusão.",
    tag: "IA e escrita",
    date: "27 abr 2026",
  },
  {
    title: "Por que Laravel continua sendo uma boa escolha para produtos web",
    description:
      "Uma reflexão sobre produtividade, arquitetura MVC, ecossistema e clareza no desenvolvimento backend.",
    tag: "Laravel",
    date: "27 abr 2026",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-24 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Posts publicados
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Textos sobre programação, decisões técnicas e aprendizado.
          </h1>

          <p className="mt-5 max-w-2xl text-white/60">
            Aqui ficam os posts finais, revisados e organizados para leitura
            pública.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]"
            >
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                {post.tag}
              </span>

              <h2 className="mt-5 text-2xl font-semibold">{post.title}</h2>

              <p className="mt-3 text-sm leading-6 text-white/60">
                {post.description}
              </p>

              <p className="mt-6 text-xs text-white/40">{post.date}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
