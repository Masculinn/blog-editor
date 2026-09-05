"use client";

import type { LexicalEditor, NodeKey } from "lexical";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClipboardIcon,
  CornerDownRightIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { saveContents } from "./contents-editor";
import { parseContentsMarkdown } from "./contents-markdown";
import { ContentsRenderer } from "./contents-renderer";
import {
  cloneContentsData,
  contentsDataSchema,
  createContentsLink,
  createContentsSection,
  moveContentsItem,
  type ContentsData,
  type ContentsLink,
  type ContentsSection,
} from "./contents-types";

const DEFAULT_CONTENTS_DATA: ContentsData = {
  sections: [
    {
      id: "section-1",
      label: "",
      href: "",
      children: [],
    },
  ],
};

type ContentsDialogBodyProps = {
  initialData?: ContentsData;
  submitLabel?: string;
  onClose: () => void;
  onSave: (data: ContentsData) => string | null;
};

type ContentsDialogProps = {
  initialData: ContentsData;
  isEditing: boolean;
  onClose: () => void;
  onSave: (data: ContentsData) => string | null;
};

type InsertContentsDialogProps = {
  activeEditor: LexicalEditor;
  insertionKey: NodeKey | null;
  onClose: () => void;
};

type EditContentsDialogProps = {
  activeEditor: LexicalEditor;
  nodeKey: NodeKey;
  data: ContentsData;
  onClose: () => void;
};

