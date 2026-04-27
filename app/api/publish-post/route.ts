import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PublishPostBody = {
  filename?: string;
  mdx?: string;
};

function isValidFilename(filename: string) {
  return /^[a-z0-9-]+\.mdx$/.test(filename);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishPostBody;

    const filename = body.filename?.trim();
    const mdx = body.mdx?.trim();

    if (!filename || !mdx) {
      return NextResponse.json(
        {
          error: "Nome do arquivo e conteúdo MDX são obrigatórios.",
        },
        { status: 400 }
      );
    }

    if (!isValidFilename(filename)) {
      return NextResponse.json(
        {
          error:
            "Nome de arquivo inválido. Use apenas letras minúsculas, números e hífens, terminando com .mdx.",
        },
        { status: 400 }
      );
    }

    if (!mdx.startsWith("---")) {
      return NextResponse.json(
        {
          error:
            "O conteúdo não parece ser um MDX válido com frontmatter.",
        },
        { status: 400 }
      );
    }

    const postsDirectory = path.join(process.cwd(), "content/posts");
    const filePath = path.join(postsDirectory, filename);

    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          error:
            "Já existe um post com esse nome. Gere outro título ou altere o nome do arquivo.",
        },
        { status: 409 }
      );
    }

    fs.writeFileSync(filePath, `${mdx}\n`, "utf8");

    return NextResponse.json({
      success: true,
      filename,
      path: `content/posts/${filename}`,
      message: "Post publicado com sucesso.",
    });
  } catch (error) {
    console.error("[publish-post] Erro:", error);

    return NextResponse.json(
      {
        error: "Falha inesperada ao publicar o post.",
      },
      { status: 500 }
    );
  }
}
