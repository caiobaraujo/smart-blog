export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-24 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
            Área privada
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Escreva anotações. Receba críticas. Publique posts melhores.
          </h1>

          <p className="mt-5 max-w-2xl text-white/60">
            Esta área será usada para escrever ideias brutas e pedir para a IA
            avaliar estrutura, clareza, exemplos de código, tamanho do texto e
            qualidade da explicação.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-sm font-medium text-white/70">
            Sua anotação inicial
          </label>

          <textarea
            className="mt-3 min-h-[280px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50"
            placeholder="Exemplo: Hoje estudei service container no Laravel, mas ainda não entendi bem quando usar dependency injection..."
          />

          <button className="mt-5 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-[#050816] transition hover:bg-cyan-200">
            Analisar anotação
          </button>
        </div>
      </section>
    </main>
  );
}
