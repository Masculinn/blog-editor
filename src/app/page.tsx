import { EditorBg } from "@/components/editor-bg";
import { Editor } from "@/features/editor";
import { Toaster } from "sonner";

export const instant = false;

export default function Home() {
  return (
    <div className="flex items-center justify-center relative font-sans size-full  overflow-hidden">
      <Toaster />
      <Editor className=" mx-auto z-50 " />
      <EditorBg />
    </div>
  );
}
