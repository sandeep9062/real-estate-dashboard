"use client";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface RichTextEditorRef {
  /** Replace the document. Safe to call before the editor has mounted
   *  (the value is queued). Does NOT fire onChange. */
  setContent: (content: string) => void;
  /** Markdown when isMarkdown, otherwise HTML. "" when the doc is empty. */
  getCurrentContent: () => string;
  focus: () => void;
  isEmpty: () => boolean;
}

interface RichTextEditorProps {
  /** Initial content. Later changes go through ref.setContent(). */
  content?: string;
  /** true: content is Markdown in/out. false: HTML in/out. */
  isMarkdown?: boolean;
  /** Fired on every user edit (not on setContent). */
  onChange?: () => void;
  placeholder?: string;
  minHeight?: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function readContent(editor: Editor, isMarkdown: boolean): string {
  if (editor.isEmpty) return "";
  return isMarkdown
    ? ((editor.storage as any).markdown.getMarkdown() as string)
    : editor.getHTML();
}

// Only allow safe URL schemes; bare domains get https://
function normalizeUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null; // javascript:, data:, ...
  return `https://${url}`;
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                             */
/* ------------------------------------------------------------------ */

function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      // type="button" is essential: inside the journal <form> a default
      // button would submit the form.
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // keep the text selection when clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 min-w-8 px-2 inline-flex items-center justify-center rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? "bg-[#4161df] text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="w-px h-5 bg-slate-200 mx-1" />;

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = (editor.getAttributes("link").href as string) ?? "";
    const input = window.prompt("Link URL (leave empty to remove)", prev);
    if (input === null) return;

