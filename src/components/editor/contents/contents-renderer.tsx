import type { ContentsData } from "./contents-types";

type ContentsRendererProps = {
  data: ContentsData;
  preventNavigation?: boolean;
};

export function ContentsRenderer({
  data,
  preventNavigation = false,
}: ContentsRendererProps) {
  return (
    <nav aria-label="Table of contents">
      <ol className="m-0 list-decimal space-y-3 pl-5 marker:text-muted-foreground">
        {data.sections.map((section) => (
          <li key={section.id} className="pl-1">
            <a
              href={section.href}
              title={section.href}
              onClick={
                preventNavigation
                  ? (event) => event.preventDefault()
                  : undefined
              }
              className="wrap-break-word text-sm font-medium text-foreground no-underline underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {section.label}
            </a>

            {section.children.length > 0 && (
              <ul className="m-0 mt-2 list-disc space-y-1.5 pl-5 marker:text-muted-foreground/60">
                {section.children.map((child) => (
                  <li key={child.id} className="pl-0.5">
                    <a
                      href={child.href}
                      title={child.href}
                      onClick={
                        preventNavigation
                          ? (event) => event.preventDefault()
                          : undefined
                      }
                      className="wrap-break-word text-sm text-muted-foreground no-underline underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
