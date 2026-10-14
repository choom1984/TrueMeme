const vscode = require('vscode');
const path = require('path');

/*
 * Matches a line that *defines* a variable with a literal boolean, e.g.
 *   flag = True
 *   self.done = False
 *   is_ready: bool = True
 *   a = b = False
 *   x = True   # trailing comment
 * It does NOT match comparisons (x == True), function calls, or booleans
 * buried inside larger expressions.
 */
const BOOL_ASSIGNMENT = new RegExp(
  '^\\s*' +
  '[A-Za-z_][\\w.]*' +                       // target name (allows self.x)
  '(?:\\s*:\\s*[^=#]+?)?' +                  // optional type annotation
  '\\s*=(?!=)\\s*' +                         // "=" but not "=="
  '(?:[A-Za-z_][\\w.]*\\s*=(?!=)\\s*)*' +    // chained targets: a = b = ...
  '(True|False)\\b' +                        // the boolean literal (group 1)
  '\\s*;?\\s*(?:#.*)?$'                      // optional ; and/or comment
);

let trueDecoration, falseDecoration;
let timeout;

function makeDecoration(iconPath, size) {
  return vscode.window.createTextEditorDecorationType({
    after: {
      contentIconPath: vscode.Uri.file(iconPath),
      width: size,
      height: size,
      margin: '0 0 0 4px'
    }
  });
}

function createDecorations(context) {
  if (trueDecoration) trueDecoration.dispose();
  if (falseDecoration) falseDecoration.dispose();

  const cfg = vscode.workspace.getConfiguration('pythonBoolIcons');
  const size = cfg.get('iconSize') || '1em';
  const trueIcon = cfg.get('trueIcon') || path.join(context.extensionPath, 'images', 'true.png');
  const falseIcon = cfg.get('falseIcon') || path.join(context.extensionPath, 'images', 'false.png');

  trueDecoration = makeDecoration(trueIcon, size);
  falseDecoration = makeDecoration(falseIcon, size);
}

function updateDecorations(editor) {
  if (!editor || editor.document.languageId !== 'python') return;

  const trueRanges = [];
  const falseRanges = [];
  const doc = editor.document;
  let inTripleString = false;

  for (let i = 0; i < doc.lineCount; i++) {
    const text = doc.lineAt(i).text;

    // Skip lines inside triple-quoted strings / docstrings (simple heuristic)
    const tripleCount = (text.match(/"""|'''/g) || []).length;
    if (inTripleString || tripleCount > 0) {
      if (tripleCount % 2 === 1) inTripleString = !inTripleString;
      continue;
    }

    const match = BOOL_ASSIGNMENT.exec(text);
    if (!match) continue;

    const value = match[1];
    // Locate the literal: the last occurrence before any trailing comment
    const codePart = text.split('#')[0];
    const col = codePart.lastIndexOf(value);
    const range = new vscode.Range(i, col, i, col + value.length);

    (value === 'True' ? trueRanges : falseRanges).push(range);
  }

  editor.setDecorations(trueDecoration, trueRanges);
  editor.setDecorations(falseDecoration, falseRanges);
}

function scheduleUpdate(editor) {
  clearTimeout(timeout);
  timeout = setTimeout(() => updateDecorations(editor), 150);
}

function activate(context) {
  createDecorations(context);
  vscode.window.visibleTextEditors.forEach(updateDecorations);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => updateDecorations(editor)),

    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) scheduleUpdate(editor);
    }),

    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('pythonBoolIcons')) {
        createDecorations(context);
        vscode.window.visibleTextEditors.forEach(updateDecorations);
      }
    }),

    { dispose: () => { trueDecoration?.dispose(); falseDecoration?.dispose(); } }
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
