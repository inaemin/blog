import type { CSSProperties, ReactNode } from "react";

export type MarkdownHeading = {
  id: string;
  level: 1 | 2 | 3 | 4;
  text: string;
};

const headingAnchorStyle = { scrollMarginTop: 96 };
const markdownTextWrapClassName = "min-w-0 [overflow-wrap:anywhere]";
const highlightedLanguages = new Set(["js", "jsx", "json", "ts", "tsx"]);
const keywordTokens = new Set([
  "async",
  "await",
  "const",
  "default",
  "else",
  "export",
  "false",
  "from",
  "function",
  "if",
  "import",
  "interface",
  "let",
  "new",
  "null",
  "return",
  "true",
  "type",
  "undefined",
  "var",
]);
const codeTokenPattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[a-zA-Z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,:;=<>+\-*/])/gu;

type ImageMetadata = {
  caption?: string;
  width?: number;
};

function getHeadingId(text: string) {
  const id = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/gu, "-");

  if (id.length === 0) {
    return "section";
  }

  return id;
}

function splitBlocks(body: string) {
  return body
    .split(/(```[\s\S]*?```)/u)
    .flatMap((segment) => {
      if (segment.startsWith("```")) {
        return [segment.trim()];
      }

      return segment.split(/\n{2,}/u).map((block) => block.trim()).filter(Boolean);
    });
}

export function extractMarkdownHeadings(body: string): MarkdownHeading[] {
  return splitBlocks(body).flatMap((block) => {
    const match = /^(#{1,4})\s+(.+)$/u.exec(block);

    if (!match) {
      return [];
    }

    const [, marker, text] = match;

    return [{ id: getHeadingId(text), level: marker.length as 1 | 2 | 3 | 4, text }];
  });
}

function renderInlineText(text: string) {
  return text.split(/(`[^`]+`)/u).map((segment): ReactNode => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      const code = segment.slice(1, -1);

      return <code key={segment} className="rounded bg-card px-1.5 py-0.5 font-mono text-[0.9em] text-text-strong">{code}</code>;
    }

    return segment;
  });
}

function getCodeTokenClassName(token: string) {
  if (/^["'`]/u.test(token)) {
    return "text-[#0A7A3F]";
  }

  if (keywordTokens.has(token)) {
    return "text-brand";
  }

  if (/^\d/u.test(token)) {
    return "text-[#B45309]";
  }

  if (/^[{}()[\].,:;=<>+\-*/]$/u.test(token)) {
    return "text-text-muted";
  }

  return "text-text-strong";
}

function renderHighlightedLine(line: string, lineIndex: number) {
  return line.split(codeTokenPattern).filter(Boolean).map((segment, segmentIndex) => {
    const className = getCodeTokenClassName(segment);

    return <span key={`${lineIndex}-${segmentIndex}`} className={className}>{segment}</span>;
  });
}

function renderHighlightedCode(code: string, language: string) {
  if (!highlightedLanguages.has(language)) {
    return code;
  }

  return code.split("\n").flatMap((line, lineIndex) => [
    <span key={`line-${lineIndex}`} className="block min-h-[22px]">
      {renderHighlightedLine(line, lineIndex)}
    </span>,
  ]);
}

function parseImageWidth(part: string | undefined) {
  if (!part) {
    return undefined;
  }

  const match = /^width=(\d{2,4})$/u.exec(part.trim());

  if (!match) {
    return undefined;
  }

  return Number(match[1]);
}

function parseImageMetadata(rawTitle: string | undefined): ImageMetadata {
  if (!rawTitle) {
    return {};
  }

  const parts = rawTitle.split(/\s*\|\s*/u).filter(Boolean);
  const widthPart = parts.find((part) => part.trim().startsWith("width="));
  const caption = parts.filter((part) => !part.trim().startsWith("width=")).join(" | ") || undefined;

  return { caption, width: parseImageWidth(widthPart) };
}

function getImageContentStyle(width: number | undefined): CSSProperties | undefined {
  if (!width) {
    return undefined;
  }

  return { maxWidth: width };
}

