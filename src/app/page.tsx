import { Editor } from "@/features/editor";
import { Toaster } from "sonner";

export const instant = false;

export default function Home() {
  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-black py-8">
      <Toaster />
      <Editor className="max-w-7xl mx-auto" />
    </div>
  );
}
