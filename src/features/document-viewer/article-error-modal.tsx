import { CopyCode } from "@/components/mdx/copy-code";
import { Scales } from "@/components/scales";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchAlertIcon } from "lucide-react";

export function ArticleErrorModal({ name, message, stack }: Error) {
  return (
    <Card size="sm" className="bg-transparent mx-4 mb-12 relative">
      <Scales
        orientation="diagonal"
        className="absolute inset-0 opacity-50 top-0 size-full left-0 -z-10"
        color="#292524"
      />
      <CardHeader>
        <CardTitle className="flex gap-1.5 items-center text-rose-500 ">
          <SearchAlertIcon />
          <h3 className="text-2xl tracking-tighter">Compile {name}</h3>
        </CardTitle>
        <CardDescription>{message}</CardDescription>
        <CardAction>
          {stack && <CopyCode data={stack} variant="ghost" />}
        </CardAction>
      </CardHeader>
      <CardContent className="max-h-auto scrollbar-custom overflow-x-  scroll-fade text-[10px] pr-2">
        <code>{stack}</code>
      </CardContent>
    </Card>
  );
}
