"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isRootOrShadowRoot,
  LexicalEditor,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Pilcrow,
} from "lucide-react";

function getSelectedBlockType(editor: LexicalEditor): string {
  let blockType = "paragraph";
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      const node = element;
      if ($isHeadingNode(node)) {
        const tag = node.getTag();
        blockType = tag;
      } else if ($isListNode(node)) {
        const listType = (node as ListNode).getListType();
        blockType = listType === "bullet" ? "bullet" : "number";
      }
    }
  });
  return blockType;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const updateToolbar = useCallback(() => {
    const type = getSelectedBlockType(editor);
    setBlockType(type);

    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingTag: HeadingTagType) => {
    if (blockType === headingTag) {
      // If already this heading, toggle back to paragraph
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createParagraphNode());
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingTag));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType === "bullet") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType === "number") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const toggleBold = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText("bold");
      }
    });
  };

  const toggleItalic = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText("italic");
      }
    });
  };

  const buttonBase =
    "p-2 rounded-lg transition-all duration-150 flex items-center justify-center";
  const activeButton = `${buttonBase} bg-[#4161df] text-white shadow-md`;
  const inactiveButton = `${buttonBase} text-slate-600 hover:bg-slate-100 hover:text-[#4161df]`;

  return (
    <div className="toolbar flex flex-wrap items-center gap-1 px-3 py-2 bg-white border-b border-slate-200 rounded-t-xl sticky top-0 z-10">
      {/* History */}
      <button
        onClick={() => editor.dispatchCommand("undo" as any, undefined)}
        className={inactiveButton}
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.dispatchCommand("redo" as any, undefined)}
        className={inactiveButton}
        title="Redo"
      >
        <Redo size={16} />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Block Format */}
      <button
        onClick={() => formatHeading("h1")}
        className={blockType === "h1" ? activeButton : inactiveButton}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => formatHeading("h2")}
        className={blockType === "h2" ? activeButton : inactiveButton}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        onClick={() => formatHeading("h3")}
        className={blockType === "h3" ? activeButton : inactiveButton}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>
      <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            $setBlocksType(selection, () => $createParagraphNode());
          });
        }}
        className={blockType === "paragraph" ? activeButton : inactiveButton}
        title="Paragraph"
      >
        <Pilcrow size={18} />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Lists */}
      <button
        onClick={formatBulletList}
        className={blockType === "bullet" ? activeButton : inactiveButton}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={formatNumberedList}
        className={blockType === "number" ? activeButton : inactiveButton}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Text Format */}
      <button
        onClick={toggleBold}
        className={isBold ? activeButton : inactiveButton}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={toggleItalic}
        className={isItalic ? activeButton : inactiveButton}
        title="Italic"
      >
        <Italic size={16} />
      </button>
    </div>
  );
}
