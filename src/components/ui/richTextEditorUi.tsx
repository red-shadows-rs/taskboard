"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Indent,
  Outdent,
} from "lucide-react";
import { cn } from "@/components/ui/utilsUi";
import { Button } from "@/components/ui/buttonUi";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
}

const MenuBar = ({
  editor,
  dir,
}: {
  editor: Editor | null;
  dir?: "ltr" | "rtl";
}) => {
  if (!editor) {
    return null;
  }

  const isRTL = dir === "rtl";

  const IndentIcon = isRTL ? Outdent : Indent;
  const OutdentIcon = isRTL ? Indent : Outdent;
  const LeftAlignIcon = isRTL ? AlignRight : AlignLeft;
  const RightAlignIcon = isRTL ? AlignLeft : AlignRight;
  const UndoIcon = isRTL ? Redo : Undo;
  const RedoIcon = isRTL ? Undo : Redo;

  const buttons = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("h-7 w-7 p-0", editor.isActive("bold") ? "bg-muted" : "")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "h-7 w-7 p-0",
          editor.isActive("italic") ? "bg-muted" : "",
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn(
          "h-7 w-7 p-0",
          editor.isActive("underline") ? "bg-muted" : "",
        )}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-7 w-7 p-0",
          editor.isActive("bulletList") ? "bg-muted" : "",
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-7 w-7 p-0",
          editor.isActive("orderedList") ? "bg-muted" : "",
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        disabled={!editor.can().chain().focus().liftListItem("listItem").run()}
        className="h-7 w-7 p-0"
      >
        <OutdentIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        disabled={!editor.can().chain().focus().sinkListItem("listItem").run()}
        className="h-7 w-7 p-0"
      >
        <IndentIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      {isRTL ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive({ textAlign: "right" }) ? "bg-muted" : "",
            )}
          >
            <RightAlignIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive({ textAlign: "center" }) ? "bg-muted" : "",
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive({ textAlign: "left" }) ? "bg-muted" : "",
            )}
          >
            <LeftAlignIcon className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive({ textAlign: "left" }) ? "bg-muted" : "",
            )}
          >
            <LeftAlignIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive({ textAlign: "center" }) ? "bg-muted" : "",
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={cn(
              "h-7 w-7 p-0",
              editor.isActive({ textAlign: "right" }) ? "bg-muted" : "",
            )}
          >
            <RightAlignIcon className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-7 w-7 p-0"
      >
        <UndoIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-7 w-7 p-0"
      >
        <RedoIcon className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <div
      className={cn(
        "border border-input border-b-0 rounded-t-md bg-muted/20 p-1 flex flex-wrap gap-1",
        isRTL ? "flex-row-reverse" : "",
      )}
    >
      {buttons}
    </div>
  );
};

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  dir = "ltr",
  disabled = false,
}: RichTextEditorProps) {
  const isFirstRender = useRef(true);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: dir === "rtl" ? "right" : "left",
      }),
      Placeholder.configure({
        placeholder: placeholder || "",
        emptyEditorClass:
          dir === "rtl"
            ? "is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-right before:pointer-events-none before:h-0"
            : "is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content: content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none p-3 min-h-[100px] focus-visible:outline-none",
          dir === "rtl" ? "text-right" : "text-left",
        ),
        dir: dir,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (editor.getText() === "" && content === "") {
        return;
      } else if (Math.abs(editor.getHTML().length - content.length) > 5) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div className="border border-input rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-ring overflow-hidden bg-background">
      <MenuBar editor={editor} dir={dir} />
      <EditorContent editor={editor} className="min-h-[100px]" />
    </div>
  );
}
