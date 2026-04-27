import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_30%)]" />

        <div className="mb-6 inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          Blog de programação
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
          Estudos, ideias e soluções reais sobre desenvolvimento web.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-white/65 md:text-lg">
          Um blog para transformar anotações técnicas em posts claros, bonitos e
          úteis para outros devs. Aqui entram aprendizados sobre Laravel, Vue,
          Next.js, arquitetura, IA e programação na prática.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/blog"
            className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#050816] transition hover:bg-cyan-200"
          >
            Ler posts
          </Link>

          <Link
            href="/studio"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:text-cyan-200"
          >
            Área de escrita
          </Link>
        </div>
      </section>
    </main>
  );
}
