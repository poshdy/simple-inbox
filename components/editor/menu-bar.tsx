import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  Bold,
  Code,
  CodeXml,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md p-1 mb-1 flex gap-1 flex-wrap  bg-background text-primary  z-50">
      <div className="flex items-center gap-1">
        <Toggle
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
          // pressed={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="size-4" />
        </Toggle>
        <Toggle
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
          // pressed={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </Toggle>
        <Toggle
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
          // pressed={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-4" />
        </Toggle>
        <span className="w-[0.5px] h-5 bg-zinc-500" />
      </div>

      <div className="flex items-center gap-1">
        <Toggle
          className={editor.isActive("bold") ? "is-active" : ""}
          // pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Toggle>
        <Toggle
          className={editor.isActive("underline") ? "is-active" : ""}
          // pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </Toggle>
        <Toggle
          className={editor.isActive("italic") ? "is-active" : ""}
          // pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Toggle>
        <Toggle
          className={editor.isActive("blockQuote") ? "is-active" : ""}
          // pressed={editor.isActive("blockQuote")}
          onClick={() => editor?.chain().toggleBlockquote().run()}
        >
          <AlignStartVertical className="size-4" />
        </Toggle>
        <Toggle
          className={editor.isActive("codeBlock") ? "is-active" : ""}
          // pressed={editor.isActive("codeBlock")}
          onClick={() => editor?.chain().toggleCodeBlock().run()}
        >
          <CodeXml className="size-4" />
        </Toggle>
        <Toggle
          className={editor.isActive("code") ? "is-active" : ""}
          // pressed={editor.isActive("code")}
          onClick={() => editor?.chain().toggleCode().run()}
        >
          <Code className="size-4" />
        </Toggle>

        <Toggle
          // pressed={editor.isActive("strike")}
          className={editor.isActive("strike") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </Toggle>

        <Toggle
          // pressed={editor.isActive("highlight")}
          className={editor.isActive("highlight") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="size-4" />
        </Toggle>
        <span className="w-[0.5px] h-5 bg-zinc-500" />
      </div>

      <div className="flex items-center gap-1">
        <Toggle
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          // pressed={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </Toggle>
        <Toggle
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
          // pressed={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </Toggle>
        <Toggle
          // pressed={editor.isActive({ textAlign: "right" })}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </Toggle>

        <span className="w-[0.5px] h-5 bg-zinc-500" />
      </div>

      <div className="flex items-center gap-1">
        <Toggle
          // pressed={editor.isActive("bulletList")}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Toggle>

        <Toggle
          // pressed={editor.isActive("orderedList")}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Toggle>
      </div>
    </div>
  );
}
