import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Heading, { Level } from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "../ui/button";
import {
  BlocksIcon,
  BoldIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EmailEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    onUpdate: (e) => {
      console.log(e.editor.getHTML());
    },
    content: "Hello world!",
    immediatelyRender: false,
  });
  return (
    <section className=" w-[95%] mx-auto mb-2 rounded-lg overflow-clip bg-background border border-muted h-[50vh] text-black ">
      <div className="w-full p-3 bg-primary-foreground flex items-start gap-3">
        <Select
          onValueChange={(e) => {
            editor
              ?.chain()
              .focus()
              .setHeading({
                level: Number(e) as Level,
              })
              .run();
          }}
        >
          <SelectTrigger className="w-[60px]">
            <SelectValue placeholder="H" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Headings</SelectLabel>
              <SelectItem value="1">
                <Heading1 /> Heading 1
              </SelectItem>
              <SelectItem value="2">
                <Heading2 /> Heading 2
              </SelectItem>
              <SelectItem value="3">
                <Heading3 /> Heading 3
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          className={`${
            editor?.isActive("blockQoute")
              ? "bg-accent-foreground"
              : "bg-accent"
          }`}
          onClick={() => editor?.chain().toggleBlockquote().run()}
          size={"icon"}
        >
          <BlocksIcon />
        </Button>
        <Button
          className={`${
            editor?.isActive("codeBlock") ? "bg-accent-foreground" : "bg-accent"
          }`}
          onClick={() => editor?.chain().toggleCodeBlock().run()}
          size={"icon"}
        >
          <Code />
        </Button>
        <Button
          className={`${
            editor?.isActive("bold") ? "bg-accent-foreground" : "bg-accent"
          }`}
          onClick={() => editor?.chain().toggleBold().run()}
          size={"icon"}
        >
          <BoldIcon />
        </Button>
      </div>
      {/* MENU BAR */}
      <EditorContent
        className="w-full h-full border-none outline-none  focus:ring-0 text-primary"
        editor={editor}
      />
    </section>
  );
};

export default EmailEditor;
