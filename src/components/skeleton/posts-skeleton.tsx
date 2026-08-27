import { Scales } from "@/components/scales";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function PostsSkeleton() {
  return (
    <Card className="relative size-full bg-transparent">
      <Scales
        orientation="diagonal"
        className="absolute inset-0 -z-10 size-full opacity-50"
        color="#292524"
      />

      <CardHeader>
        <CardTitle>
          <Skeleton className="h-9 w-24 rounded-md" />
        </CardTitle>

        <CardDescription>
          <Skeleton className="h-4 w-52 rounded-sm" />
        </CardDescription>

        <CardAction>
          <Skeleton className="h-8 w-24 rounded-md" />
        </CardAction>
      </CardHeader>

      <CardContent className="scroll-fade flex h-full flex-col gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static index arr
          <PostCardSkeleton key={index} />
        ))}
      </CardContent>
    </Card>
  );
}

function PostCardSkeleton() {
  return (
    <Item variant="outline" size="sm" className="rounded-md">
      <ItemMedia variant="icon">
        <Skeleton className="size-3.5 rounded-sm" />
      </ItemMedia>

      <ItemContent className="min-w-0">
        <ItemTitle>
          <Skeleton className="h-4 w-32 rounded-sm sm:w-48" />
        </ItemTitle>
      </ItemContent>

      <ItemActions>
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="size-7 rounded-md" />
      </ItemActions>
    </Item>
  );
}