type LinkRowProps = {
  item: ContentsLink;
  name: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Pick<ContentsLink, "label" | "href">>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

function LinkRow({
  item,
  name,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: LinkRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
        <Input
          aria-label={`${name} title`}
          placeholder="Link title"
          value={item.label}
          maxLength={300}
          onChange={(event) => onChange({ label: event.target.value })}
          className="bg-background/40"
        />

        <Input
          aria-label={`${name} destination`}
          placeholder="#heading-anchor"
          value={item.href}
          maxLength={2_000}
          spellCheck={false}
          onChange={(event) => onChange({ href: event.target.value })}
          className="bg-background/40"
        />
      </div>

      <div className="flex shrink-0 items-center self-end sm:self-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={isFirst}
          aria-label={`Move ${name} up`}
          onClick={() => onMove(-1)}
        >
          <ArrowUpIcon aria-hidden="true" className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={isLast}
          aria-label={`Move ${name} down`}
          onClick={() => onMove(1)}
        >
          <ArrowDownIcon aria-hidden="true" className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          <Trash2Icon aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function ContentsDialogBody({
  initialData = DEFAULT_CONTENTS_DATA,
  submitLabel = "Insert contents",
  onClose,
  onSave,
}: ContentsDialogBodyProps) {
  const [data, setData] = useState(() => cloneContentsData(initialData));

  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const validation = contentsDataSchema.safeParse(data);

  function updateData(update: (current: ContentsData) => ContentsData) {
    setError(null);
    setData(update);
  }

  function updateSection(
    id: string,
    update: (section: ContentsSection) => ContentsSection,
  ) {
    updateData((current) => ({
      sections: current.sections.map((section) =>
        section.id === id ? update(section) : section,
      ),
    }));
  }

  function addSection() {
    const section = createContentsSection();

    updateData((current) => ({
      sections: [...current.sections, section],
    }));
  }

  function importMarkdown() {
    const parsed = parseContentsMarkdown(importText);

    if (!parsed) {
      setError(
        "Use numbered section links followed by bullet links. Only one sublink level is supported, and every link needs a valid destination.",
      );

      return;
    }

    setData(parsed);
    setError(null);
    setImportText("");
    setShowImport(false);
  }

  function submitContents() {
    const result = contentsDataSchema.safeParse(data);

    if (!result.success) {
      const issue = result.error.issues[0];
      const sectionIndex = issue.path[1];

      const childIndex =
        issue.path[2] === "children" ? issue.path[3] : undefined;

      const location =
        typeof sectionIndex === "number"
          ? `Section ${sectionIndex + 1}${
              typeof childIndex === "number"
                ? `, sublink ${childIndex + 1}`
                : ""
            }: `
          : "";

      setError(`${location}${issue.message}`);

      return;
    }

    const saveError = onSave(result.data);

    if (saveError) {
      setError(saveError);

      return;
    }

    onClose();
  }

  return (
    <div className="flex max-h-[75dvh] min-h-0 w-full min-w-140 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-scroll scrollbar-custom overscroll-contain px-1 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {data.sections.length}{" "}
              {data.sections.length === 1 ? "section" : "sections"}
            </p>

            <p className="text-xs text-muted-foreground">
              Add sections and one level of sublinks.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowImport((current) => !current)}
            className="items-center flex justify-center flex-row"
          >
            <ClipboardIcon className="size-4" />
            <span>{showImport ? "Hide import" : "Paste a list"}</span>
          </Button>
        </div>

        {showImport && (
          <Card className="gap-3 bg-muted/20 py-4 shadow-none">
            <CardHeader className="px-4">
              <CardTitle className="text-sm font-medium">
                Import an existing list
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 px-4">
              <Textarea
                aria-label="Contents Markdown to import"
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder={
                  "1. [Introduction](#introduction)\n- [Background](#background)\n\n2. [Conclusion](#conclusion)"
                }
                className="min-h-36 resize-y bg-background/40 font-mono text-xs"
                spellCheck={false}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Replaces the list in this dialog.
                </p>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!importText.trim()}
                  onClick={importMarkdown}
                >
                  Import list
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {data.sections.map((section, sectionIndex) => (
            <Card
              key={section.id}
              className="gap-3 bg-card/40 py-4 shadow-none"
            >
              <CardHeader className="px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Section {sectionIndex + 1}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 px-4">
                <LinkRow
                  item={section}
                  name={`section ${sectionIndex + 1}`}
                  isFirst={sectionIndex === 0}
                  isLast={sectionIndex === data.sections.length - 1}
                  onChange={(patch) =>
                    updateSection(section.id, (current) => ({
                      ...current,
                      ...patch,
                    }))
                  }
                  onMove={(direction) =>
                    updateData((current) => ({
                      sections: moveContentsItem(
                        current.sections,
                        sectionIndex,
                        direction,
                      ),
                    }))
                  }
                  onRemove={() =>
                    updateData((current) => ({
                      sections: current.sections.filter(
                        (item) => item.id !== section.id,
                      ),
                    }))
                  }
                />

                {section.children.length > 0 && (
                  <div className="ml-3 space-y-3 border-l border-border/70 pl-3 sm:ml-4 sm:pl-4">
                    {section.children.map((child, childIndex) => (
                      <LinkRow
                        key={child.id}
                        item={child}
                        name={`section ${sectionIndex + 1}, sublink ${childIndex + 1}`}
                        isFirst={childIndex === 0}
                        isLast={childIndex === section.children.length - 1}
                        onChange={(patch) =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            children: current.children.map((item) =>
                              item.id === child.id
                                ? { ...item, ...patch }
                                : item,
                            ),
                          }))
                        }
                        onMove={(direction) =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            children: moveContentsItem(
                              current.children,
                              childIndex,
                              direction,
                            ),
                          }))
                        }
                        onRemove={() =>
                          updateSection(section.id, (current) => ({
                            ...current,
                            children: current.children.filter(
                              (item) => item.id !== child.id,
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={section.children.length >= 100}
                  onClick={() => {
                    const child = createContentsLink();

                    updateSection(section.id, (current) => ({
                      ...current,
                      children: [...current.children, child],
                    }));
                  }}
                  className="text-muted-foreground"
                >
                  <CornerDownRightIcon
                    aria-hidden="true"
                    className="size-3.5"
                  />
                  Add sublink
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={data.sections.length >= 100}
          onClick={addSection}
          className="w-full border-dashed"
        >
          <PlusIcon aria-hidden="true" className="size-4" />
          Add section
        </Button>

        {validation.success && (
          <Card className="gap-3 bg-transparent py-4 shadow-none">
            <CardHeader className="px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Preview
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4">
              <ContentsRenderer data={validation.data} preventNavigation />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="shrink-0 space-y-3 border-t pt-4">
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="button" onClick={submitContents}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InsertContentsDialog({
  activeEditor,
  insertionKey,
  onClose,
}: InsertContentsDialogProps) {
  return (
    <ContentsDialogBody
      submitLabel="Insert contents"
      onClose={onClose}
      onSave={(data) =>
        saveContents(
          activeEditor,
          {
            type: "insert",
            insertionKey,
          },
          data,
        )
      }
    />
  );
}

export function EditContentsDialog({
  activeEditor,
  nodeKey,
  data,
  onClose,
}: EditContentsDialogProps) {
  return (
    <ContentsDialogBody
      initialData={data}
      submitLabel="Save changes"
      onClose={onClose}
      onSave={(nextData) =>
        saveContents(
          activeEditor,
          {
            type: "update",
            nodeKey,
          },
          nextData,
        )
      }
    />
  );
}

export function ContentsDialog({
  initialData,
  isEditing,
  onClose,
  onSave,
}: ContentsDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">
            {isEditing ? "Edit table of contents" : "Table of contents"}
          </DialogTitle>

          <DialogDescription>
            Arrange the links in your document’s table of contents.
          </DialogDescription>
        </DialogHeader>

        <ContentsDialogBody
          initialData={initialData}
          submitLabel={isEditing ? "Save changes" : "Insert contents"}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}
