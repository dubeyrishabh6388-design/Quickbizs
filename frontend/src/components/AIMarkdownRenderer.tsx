import React from "react";

interface AIMarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

export const AIMarkdownRenderer: React.FC<AIMarkdownRendererProps> = ({
  content,
  isDark,
}) => {
  if (!content) return null;

  // Helper to format inline markdown (bold, italic, code, currency, percentage)
  const formatInline = (text: string): string => {
    let formatted = text;

    // Bold + Italic: ***text***
    formatted = formatted.replace(
      /\*\*\*(.*?)\*\*\*/g,
      `<strong class="font-black text-slate-900 dark:text-white italic">$1</strong>`
    );

    // Bold: **text**
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      `<strong class="font-bold text-slate-900 dark:text-white tracking-tight">$1</strong>`
    );

    // Italic: *text* or _text_
    formatted = formatted.replace(
      /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g,
      `<em class="italic text-slate-700 dark:text-slate-300">$1</em>`
    );

    // Inline code: `code`
    formatted = formatted.replace(
      /`([^`]+)`/g,
      `<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950/80 text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700/60 font-mono text-[11px]">$1</code>`
    );

    // Highlight Currency: ₹1,473 or ₹ 500
    formatted = formatted.replace(
      /(₹\s*[\d,]+(?:\.\d+)?)/g,
      `<span class="inline-flex items-center px-1.5 py-0.2 rounded font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">$1</span>`
    );

    return formatted;
  };

  // Parse lines into structured blocks
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = () => {
    if (!currentList) return;
    const listIndex = blocks.length;
    if (currentList.type === "ul") {
      blocks.push(
        <ul key={`ul-${listIndex}`} className="space-y-1.5 my-1.5 pl-0.5">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shrink-0 mt-1.5 shadow-xs shadow-brand-orange/40"></span>
              <span
                className="text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: formatInline(item) }}
              />
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`ol-${listIndex}`} className="space-y-2 my-2 pl-0.5">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed">
              <span className="h-4 w-4 rounded-full bg-brand-orange/15 text-brand-orange text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-brand-orange/30">
                {i + 1}
              </span>
              <span
                className="text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: formatInline(item) }}
              />
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();

    // Fenced code block toggle
    if (trimmed.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        // close code block
        blocks.push(
          <pre
            key={`code-${idx}`}
            className="p-3 rounded-xl overflow-x-auto text-[11px] font-mono my-2 bg-slate-950 text-emerald-400 border border-slate-800"
          >
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      return;
    }

    // Unordered list item (- or *)
    const ulMatch = rawLine.match(/^(\s*)([-*•])\s+(.+)$/);
    if (ulMatch) {
      const itemText = ulMatch[3];
      if (currentList && currentList.type === "ul") {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { type: "ul", items: [itemText] };
      }
      return;
    }

    // Ordered list item (1. 2. etc)
    const olMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (olMatch) {
      const itemText = olMatch[3];
      if (currentList && currentList.type === "ol") {
        currentList.items.push(itemText);
      } else {
        flushList();
        currentList = { type: "ol", items: [itemText] };
      }
      return;
    }

    // If not a list item, flush any existing list
    flushList();

    // Empty line
    if (!trimmed) {
      blocks.push(<div key={`empty-${idx}`} className="h-2" />);
      return;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push(
        <hr key={`hr-${idx}`} className="my-3 border-t border-slate-200 dark:border-slate-800" />
      );
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4
          key={`h4-${idx}`}
          className="font-bold text-xs uppercase tracking-wider text-brand-orange mt-3 mb-1 flex items-center gap-1.5"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^###\s+/, "")) }}
        />
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h3
          key={`h3-${idx}`}
          className="font-extrabold text-sm text-amber-600 dark:text-amber-400 mt-3.5 mb-1.5"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^##\s+/, "")) }}
        />
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2
          key={`h2-${idx}`}
          className="font-black text-base text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^#\s+/, "")) }}
        />
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={`quote-${idx}`}
          className="pl-3 py-1 my-2 border-l-2 border-brand-orange bg-brand-orange/5 rounded-r-lg text-xs italic text-slate-600 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^>\s+/, "")) }}
        />
      );
      return;
    }

    // Regular paragraph
    blocks.push(
      <p
        key={`p-${idx}`}
        className="text-xs leading-relaxed text-slate-700 dark:text-slate-200"
        dangerouslySetInnerHTML={{ __html: formatInline(rawLine) }}
      />
    );
  });

  flushList();

  return (
    <div className={`space-y-1 ${isDark ? "dark" : ""}`}>
      {blocks}
    </div>
  );
};
