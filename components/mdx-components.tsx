import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-16 border-b border-white/10 pb-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mt-10 text-2xl font-semibold tracking-tight text-cyan-100">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="mt-6 text-lg leading-9 text-white/72">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mt-6 list-decimal space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-6 pl-10 text-white/72">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="text-base leading-8 text-white/72">
      {children}
    </li>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-cyan-100">
      {children}
    </strong>
  ),

  blockquote: ({ children }) => (
    <blockquote className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 text-lg leading-8 text-cyan-50">
      {children}
    </blockquote>
  ),

  pre: ({ children }) => (
    <pre className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-black/70 p-6 text-sm leading-7 text-cyan-50 shadow-2xl shadow-black/30">
      {children}
    </pre>
  ),

  code: ({ children }) => (
    <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm text-cyan-200">
      {children}
    </code>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition hover:text-cyan-200"
    >
      {children}
    </a>
  ),
};
