"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import type { LexicalEditor } from "lexical";

interface EditorCapturePluginProps {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}

export default function EditorCapturePlugin({
  editorRef,
}: EditorCapturePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);

  return null;
}
