import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GeneratePostBody = {
  note?: string;
  analysis?: {
    score?: number;
    summary?: string;
    problems?: string[];
    suggestions?: string[];
    betterAngle?: string;
    needsCodeExample?: boolean;
    suggestedTitle?: string;
  };
};

const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Erro desconhecido.";
  }
}

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractTitleFromMdx(mdx: string) {
  const match = mdx.match(/title:\s*"([^"]+)"/);
  return match?.[1] ?? "post-gerado";
}

function cleanMdx(text: string) {
  return text
    .replace("```mdx", "")
    .replace("```markdown", "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

function escapeRawHtmlOutsideCodeBlocks(mdx: string) {
  const lines = mdx.split("\n");
  let insideCodeBlock = false;

  return lines
    .map((line) => {
      if (line.trim().startsWith("```")) {
        insideCodeBlock = !insideCodeBlock;
        return line;
      }

      if (insideCodeBlock) {
        return line;
      }

      return line
        .replace(/<([a-zA-Z][^>\n]*)>/g, "`<$1>`")
        .replace(/<\/([a-zA-Z][^>\n]*)>/g, "`</$1>`");
    })
    .join("\n");
}

function createPrompt(note: string, analysis: GeneratePostBody["analysis"]) {
  return `
Você é uma escritora técnica sênior especializada em posts de programação.

Sua tarefa é transformar uma anotação bruta em um post completo em MDX para um blog técnico.

REGRAS OBRIGATÓRIAS DE FORMATO:
- Responda APENAS com o conteúdo do arquivo MDX.
- Não explique o que você fez.
- Não use HTML cru.
- Quando citar tags HTML como <a>, <div>, <button>, escreva sempre entre crases: \`<a>\`, \`<div>\`, \`<button>\`.
- Todo código deve estar dentro de bloco cercado por três crases.
- Todo bloco de código precisa abrir e fechar corretamente.
- Não deixe código solto no meio do texto.
- Use linhas em branco entre títulos, parágrafos, listas e blocos de código.
- Use apenas headings com ## e ### no corpo.
- Não use heading # no corpo, porque o título já está no frontmatter.

REGRAS DE CONTEÚDO:
- Escreva em português do Brasil.
- Não escreva texto genérico.
- O post precisa ter problema, contexto, solução e conclusão.
- O texto deve parecer um artigo publicado, não uma anotação.
- Se a anotação falar de scraping, automação de site ou plataformas reais, não ensine a burlar login, bloqueio, CAPTCHA ou termos de uso.
- Para exemplos de scraping ou automação, use HTML fictício, endpoint fictício ou ambiente controlado.
- Não invente dados, benchmarks ou fatos específicos que não estejam na anotação.
- O post deve ser claro, elegante e útil.

A anotação original do autor foi:

"""
${note}
"""

A crítica anterior da IA foi:

"""
Resumo: ${analysis?.summary ?? "Sem resumo anterior."}

Problemas:
${analysis?.problems?.map((item) => `- ${item}`).join("\n") ?? "- Não informado."}

Sugestões:
${analysis?.suggestions?.map((item) => `- ${item}`).join("\n") ?? "- Não informado."}

Ângulo melhor:
${analysis?.betterAngle ?? "Não informado."}

Título sugerido:
${analysis?.suggestedTitle ?? "Não informado."}

Precisa de código?
${analysis?.needsCodeExample ? "Sim" : "Não"}
"""

Gere um arquivo MDX seguindo exatamente esta estrutura:

---
title: "Título claro, específico e interessante"
description: "Descrição curta para SEO com no máximo 160 caracteres"
date: "${new Date().toISOString().slice(0, 10)}"
tags: ["Tag 1", "Tag 2", "Tag 3"]
---

## Introdução

Abra o texto com uma situação real ou uma dúvida clara.

## O problema

Explique o problema que motivou o post.

## A solução

Explique a abordagem principal de forma didática.

## Exemplo prático

Inclua código se fizer sentido. Se incluir código, use obrigatoriamente:

\`\`\`ts
// código aqui
\`\`\`

Se não fizer sentido ter código real, use um exemplo conceitual.

## Decisões técnicas

Explique por que essa abordagem faz sentido e quais escolhas foram feitas.

## O que dá para melhorar

Mostre limitações, riscos ou próximos passos.

## Conclusão

Feche com uma conclusão curta e útil.
`;
}

function validateMdx(mdx: string) {
  if (!mdx.startsWith("---")) {
    throw new Error("O texto gerado não começa com frontmatter MDX.");
  }

  if (!mdx.includes("title:")) {
    throw new Error("O MDX gerado não possui title no frontmatter.");
  }

  if (!mdx.includes("description:")) {
    throw new Error("O MDX gerado não possui description no frontmatter.");
  }

  const codeFenceCount = (mdx.match(/```/g) ?? []).length;

  if (codeFenceCount % 2 !== 0) {
    throw new Error("O MDX gerado possui bloco de código sem fechamento.");
  }
}

async function callGemini({
  ai,
  model,
  prompt,
}: {
  ai: GoogleGenAI;
  model: string;
  prompt: string;
}) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.45,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("O Gemini retornou uma resposta vazia.");
  }

  const cleaned = cleanMdx(text);
  const mdx = escapeRawHtmlOutsideCodeBlocks(cleaned);

  validateMdx(mdx);

  const title = extractTitleFromMdx(mdx);
  const slug = createSlug(title);

  return {
    mdx,
    slug,
    filename: `${slug}.mdx`,
    modelUsed: model,
  };
}

export async function POST(request: Request) {
  const errors: { model: string; message: string }[] = [];

  try {
    const body = (await request.json()) as GeneratePostBody;
    const note = body.note?.trim();

    if (!note || note.length < 30) {
      return NextResponse.json(
        {
          error: "Escreva uma anotação maior antes de gerar o post.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY não encontrada.",
          details:
            "Crie o arquivo .env.local na raiz do projeto e adicione GEMINI_API_KEY=SUA_CHAVE_AQUI. Depois reinicie o npm run dev.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = createPrompt(note, body.analysis);

    for (const model of MODELS) {
      try {
        const result = await callGemini({ ai, model, prompt });
        return NextResponse.json(result);
      } catch (error) {
        const message = getErrorMessage(error);
        errors.push({ model, message });
        console.error(`[generate-post] Falha no modelo ${model}:`, message);
        await sleep(1500);
      }
    }

    return NextResponse.json(
      {
        error: "Não foi possível gerar um MDX válido agora.",
        details:
          "A IA gerou um texto fora do padrão esperado. Tente gerar novamente.",
        attempts: errors,
      },
      { status: 503 }
    );
  } catch (error) {
    const details = getErrorMessage(error);

    console.error("[generate-post] Erro geral:", details);

    return NextResponse.json(
      {
        error: "Falha inesperada ao gerar post.",
        details,
      },
      { status: 500 }
    );
  }
}
