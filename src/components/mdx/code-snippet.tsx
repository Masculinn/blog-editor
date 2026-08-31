import type {
  LineInputProps,
  LineOutputProps,
  Token,
  TokenInputProps,
  TokenOutputProps,
} from "prism-react-renderer";

type TokenLinesProps = {
  tokens: Token[][];
  getLineProps: (input: LineInputProps) => LineOutputProps;
  getTokenProps: (input: TokenInputProps) => TokenOutputProps;
};

function HighlightCodeSnippet({
  tokens,
  getLineProps,
  getTokenProps,
}: TokenLinesProps) {
  return tokens.map((line, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static data
    <div key={i} {...getLineProps({ line })} className="flex">
      <span className="mr-6 dark:text-muted text-muted-foreground">
        {i + 1}
      </span>
      {line.map((v, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static data
        <span key={idx} {...getTokenProps({ token: v })} />
      ))}
    </div>
  ));
}

export default HighlightCodeSnippet;
