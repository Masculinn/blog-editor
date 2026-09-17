"use client";

import settings from "@/settings/client";
import { TimerIcon } from "lucide-react";
import { Badge } from "../ui/badge";

export function PostReadingTime({ source }: { source: string }) {
  const readingTime = getReadingTime(source);
  return (
    <Badge
      variant="outline"
      className="absolute top-70.5 left-4 z-50 font-secondary font-extralight"
    >
      <TimerIcon />
      {Math.ceil(readingTime)} min
    </Badge>
  );
}

const { secondsPerImage, wordsPerMinute } = settings.readingTime;

const FRONTMATTER_RE = /^\s*---[\s\S]*?---\s*/;

const FENCED_CODE_BLOCK_RE = /```[\s\S]*?```/g;
const FENCED_CODE_BLOCK_ALT_RE = /~~~[\s\S]*?~~~/g;
const INLINE_CODE_RE = /`[^`]*`/g;

const MD_IMAGE_RE = /!\[([^\]]*)\]\([^)]+\)/g;
const MD_IMAGE_COUNT_RE = /!\[[^\]]*\]\([^)]+\)/g;

const MD_LINK_RE = /\[([^\]]+)\]\([^)]+\)/g;
const MD_REF_LINK_RE = /\[([^\]]+)\]\s*\[[^\]]*\]/g;
const MD_LINK_DEFINITION_RE = /^[ \t]*\[[^\]]+\]:.*$/gm;

const MD_BLOCK_MARKER_RE = /^[ \t]*[#>*+-]+[ \t]*/gm;
const MD_EMPHASIS_RE = /[*_~]{1,3}/g;
const WHITESPACE_RE = /\s+/g;

const WORD_RE = /[\p{L}\p{N}]+(?:['\u2019-][\p{L}\p{N}]+)*/gu;

function countImages(input: string): number {
  return input.match(MD_IMAGE_COUNT_RE)?.length ?? 0;
}

function stripMarkdown(input: string): string {
  let text = input;

  text = text.replace(FRONTMATTER_RE, "");

  text = text.replace(FENCED_CODE_BLOCK_RE, " ");
  text = text.replace(FENCED_CODE_BLOCK_ALT_RE, " ");
  text = text.replace(INLINE_CODE_RE, " ");

  text = text.replace(MD_IMAGE_RE, (_match, alt: string) =>
    alt ? `${alt} ` : " ",
  );

  text = text.replace(MD_LINK_RE, (_match, label: string) =>
    label ? `${label} ` : " ",
  );
  text = text.replace(MD_REF_LINK_RE, (_match, label: string) =>
    label ? `${label} ` : " ",
  );
  text = text.replace(MD_LINK_DEFINITION_RE, " ");

  text = text.replace(MD_BLOCK_MARKER_RE, " ");
  text = text.replace(MD_EMPHASIS_RE, " ");

  return text.replace(WHITESPACE_RE, " ").trim();
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.match(WORD_RE)?.length ?? 0;
}

/*
    gets the total reading time of undergoing markdown content
    will be delayed in the upstream
*/
function getReadingTime(content: string): number {
  const raw = (content ?? "").toString();
  if (!raw.trim()) return 0;

  const images = countImages(raw);
  const cleaned = stripMarkdown(raw);
  const words = countWords(cleaned);

  const secondsFromWords = (words / wordsPerMinute) * 60;
  const totalSeconds = Math.max(
    0,
    Math.round(secondsFromWords + images * secondsPerImage),
  );

  return Math.ceil(totalSeconds / 60);
}
