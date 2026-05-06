/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $getSelection } from "lexical";
import type { LexicalEditor } from "lexical";
import { $patchStyleText } from "@lexical/selection";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const parseAllowedColor = (color: string): string => {
  // Trims whitespace, and limits string to 100 characters maximum
  const trimmed = color.trim().slice(0, 100);
  return trimmed;
};

export const parseAllowedFontSize = (size: string): string => {
  // Trims whitespace, and limits string to 100 characters maximum
  const trimmed = size.trim().slice(0, 100);
  return trimmed;
};

export const applyStyleTextPatch = (
  editor: LexicalEditor,
  patch: Record<string, string>,
) => {
  editor.update(() => {
    const selection = $getSelection();
    if (selection !== null) {
      $patchStyleText(selection, patch);
    }
  });
};
