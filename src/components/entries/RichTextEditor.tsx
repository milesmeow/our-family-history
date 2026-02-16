"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  Unlink,
} from "lucide-react";

interface RichTextEditorProps {
  initialContent?: string;
  inputName?: string;
  placeholder?: string;
}

export function RichTextEditor({
  initialContent = "",
  inputName = "content",
  placeholder,
}: RichTextEditorProps) {
  const t = useTranslations("entries.editor");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const linkPopoverRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] max-h-[600px] overflow-y-auto px-4 py-3 focus:outline-none prose prose-gray max-w-none",
      },
    },
  });

  // Close link popover when clicking outside
  useEffect(() => {
    if (!showLinkPopover) return;
    const handleClick = (e: MouseEvent) => {
      if (
        linkPopoverRef.current &&
        !linkPopoverRef.current.contains(e.target as Node)
      ) {
        setShowLinkPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLinkPopover]);

  // Skeleton while editor hydrates
  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
        <div className="min-h-[240px] bg-white animate-pulse" />
      </div>
    );
  }

  // Empty editor sends "" so Zod min(1) catches it
  const hiddenValue = editor.isEmpty ? "" : editor.getHTML();

  const handleSetLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url }).run();
    }
    setShowLinkPopover(false);
    setLinkUrl("");
  };

  const openLinkPopover = () => {
    const existingHref = editor.getAttributes("link").href ?? "";
    setLinkUrl(existingHref);
    setShowLinkPopover(true);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Hidden input carries HTML into FormData */}
      <input type="hidden" name={inputName} value={hiddenValue} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title={t("bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title={t("italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title={t("heading2")}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title={t("heading3")}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Lists & blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title={t("bulletList")}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title={t("orderedList")}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title={t("blockquote")}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={openLinkPopover}
            isActive={editor.isActive("link")}
            title={t("link")}
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          {showLinkPopover && (
            <div
              ref={linkPopoverRef}
              className="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex gap-2 items-center min-w-[280px]"
            >
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetLink();
                  }
                }}
                placeholder="https://example.com"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSetLink}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t("setLink")}
              </button>
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setShowLinkPopover(false);
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                  title={t("unlink")}
                >
                  <Unlink className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor content area */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}

// --- Sub-components ---

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "p-1.5 rounded-md transition-colors",
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-gray-200 mx-1" aria-hidden="true" />;
}