function renderCodeBlock(block: string) {
  const match = /^```([^\n]*)\n([\s\S]*?)```$/u.exec(block);

  if (!match) {
    return undefined;
  }

  const [, rawLanguage, code] = match;
  const language = rawLanguage.trim().toLowerCase();
  const trimmedCode = code.trim();

  return (
    <figure key={block} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_28px_#0F172A0D]">
      <pre className="max-w-full overflow-x-auto p-4 font-mono text-sm font-normal leading-[22px] text-text-strong [overflow-wrap:normal]">
        <code className={`language-${language}`} data-language={language}>{renderHighlightedCode(trimmedCode, language)}</code>
      </pre>
    </figure>
  );
}

function renderImageBlock(block: string) {
  const match = /^!\[(.*?)\]\((\S+)(?:\s+"(.*?)")?\)$/u.exec(block);

  if (!match) {
    return undefined;
  }

  const [, alt, source, rawTitle] = match;
  const { caption, width } = parseImageMetadata(rawTitle);

  return (
    <figure key={block} className="flex min-w-0 flex-col items-center gap-2" data-image-width={width}>
      <div className="flex w-full min-h-[210px] items-center justify-center rounded-[14px] border border-[#D6E7FF] bg-tag-bg px-5 text-center md:min-h-[280px] xl:min-h-[300px]" style={getImageContentStyle(width)}>
        <span className="text-sm font-medium text-brand">{alt}</span>
      </div>
      <figcaption className="w-full text-center text-xs leading-[1.35] text-text-muted" style={getImageContentStyle(width)}>
        {caption ?? source}
      </figcaption>
    </figure>
  );
}

function renderQuoteBlock(block: string) {
  if (!block.startsWith("> ")) {
    return undefined;
  }

  const quote = block.split("\n").map((line) => line.replace(/^>\s?/u, "")).join("\n");

  return (
    <blockquote key={block} className="border-l-2 border-brand py-1 pl-4 text-[15px] font-medium italic leading-[25px] text-text-secondary md:pl-5 xl:text-base xl:leading-[28px]">
      <p>{renderInlineText(quote)}</p>
    </blockquote>
  );
}

export function MarkdownBody({ body }: { body: string }) {
  const blocks = splitBlocks(body);

  return (
    <div className={`flex ${markdownTextWrapClassName} flex-col gap-5 text-base font-normal leading-[27px] text-text-strong md:gap-[22px] xl:gap-6 xl:text-[17px] xl:leading-[29px]`}>
      {blocks.map((block) => {
        const codeBlock = renderCodeBlock(block);

        if (codeBlock) {
          return codeBlock;
        }

        const imageBlock = renderImageBlock(block);

        if (imageBlock) {
          return imageBlock;
        }

        const quoteBlock = renderQuoteBlock(block);

        if (quoteBlock) {
          return quoteBlock;
        }

        if (block.startsWith("# ")) {
          const text = block.slice(2);

          return <h1 key={block} id={getHeadingId(text)} style={headingAnchorStyle} className="text-[26px] font-bold leading-8 text-foreground xl:text-[28px] xl:leading-9">{text}</h1>;
        }
        if (block.startsWith("## ")) {
          const text = block.slice(3);

          return <h2 key={block} id={getHeadingId(text)} style={headingAnchorStyle} className="text-[22px] font-semibold leading-8 text-foreground xl:text-2xl xl:leading-[35px]">{text}</h2>;
        }
        if (block.startsWith("### ")) {
          const text = block.slice(4);

          return <h3 key={block} id={getHeadingId(text)} style={headingAnchorStyle} className="text-lg font-medium leading-[26px] text-foreground xl:text-xl xl:font-semibold xl:leading-[29px]">{text}</h3>;
        }
        if (block.startsWith("#### ")) {
          const text = block.slice(5);

          return <h4 key={block} id={getHeadingId(text)} style={headingAnchorStyle} className="text-base font-medium leading-[23px] text-text-strong xl:text-[17px] xl:font-semibold xl:leading-[25px]">{text}</h4>;
        }
        if (block.startsWith("- ")) {
          return (
            <ul key={block} className="flex list-disc flex-col gap-2 pl-5">
              {block.split("\n").map((item) => (
                <li key={item}>{renderInlineText(item.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={block}>{renderInlineText(block)}</p>;
      })}
    </div>
  );
}
