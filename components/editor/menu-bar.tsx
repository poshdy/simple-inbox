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

  const isActive = (
    type: string,
    attribute?: Record<string, string | number>
  ): string => {
    return editor.isActive(type, attribute) ? "is-active" : "";
  };

  const iconClassName = "size-3 md:size-4";
  const items = [
    {
      name: "heading",
      children: [
        {
          name: "h1",
          icon: <Heading1 className="size-3 md:size-4" />,
          className: isActive("heading", { level: 1 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          name: "h2",
          icon: <Heading2 className="size-3 md:size-4" />,
          className: isActive("heading", { level: 2 }),
          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          name: "h3",
          icon: <Heading3 className={iconClassName} />,
          className: isActive("heading", { level: 3 }),

          onClick: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
      ],
    },
    {
      name: "list",
      children: [
        {
          name: "ordered",
          icon: <ListOrdered className={iconClassName} />,
          className: isActive("orderedList", { level: 1 }),
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          name: "bullet",
          icon: <List className={iconClassName} />,
          className: isActive("bulletList"),
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
      ],
    },
    {
      name: "text-align",
      children: [
        {
          name: "left",
          icon: <AlignLeft className={iconClassName} />,
          className: editor.isActive({ textAlign: "left" }) ? "is-active" : "",
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
        },
        {
          name: "center",
          icon: <AlignCenter className={iconClassName} />,
          className: editor.isActive({ textAlign: "center" })
            ? "is-active"
            : "",
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
        },
        {
          name: "right",
          icon: <AlignRight className={iconClassName} />,
          className: editor.isActive({ textAlign: "right" }) ? "is-active" : "",
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
        },
      ],
    },
    {
      name: "marks",
      children: [
        {
          name: "bold",
          icon: <Bold className={iconClassName} />,
          className: isActive("bold"),
          onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
          name: "underline",
          icon: <Underline className={iconClassName} />,
          className: isActive("underline"),
          onClick: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
          name: "italic",
          icon: <Italic className={iconClassName} />,
          className: isActive("italic"),
          onClick: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          name: "blockQuote",
          icon: <AlignStartVertical className={iconClassName} />,
          className: isActive("blockQuote"),
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          name: "codeBlock",
          icon: <CodeXml className={iconClassName} />,
          className: isActive("codeBlock"),
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          name: "code",
          icon: <Code className={iconClassName} />,
          className: isActive("code"),
          onClick: () => editor.chain().focus().toggleCode().run(),
        },
        {
          name: "strike",
          icon: <Strikethrough className={iconClassName} />,
          className: isActive("strike"),
          onClick: () => editor.chain().focus().toggleStrike().run(),
        },
        {
          name: "highlight",
          icon: <Highlighter className={iconClassName} />,
          className: isActive("highlight"),
          onClick: () => editor.chain().focus().toggleHighlight().run(),
        },
      ],
    },
  ];
  return (
    <div className="border rounded-md p-1 mb-1 flex gap-1 flex-wrap  bg-background text-primary  z-50">
      {items.map((item) => (
        <div className="space-x-1" key={item.name}>
          {item.children.map((child) => (
            <Toggle
              key={child.name}
              className={child.className}
              onClick={child.onClick}
            >
              {child.icon}
            </Toggle>
          ))}
        </div>
      ))}
    </div>
  );
}
