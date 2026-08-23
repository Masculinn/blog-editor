import { ComponentPickerOption } from "@/components/component-picker-option";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
} from "lucide-react";

export function HeadingPickerPlugin({ n }: { n: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return new ComponentPickerOption(`Heading ${n}`, {
    icon: <HeadingIcons n={n} />,
    keywords: ["heading", "header", `h${n}`],
    onSelect: (_, editor) =>
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
        }
      }),
  });
}

function HeadingIcons({ n }: { n: number }) {
  switch (n) {
    case 1:
      return <Heading1Icon className="size-4" />;
    case 2:
      return <Heading2Icon className="size-4" />;
    case 3:
      return <Heading3Icon className="size-4" />;
    case 4:
      return <Heading4Icon className="size-4" />;
    case 5:
      return <Heading5Icon className="size-4" />;
    case 6:
      return <Heading6Icon className="size-4" />;
  }
}
