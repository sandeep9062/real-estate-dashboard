"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import type { LexicalEditor } from "lexical";

interface EditorCapturePluginProps {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
  onChange?: () => void;
}

export default function EditorCapturePlugin({
  editorRef,
  onChange,
}: EditorCapturePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);

  // Register onChange listener
  useEffect(() => {
    if (!onChange) return;
    return editor.registerUpdateListener(() => {
      onChange();
    });
  }, [editor, onChange]);

  return null;
}
