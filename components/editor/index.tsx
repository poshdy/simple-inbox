"use client";
import "./style.css";
import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "../ui/button";
import MenuBar from "./menu-bar";
import MultiSelect, { InputValue } from "./multi-select";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

interface EditorProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  subject: string;
  setSubject: (value: string) => void;

  toValues: InputValue[];
  setToValues: (value: InputValue[]) => void;

  ccValues: InputValue[];
  setCcValues: (value: InputValue[]) => void;

  to: string[];

  defaultToolbarExpanded?: boolean;

  handleSend: (value: string) => void;
}
const EmailEditor = ({
  setValue,
  value,
  ccValues,
  handleSend,
  setCcValues,
  setSubject,
  setToValues,
  subject,
  to,
  toValues,
  defaultToolbarExpanded = false,
}: EditorProps) => {
  const [expanded, setExpanded] = useState<boolean>(defaultToolbarExpanded);
  const editor = useEditor({
    shouldRerenderOnTransaction: false,

    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    onUpdate: (e) => {
      setValue(e.editor.getHTML());
    },
    immediatelyRender: false,
  });
  return (
    <section className="space-y-2 rounded-lg overflow-clip bg-background/90  text-black overflow-y-scroll hide-scrollbar">
      <div>
        <MenuBar editor={editor} />
      </div>
      <div className="space-y-2">
        {/* section to expand */}
        {expanded && (
          <div className="space-y-2 mb-1">
            <MultiSelect
              label="To"
              placeholder="Add recipients"
              value={toValues}
              onChange={setToValues}
            />
            <MultiSelect
              label="Cc"
              placeholder="Add recipients"
              value={ccValues}
              onChange={setCcValues}
            />
            {/* BCC */}
            <Input
              defaultValue={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="placeholder:text-xs font-medium"
            />
          </div>
        )}
        {/* DRAFT */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-semibold text-xs text-green-700">Draft:</span>

          <span className="text-sm ">to: {to.join(",")}</span>
        </div>
      </div>

      <div className="border rounded-md">
        <EditorContent
          editor={editor}
          className="placeholder:text-green-500"
          placeholder="write your email..."
          value={value}
        />
      </div>
      <Separator />
      <Button
        variant={"secondary"}
        onClick={async () => {
          editor?.commands.clearContent();
          await handleSend(value);
        }}
        // isLoading={isSending}
      >
        Send
      </Button>
    </section>
  );
};

export default EmailEditor;
