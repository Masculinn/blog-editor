import { ChartRenderer } from "@/components/editor/chart/chart-renderer";
import type { ChartPayload } from "@/components/editor/chart/chart-types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import themeSchema from "@/constants/prism.data";
import { useElementSize } from "@/hooks/use-element-size";
import { Highlight, type Language } from "prism-react-renderer";
import { Children, isValidElement, type FC } from "react";
import HighlightCodeSnippet from "../code-snippet";
import { CopyCode } from "../copy-code";

type MdPreProps = React.HTMLAttributes<HTMLPreElement>;

const MAX_HEIGHT = 560;
const LANG_RE = /language-(\w+)/;

function getLanguage(child: unknown): Language | "text" {
  if (!child) return "text";

  const className: string | undefined = (
    child as { props: { className?: string } }
  ).props?.className;

  const m = className?.match(LANG_RE);

  let lang = m?.[1] ?? "text";

  if (lang === "ts" || lang === "typescript") lang = "tsx";
  if (lang === "js" || lang === "javascript") lang = "jsx";
  if (lang === "bash" || lang === "sh") lang = "bash";

  return (lang as Language) ?? "text";
}

export const MdPre: FC<MdPreProps> = ({ lang, ...props }) => {
  const { ref: preRef, size } = useElementSize<HTMLPreElement>();

  const measuredHeight = size.height || 0;

  const wrapperHeight =
    measuredHeight > 0 ? Math.min(measuredHeight, MAX_HEIGHT) : undefined;

  const child = getChild(props.children);
  const code = ensureChildExist(child);

  const language = getLanguage(child);

  if (language === "chart") {
    return <ChartRenderer chart={JSON.parse(code) as ChartPayload} />;
  }
  return (
    <div className="w-full my-4 flex justify-center relative overflow-y-hidden">
      <CopyCode
        data={code}
        variant="ghost"
        className="absolute z-20 top-4 right-4 text-muted"
      />
      <ScrollArea
        className="rounded-xl border shadow-xl relative w-full"
        style={{
          height: wrapperHeight ? `${wrapperHeight}px` : "auto",
          maxWidth: "100%",
          maxHeight: `${MAX_HEIGHT}px`,
          backgroundColor: "oklch(0.141 0.005 285.823)",
        }}
      >
        <Highlight theme={themeSchema} code={code} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => {
            return (
              <pre
                ref={preRef}
                style={style}
                className="font-secondary md:px-8 -mt-1 p-6 text-sm whitespace-pre"
              >
                <HighlightCodeSnippet
                  getLineProps={getLineProps}
                  getTokenProps={getTokenProps}
                  tokens={tokens}
                />
              </pre>
            );
          }}
        </Highlight>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

function ensureChildExist(child: React.ReactNode | undefined) {
  if (!child) return "";
  const c = (child as { props: { children?: unknown } }).props?.children;
  if (typeof c === "string") return c.replace(/\n$/, "");
  if (Array.isArray(c)) return c.join("");
  return String(c ?? "");
}

function getChild(children: React.ReactNode) {
  return Children.toArray(children).find((c) => isValidElement(c));
}
