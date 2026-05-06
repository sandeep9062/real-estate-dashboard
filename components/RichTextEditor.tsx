"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import EditorCapturePlugin from "./editor/EditorCapturePlugin";
// Fix the markdown imports
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import {
  $isTextNode,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  isHTMLElement,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
  $getRoot,
  $getSelection,
  $createRangeSelection,
  $setSelection,
} from "lexical";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import ExampleTheme from "./editor/ExampleTheme";
import ToolbarPlugin from "./editor/ToolbarPlugin";
import { parseAllowedColor, parseAllowedFontSize } from "./editor/styleConfig";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";

const placeholder = "Start writing your content...";
import "./editor/styles.css";

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode,
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    // Remove all inline styles and classes if the element is an HTMLElement
    // Children are checked as well since TextNode can be nested
    // in i, b, and strong tags.
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class],[dir="ltr"]'),
    ]) {
      el.removeAttribute("class");
      el.removeAttribute("style");
      if (el.getAttribute("dir") === "ltr") {
        el.removeAttribute("dir");
      }
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = "";
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== "" && fontSize !== "15px") {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== "" && backgroundColor !== "rgb(255, 255, 255)") {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== "" && color !== "rgb(0, 0, 0)") {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: "React.js Demo",
  // Add the node types needed for markdown
  nodes: [
    ParagraphNode,
    TextNode,
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
  ],
  onError(error: Error) {
    throw error;
  },
  theme: ExampleTheme,
};

// Keep your editorConfig and MARKDOWN_TRANSFORMERS as they are, but use the standard TRANSFORMERS
const MARKDOWN_TRANSFORMERS = TRANSFORMERS;

// Define the ref interface for exposed methods
export interface RichTextEditorRef {
  getCurrentContent: () => string;
  setContent: (content: string) => void;
}

interface RichTextEditorProps {
  content?: string; // Accept either markdown or HTML content
  isStreaming?: boolean;
  isMarkdown?: boolean; // Flag to indicate if content is markdown
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content = "", isStreaming = false, isMarkdown = true }, ref) => {
    const editorRef = useRef<LexicalEditor | null>(null);
    const prevContentRef = useRef<string>("");
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    // Add these states for scroll control
    const userHasScrolled = useRef(false);
    const isNearBottom = useRef(true);

    // Expose methods to the parent component via ref
    useImperativeHandle(ref, () => ({
      getCurrentContent: () => {
        if (!editorRef.current) return "";

        let currentContent = "";
        editorRef.current.getEditorState().read(() => {
          currentContent = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
        });

        return currentContent;
      },
      setContent: (newContent: string) => {
        if (!editorRef.current) return;

        editorRef.current.update(() => {
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(newContent, MARKDOWN_TRANSFORMERS);
          prevContentRef.current = newContent;
        });
      },
    }));

    // Function to check if user is near the bottom of the content
    const checkIfNearBottom = () => {
      if (editorContainerRef.current) {
        const editorElement =
          editorContainerRef.current.querySelector(".editor-input");
        if (editorElement) {
          const { scrollTop, scrollHeight, clientHeight } = editorElement;
          // Consider "near bottom" if within 50px of the bottom
          isNearBottom.current = scrollHeight - scrollTop - clientHeight < 50;
        }
      }
    };

    // Improved scroll to bottom that respects user scrolling
    const scrollToBottom = () => {
      if (!userHasScrolled.current || isNearBottom.current) {
        if (editorContainerRef.current) {
          const editorElement =
            editorContainerRef.current.querySelector(".editor-input");
          if (editorElement) {
            editorElement.scrollTop = editorElement.scrollHeight;
          }
        }
      }
    };

    // Extract the onClick handler for the container
    const handleEditorContainerClick = () => {
      // Only enable editing when not streaming and editor is not already enabled
      if (!isStreaming) {
        if (editorRef.current) {
          editorRef.current.setEditable(true);
          editorRef.current.focus();
        }
      }
    };

    // Add scroll event listener
    useEffect(() => {
      const editorElement =
        editorContainerRef.current?.querySelector(".editor-input");

      const handleScroll = () => {
        userHasScrolled.current = true;
        checkIfNearBottom();
      };

      if (editorElement) {
        editorElement.addEventListener("scroll", handleScroll);
      }

      return () => {
        if (editorElement) {
          editorElement.removeEventListener("scroll", handleScroll);
        }
      };
    }, []);

    // Reset user scroll state when streaming starts
    useEffect(() => {
      if (isStreaming) {
        userHasScrolled.current = false;
        isNearBottom.current = true;
      }
    }, [isStreaming]);

    // Update your streaming effect to use the improved scrolling
    useEffect(() => {
      if (!editorRef.current || !isMarkdown || !content) return;
      const editor = editorRef.current;
      editor.setEditable(!isStreaming); // Enable editing when not streaming

      if (content !== prevContentRef.current && isStreaming) {
        editor.update(() => {
          // Previous implementation for content updates
          const root = $getRoot();
          if (prevContentRef.current === "") {
            root.clear();
            $convertFromMarkdownString(content, MARKDOWN_TRANSFORMERS);
          } else {
            root.clear();
            $convertFromMarkdownString(content, MARKDOWN_TRANSFORMERS);
          }
          root.selectEnd();

          prevContentRef.current = content;
        });

        // Use improved scrolling that respects user interaction
        if (isStreaming) {
          requestAnimationFrame(scrollToBottom);
        }
      } else if (
        !isStreaming &&
        content &&
        prevContentRef.current !== content
      ) {
        // This handles when streaming completes
        const editor = editorRef.current;
        editor.update(() => {
          const root = $getRoot();

          root.clear();
          $convertFromMarkdownString(content, MARKDOWN_TRANSFORMERS);
          root.selectEnd();
          prevContentRef.current = content;
        });
      }
    }, [content, isMarkdown, isStreaming]);

    // Update the JSX to remove the MarkdownPlugin component
    return (
      <div className="rich-text-editor-wrapper">
        <div
          className="editor-container"
          ref={editorContainerRef}
          onClick={handleEditorContainerClick}
        >
          <LexicalComposer initialConfig={editorConfig}>
            <ToolbarPlugin />
            <div className="editor-content-area">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-input"
                    aria-placeholder={placeholder}
                    placeholder={
                      <div className="editor-placeholder">{placeholder}</div>
                    }
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <EditorCapturePlugin editorRef={editorRef} />
            </div>
          </LexicalComposer>
        </div>
      </div>
    );
  },
);

// Add display name for debugging
RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
