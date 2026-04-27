import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AnalyzeNoteBody = {
  note?: string;
};

type GeminiError = {
  message: string;
  model: string;
};

const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];

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

const responseSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    summary: {
      type: "string",
    },
    problems: {
      type: "array",
      items: {
        type: "string",
      },
    },
    suggestions: {
      type: "array",
      items: {
        type: "string",
      },
    },
    betterAngle: {
      type: "string",
    },
    needsCodeExample: {
      type: "boolean",
    },
    suggestedTitle: {
      type: "string",
    },
  },
  required: [
    "score",
    "summary",
    "problems",
    "suggestions",
    "betterAngle",
    "needsCodeExample",
    "suggestedTitle",
  ],
};

function createPrompt(note: string) {
  return `
Você é uma editora técnica exigente para um blog de programação.

Sua função NÃO é concordar com tudo.
Sua função é criticar a anotação e ajudar a transformar a ideia em um post técnico melhor.

Avalie a anotação usando estes critérios:
1. O problema do texto está claro?
2. A solução está concreta?
3. O texto precisa de exemplo de código?
4. A explicação está longa, rasa ou confusa?
5. Existe um ângulo melhor para transformar isso em post?
6. O texto está útil para outros desenvolvedores?

Seja direto, crítico e útil.

Anotação do usuário:

"""
${note}
"""
`;
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
      temperature: 0.3,
      responseMimeType: "application/json",
      responseJsonSchema: responseSchema,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("O Gemini retornou uma resposta vazia.");
  }

  return JSON.parse(text);
}

export async function POST(request: Request) {
  const errors: GeminiError[] = [];

  try {
    const body = (await request.json()) as AnalyzeNoteBody;
    const note = body.note?.trim();

    if (!note || note.length < 30) {
      return NextResponse.json(
        {
          error: "Escreva uma anotação maior antes de analisar.",
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
    const prompt = createPrompt(note);

    for (const model of MODELS) {
      try {
        const analysis = await callGemini({
          ai,
          model,
          prompt,
        });

        return NextResponse.json({
          ...analysis,
          modelUsed: model,
        });
      } catch (error) {
        const message = getErrorMessage(error);

        errors.push({
          model,
          message,
        });

        console.error(`[analyze-note] Falha no modelo ${model}:`, message);

        await sleep(1500);
      }
    }

    await sleep(3000);

    for (const model of MODELS) {
      try {
        const analysis = await callGemini({
          ai,
          model,
          prompt,
        });

        return NextResponse.json({
          ...analysis,
          modelUsed: model,
        });
      } catch (error) {
        const message = getErrorMessage(error);

        errors.push({
          model,
          message,
        });

        console.error(`[analyze-note] Segunda falha no modelo ${model}:`, message);
      }
    }

    return NextResponse.json(
      {
        error:
          "Todos os modelos gratuitos tentados estão indisponíveis agora.",
        details:
          "Isso geralmente acontece por alta demanda, limite temporário ou instabilidade do serviço. Tente novamente em alguns minutos.",
        attempts: errors,
      },
      { status: 503 }
    );
  } catch (error) {
    const details = getErrorMessage(error);

    console.error("[analyze-note] Erro geral:", details);

    return NextResponse.json(
      {
        error: "Falha inesperada ao analisar anotação.",
        details,
      },
      { status: 500 }
    );
  }
}
