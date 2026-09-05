import {
  contentsDataSchema,
  type ContentsData,
  type ContentsLink,
  type ContentsSection,
} from "./contents-types";

function escapeMarkdownLabel(value: string): string {
  return value.replace(/[\\`*{}[\]()#+.!_<>|~&-]/gu, "\\$&");
}

function unescapeMarkdown(value: string): string {
  return value.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/gu, "$1");
}

function serializeLink(link: ContentsLink): string {
  const href = link.href.replace(/[()]/gu, "\\$&");

  return `[${escapeMarkdownLabel(link.label)}](${href})`;
}

function serializeContentsBody(data: ContentsData): string {
  const lines: string[] = [];

  data.sections.forEach((section, index) => {
    const previous = data.sections[index - 1];

    if (previous && previous.children.length > 0) {
      lines.push("");
    }

    lines.push(`${index + 1}. ${serializeLink(section)}`);

    for (const child of section.children) {
      lines.push(`- ${serializeLink(child)}`);
    }
  });

  return lines.join("\n");
}

export function serializeContentsMarkdown(data: ContentsData): string {
  return `<Contents>\n\n${serializeContentsBody(data)}\n\n</Contents>`;
}

function parseLink(value: string, id: string): ContentsLink | null {
  const match = /^\[((?:\\.|[^\]\\])*)\]\((.+)\)$/u.exec(value);

  if (!match) {
    return null;
  }

  let href = match[2];

  if (href.startsWith("<") && href.endsWith(">")) {
    href = href.slice(1, -1);
  }

  return {
    id,
    label: unescapeMarkdown(match[1]),
    href: unescapeMarkdown(href),
  };
}

export function parseContentsMarkdown(markdown: string): ContentsData | null {
  let source = markdown.replace(/\r\n?/gu, "\n").trim();

  if (source.startsWith("<Contents>")) {
    const wrapped = /^<Contents>[ \t]*\n([\s\S]*?)\n[ \t]*<\/Contents>$/u.exec(
      source,
    );

    if (!wrapped) {
      return null;
    }

    source = wrapped[1];
  }

  const sections: ContentsSection[] = [];

  let currentSection: ContentsSection | null = null;
  let childIndent: number | null = null;

  for (const rawLine of source.split("\n")) {
    if (!rawLine.trim()) {
      continue;
    }

    const parentMatch = /^([ ]{0,3})\d+[.)][ \t]+(.+)$/u.exec(rawLine);

    if (parentMatch) {
      const link = parseLink(
        parentMatch[2].trim(),
        `section-${sections.length + 1}`,
      );

      if (!link) {
        return null;
      }

      currentSection = {
        ...link,
        children: [],
      };

      sections.push(currentSection);
      childIndent = null;

      continue;
    }

    const childMatch = /^([ ]*)[-*+][ \t]+(.+)$/u.exec(rawLine);

    if (!childMatch || !currentSection) {
      return null;
    }

    const indent = childMatch[1].length;

    if (childIndent !== null && indent !== childIndent) {
      return null;
    }

    childIndent = indent;

    const child = parseLink(
      childMatch[2].trim(),
      `${currentSection.id}-child-${currentSection.children.length + 1}`,
    );

    if (!child) {
      return null;
    }

    currentSection.children.push(child);
  }

  const result = contentsDataSchema.safeParse({ sections });

  return result.success ? result.data : null;
}
