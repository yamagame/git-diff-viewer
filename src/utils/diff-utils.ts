import { File } from "gitdiff-parser";
import { fileToDiff, DiffType } from "components/DiffFile";
import * as CSV from "utils/csv-parser";

export function downloadText(fileName: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const aTag = document.createElement("a");
  aTag.href = URL.createObjectURL(blob);
  aTag.target = "_blank";
  aTag.download = fileName;
  aTag.click();
  URL.revokeObjectURL(aTag.href);
}

export function diffFilesToArray(diffFiles: File[], diffType: DiffType) {
  // const now = new Date();
  const files = diffFiles.map((file) => fileToDiff(file, diffType));
  return files.reduce(
    (sum, file) => {
      sum.push([
        { value: "#" },
        { value: `${file.oldPath}` },
        { value: "" },
        { value: `${file.newPath}` },
      ]);
      file.hunks.forEach((hunk) => {
        hunk.forEach((change) => {
          const type = change.type !== "normal" ? "NG" : "";
          const r = [];
          r.push({ value: type });
          r.push({ value: change.old?.content || "" });
          r.push({ value: "" });
          r.push({ value: change.new?.content || "" });
          sum.push(r);
        });
      });
      sum.push([{ value: "" }]);
      return sum;
    },
    [
      // [{ value: "" }, { value: `${now.toLocaleDateString()} ${now.toTimeString()}` }],
    ] as CSV.Item[][]
  );
}

export function copyToClipboard(diffFiles: File[], diffType: DiffType) {
  navigator.clipboard.writeText(CSV.stringify(diffFilesToArray(diffFiles, diffType)));
}

const htmlHeader = `<!DOCTYPE html><html lang="en">
<head>
<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

:root {
  --diff-line-padding: 2px;
  --diff-delete-color: white;
  --diff-delete-bg-color: #F66;
  --diff-insert-color: white;
  --diff-insert-bg-color: #66F;
}

pre {
  margin: 0;
  padding: 0;
}

.diff-textarea {
  width: 50%;
  height: 20px;
}

.diff-container {
  margin: 10px;
  font-size: 0.7em;
}

.diff-file {
  margin-bottom: 10px;
  border: solid 1px lightgray;
}

.diff-header {
  display: flex;
  color: white;
  background-color: #00a1ffff;
  padding: var(--diff-line-padding);
}

.diff-column {
  display: inline-block;
  flex: 1;
}

.diff-hunk {
  display: flex;
  border-bottom: solid 1px lightgray;
}

.diff-normal {
  flex: 1;
  display: inline-block;
  line-height: 1;
  padding: var(--diff-line-padding);
  overflow: clip;
}

.diff-insert {
  flex: 1;
  display: inline-block;
  color: var(--diff-insert-color);
  background-color: var(--diff-insert-bg-color);
  line-height: 1;
  padding: var(--diff-line-padding);
  overflow: clip;
}

.diff-delete {
  flex: 1;
  display: inline-block;
  color: var(--diff-delete-color);
  background-color: var(--diff-delete-bg-color);
  line-height: 1;
  padding: var(--diff-line-padding);
  overflow: clip;
}

.diff-state {
  width: 17px;
  display: inline-block;
  color: #F88;
  line-height: 1;
  padding: var(--diff-line-padding);
  overflow: clip;
}

.diff-left {
  border-right: solid 1px lightgray;
}

.diff-button {
  outline: none; 
  float: right;
}

.diff-code-normal {
  flex: 1;
  display: inline-block;
  line-height: 1;
  padding: var(--diff-line-padding);
  overflow: clip;
}

.diff-code {
  display: inline;
  padding: 0;
  margin: 0;
}

.diff-code-added {
  color: var(--diff-insert-color);
  background-color: var(--diff-insert-bg-color);
  padding: 0;
  margin: 0;
}

.diff-code-removed {
  color: var(--diff-delete-color);
  background-color: var(--diff-delete-bg-color);
  padding: 0;
  margin: 0;
}
</style>
</head>
<body>
`;

const htmlFooter = `
</body>
</html>
`;

function escapeHTML(html: string) {
  var elem = document.createElement("div");
  elem.appendChild(document.createTextNode(html));
  return elem.innerHTML;
}

const diffToHtml = (content: Diff.Change[]) => {
  let r = [];
  r.push(`<pre class="diff-code-normal diff-left">`);
  let t = "";
  content.forEach((v) => {
    if (v.added) {
      t += `<span class="diff-code-added">${escapeHTML(v.value)}</span>`;
      return;
    }
    if (v.removed) {
      t += `<span class="diff-code-removed">${escapeHTML(v.value)}</span>`;
      return;
    }
    t += `<span>${escapeHTML(v.value)}</span>`;
  });
  r.push(`<code class="diff-code">${t}</code>`);
  r.push(`</pre>`);
  return r.join("\n");
};

export function diffFilesToHTML(diffFiles: File[], diffType: DiffType) {
  const files = diffFiles.map((file) => fileToDiff(file, diffType));
  const bodyHtml = files.reduce((sum, file) => {
    const r = [];
    r.push(`<div class="diff-file">`);
    r.push(`<div class="diff-header">`);
    r.push(`<div class="diff-state"></div>`);
    r.push(`<div class="diff-column">${escapeHTML(file.oldPath)}</div>`);
    r.push(`<div class="diff-column">${escapeHTML(file.newPath)}</div>`);
    r.push(`</div>`);
    r.push(`<div>`);
    file.hunks.forEach((hunk) => {
      hunk.forEach((change) => {
        r.push(`<div class="diff-hunk">`);
        const type = change.type !== "normal" ? "NG" : "";
        r.push(`<div class="diff-state diff-left">${escapeHTML(type)}</div>`);
        if (type === "NG") {
          const oldContent = change.diff
            ? change.diff.filter((v) => !v.added)
            : change.old?.content || "";
          const newContent = change.diff
            ? change.diff.filter((v) => !v.removed)
            : change.new?.content || "";
          if (typeof oldContent === "string") {
            if (oldContent === "") {
              r.push(
                `<pre class="diff-normal diff-left"><code>${escapeHTML(oldContent)}</code></pre>`
              );
            } else {
              r.push(
                `<pre class="diff-delete diff-left"><code>${escapeHTML(oldContent)}</code></pre>`
              );
            }
          } else {
            r.push(diffToHtml(oldContent));
          }
          if (typeof newContent === "string") {
            if (newContent === "") {
              r.push(
                `<pre class="diff-normal diff-left"><code>${escapeHTML(newContent)}</code></pre>`
              );
            } else {
              r.push(
                `<pre class="diff-insert diff-left"><code>${escapeHTML(newContent)}</code></pre>`
              );
            }
          } else {
            r.push(diffToHtml(newContent));
          }
        } else {
          const oldContent = change.old?.content || " ";
          const newContent = change.new?.content || " ";
          r.push(`<pre class="diff-normal diff-left"><code>${escapeHTML(oldContent)}</code></pre>`);
          r.push(`<pre class="diff-normal diff-left"><code>${escapeHTML(newContent)}</code></pre>`);
        }
        r.push(`</div>`);
      });
    });
    r.push(`</div>`);
    r.push(`</div>`);
    return sum + r.join("\n");
  }, "");
  const result = `${htmlHeader}<div class="diff-container">\n${bodyHtml}\n</div>${htmlFooter}`;
  return result;
}
