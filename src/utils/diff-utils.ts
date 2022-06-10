import { File } from "gitdiff-parser";
import { fileToDiff } from "components/DiffFile";
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

export function diffFilesToArray(diffFiles: File[]) {
  const now = new Date();
  const files = diffFiles.map((file) => fileToDiff(file));
  return files.reduce(
    (sum, file) => {
      sum.push([{ value: "#" }, { value: `${file.oldPath}` }, { value: `${file.newPath}` }]);
      file.hunks.forEach((hunk) => {
        hunk.forEach((change) => {
          const type = change.type !== "normal" ? "NG" : "";
          const r = [];
          r.push({ value: type });
          r.push({ value: change.old?.content || "" });
          r.push({ value: change.new?.content || "" });
          sum.push(r);
        });
      });
      sum.push([{ value: "" }]);
      return sum;
    },
    [
      [{ value: "" }, { value: `${now.toLocaleDateString()} ${now.toTimeString()}` }],
    ] as CSV.Item[][]
  );
}

export function copyToClipboard(diffFiles: File[]) {
  navigator.clipboard.writeText(CSV.stringify(diffFilesToArray(diffFiles)));
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
  color: blue;
  line-height: 1;
  padding: var(--diff-line-padding);
  overflow: clip;
}

.diff-delete {
  flex: 1;
  display: inline-block;
  color: red;
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
</style>
</head>
<body>
`;

const htmlFooter = `
</body>
</html>
`;

export function diffFilesToHTML(diffFiles: File[]) {
  function escapeHTML(html: string) {
    var elem = document.createElement("div");
    elem.appendChild(document.createTextNode(html));
    return elem.innerHTML;
  }
  const files = diffFiles.map((file) => fileToDiff(file));
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
        const type = change.type !== "normal" ? "NG" : "";
        r.push(`<div class="diff-hunk">`);
        r.push(`<div class="diff-state diff-left">${escapeHTML(type)}</div>`);
        r.push(
          `<pre class="diff-delete diff-left"><code>${escapeHTML(
            change.old?.content || " "
          )}</code></pre>`
        );
        r.push(
          `<pre class="diff-insert diff-left"><code>${escapeHTML(
            change.new?.content || " "
          )}</code></pre>`
        );
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
