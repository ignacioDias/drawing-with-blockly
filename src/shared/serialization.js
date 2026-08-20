/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const DEFAULT_STORAGE_KEY = 'blockyAndP5';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 * @param {string} [storageKey=DEFAULT_STORAGE_KEY] Local storage key.
 */
export const save = function (workspace, storageKey = DEFAULT_STORAGE_KEY) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 * @param {string} [storageKey=DEFAULT_STORAGE_KEY] Local storage key.
 */
export const load = function (workspace, storageKey = DEFAULT_STORAGE_KEY) {
  const data = window.localStorage?.getItem(storageKey);
  if (!data) return;

  // Don't emit events during loading.
  Blockly.Events.disable();
  try {
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
  } catch (error) {
    console.warn('Discarding unreadable saved workspace', error);
    window.localStorage?.removeItem(storageKey);
  } finally {
    Blockly.Events.enable();
  }
};
