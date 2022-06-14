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
    <>
      <div className="diff-top-header">
        <textarea
          placeholder="Paste the git diff here."
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
        <button
          className="diff-margin-button"
          onClick={() => {
            setDiff("");
          }}
        >
          Clear
        </button>
      </div>
      <div className="diff-container">
        {diffFiles && diffFiles.map((file, idx) => <DiffFile key={`${idx}`} file={file} />)}
      </div>
    </>
  );
}

export default App;
