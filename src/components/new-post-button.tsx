"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function NewPostButton() {
  const router = useRouter();

  function handleNewPost() {
    router.replace("/");
  }

  return (
    <Button variant="success" onClick={handleNewPost}>
      <PlusIcon className="size-4" />
      New Post
    </Button>
  );
}
