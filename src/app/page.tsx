import { EditorBg } from "@/components/editor-bg";
import { Editor } from "@/features/editor";

export default function Home() {
  return (
    <div className="flex items-center justify-center relative size-full overflow-hidden">
      <Editor className="mx-auto z-50" />
      <EditorBg />
    </div>
  );
}
