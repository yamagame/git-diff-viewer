import React from "react";
import "./App.css";
import parse, { File } from "gitdiff-parser";
import { sampleDiff } from "./sample";
import { DiffFile } from "components/DiffFile";
import { downloadText, copyToClipboard, diffFilesToHTML } from "utils/diff-utils";

function App() {
  const [diff, setDiff] = React.useState(sampleDiff);
  const [diffFiles, setDiffFiles] = React.useState<File[] | null>(null);

  const onUpdateDiff = (value: string) => {
    setDiff(value);
  };

  React.useEffect(() => {
    const info = parse.parse(diff);
    setDiffFiles(info);
  }, [diff]);

  return (
    <div className="diff-container">
      <textarea
        className="diff-textarea"
        value={diff}
        onChange={(e) => onUpdateDiff(e.target.value)}
      />
      <button
        className="diff-button"
        onClick={() => {
          if (diffFiles) copyToClipboard(diffFiles);
        }}
      >
        Copy to Clipboard
      </button>
      <button
        className="diff-button"
        onClick={() => {
          if (diffFiles) downloadText("git-diff.html", diffFilesToHTML(diffFiles));
        }}
      >
        Download HTML
      </button>
      {diffFiles && diffFiles.map((file, idx) => <DiffFile key={`${idx}`} file={file} />)}
    </div>
  );
}

export default App;