    if (!input.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = normalizeUrl(input);
    if (!href) {
      window.alert("That URL type isn't allowed. Use http(s), mailto or tel.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const addImage = () => {
    const input = window.prompt("Image URL");
    if (!input) return;
    const src = normalizeUrl(input);
    if (!src || /^(mailto|tel):/i.test(src)) {
      window.alert("Please enter a valid image URL.");
      return;
    }
    const alt = window.prompt("Alt text (describe the image for SEO)") || "";
    editor.chain().focus().setImage({ src, alt }).run();
  };

  const inTable = editor.isActive("table");

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50/60"
      role="toolbar"
      aria-label="Text formatting"
    >
      <Btn
        title="Undo (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 size={15} />
      </Btn>
      <Btn
        title="Redo (Ctrl+Shift+Z)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 size={15} />
      </Btn>

      <Divider />

      {/* H1 is reserved for the article title, so the toolbar starts at H2 */}
      <Btn
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </Btn>
      <Btn
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={16} />
      </Btn>
      <Btn
        title="Heading 4"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <Heading4 size={16} />
      </Btn>

      <Divider />

      <Btn
        title="Bold (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </Btn>
      <Btn
        title="Italic (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </Btn>
      <Btn
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </Btn>
      <Btn
        title="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code size={15} />
      </Btn>

      <Divider />

      <Btn
        title="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </Btn>
      <Btn
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </Btn>
      <Btn
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </Btn>
      <Btn
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={16} />
      </Btn>
      <Btn
        title="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={16} />
      </Btn>

      <Divider />

      <Btn
        title="Add / edit link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon size={15} />
      </Btn>
      <Btn
        title="Remove link"
        disabled={!editor.isActive("link")}
        onClick={() =>
          editor.chain().focus().extendMarkRange("link").unsetLink().run()
        }
      >
        <Unlink size={15} />
      </Btn>
      <Btn title="Insert image from URL" onClick={addImage}>
        <ImageIcon size={15} />
      </Btn>
      <Btn
        title="Insert table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon size={15} />
      </Btn>

      <Divider />

      <Btn
        title="Clear formatting"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
      >
        <RemoveFormatting size={15} />
      </Btn>

      {/* Table tools appear only while the cursor is inside a table */}
      {inTable && (
        <>
          <Divider />
          <Btn
            title="Add row below"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            + Row
          </Btn>
          <Btn
            title="Add column after"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            + Col
          </Btn>
          <Btn
            title="Delete row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            − Row
          </Btn>
          <Btn
            title="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            − Col
          </Btn>
          <Btn
            title="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Del table
          </Btn>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor(
    {
      content = "",
      isMarkdown = false,
      onChange,
      placeholder = "Start writing your article...",
      minHeight = 420,
    },
    ref,
  ) {
    // Content requested via ref before the editor exists (it is created after
    // mount because of immediatelyRender: false). Applied as soon as ready.
    const pendingRef = useRef<string | null>(null);
    // Always call the latest onChange without re-creating the editor.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Re-render toolbar active states on every transaction (works on all
    // TipTap v2 versions).
    const [, forceRender] = useReducer((n: number) => n + 1, 0);

    const editor = useEditor({
      immediatelyRender: false, // avoids SSR/hydration mismatch in Next.js
      extensions: [
        StarterKit.configure({
          // Keep H1 so existing articles that contain it aren't flattened;
          // the toolbar only offers H2–H4.
          heading: { levels: [1, 2, 3, 4] },
        }),
        LinkExt.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        }),
        ImageExt.configure({ inline: false }),
        Placeholder.configure({ placeholder }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
        Markdown.configure({
          html: true, // keep inline HTML found in existing articles
          tightLists: true,
          bulletListMarker: "-",
          linkify: false,
          breaks: false,
          transformPastedText: true, // pasted Markdown becomes formatted text
          transformCopiedText: false,
        }),
      ],
      content,
      editorProps: {
        attributes: {
          class:
            "rte prose prose-slate max-w-none px-6 py-5 focus:outline-none",
          style: `min-height:${minHeight}px`,
        },
      },
      onUpdate: () => onChangeRef.current?.(),
      onTransaction: () => forceRender(),
    });

    // Apply content that was requested before the editor was ready
    useEffect(() => {
      if (editor && pendingRef.current !== null) {
        editor.commands.setContent(pendingRef.current, false); // false = no onUpdate
        pendingRef.current = null;
        forceRender();
      }
    }, [editor]);

    const getCurrentContent = useCallback(() => {
      if (editor) return readContent(editor, isMarkdown);
      return pendingRef.current ?? content;
    }, [editor, isMarkdown, content]);

    useImperativeHandle(
      ref,
      () => ({
        setContent: (value: string) => {
          if (editor) {
            editor.commands.setContent(value || "", false);
          } else {
            pendingRef.current = value || "";
          }
        },
        getCurrentContent,
        focus: () => editor?.commands.focus(),
        isEmpty: () =>
          editor ? editor.isEmpty : !(pendingRef.current ?? content),
      }),
      [editor, getCurrentContent, content],
    );

    return (
      <div className="bg-white">
        {/* Scoped styles for things Tailwind's prose doesn't cover */}
        <style>{`
          .rte p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left; height: 0; pointer-events: none; color: #cbd5e1;
          }
          .rte table { border-collapse: collapse; width: 100%; table-layout: fixed; margin: 1rem 0; }
          .rte th, .rte td { border: 1px solid #e2e8f0; padding: .5rem .75rem; vertical-align: top; }
          .rte th { background: #f8fafc; font-weight: 600; text-align: left; }
          .rte .selectedCell { background: rgba(65,97,223,.08); }
          .rte img { border-radius: .75rem; max-width: 100%; height: auto; }
          .rte img.ProseMirror-selectednode { outline: 2px solid #4161df; }
          .rte a { color: #4161df; }
          .rte pre { background: #0f172a; color: #e2e8f0; border-radius: .75rem; }
          .rte pre code { background: transparent; color: inherit; padding: 0; }
        `}</style>

        {editor ? (
          <Toolbar editor={editor} />
        ) : (
          <div className="h-[49px] border-b border-slate-100 bg-slate-50/60" />
        )}
        <EditorContent editor={editor} />
      </div>
    );
  },
);

export default RichTextEditor;
