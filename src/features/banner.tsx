"use client";

import { Scales } from "@/components/scales";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRightIcon, NotebookPenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <div className="size-full relative md:pl-3 md:pb-3 overflow-hidden">
      <Card
        className="size-full relative bg-transparent overflow-hidden group pl-3"
        size="sm"
      >
        <Scales
          orientation="diagonal"
          className="absolute -z-10 size-full inset-0 opacity-50"
          color="#292524"
        />
        <CardHeader className="">
          <CardTitle className="inline-flex items-center">
            <h1 className="laptop:text-3xl desktop:text-4xl text-2xl font-secondary">
              justc0de_sessions
              <span className="laptop:text-3xl desktop:text-4xl text-2xl font-accent text-rose-500">
                {"("}BUT IT'S ANONYMOUS!!{")"}
              </span>
            </h1>
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-3xl leading-snug font-secondary text-xs">
            I built this editor to make writing articles easier, and I’ve
            open-sourced it for everyone on{" "}
            <Link
              href="https://github.com/Masculinn/blog-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:no-underline hover:cursor-pointer hover:text-primary/80"
            >
              GitHub
            </Link>
            . You can also leave an anonymous
            <NotebookPenIcon className="size-4 text-primary inline mx-1" />
            below as a small keepsake for everyone who visits the site 😀
          </CardDescription>
          <CardAction>
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <Link
                  href="https://github.com/Masculinn/blog-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Image
                className="size-4 rounded-2xl"
                height={20}
                width={24}
                src="/assets/github-logo.png"
                alt="Github Logo"
              />
              <span>View Repo</span>
              <ArrowUpRightIcon className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
