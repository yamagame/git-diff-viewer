import React from "react";
import "./App.css";
import parse, { File } from "gitdiff-parser";
import { sampleDiff } from "./sample";
import { DiffFile, fileToDiff } from "components/DiffFile";
import * as CSV from "utils/csv-parser";

function App() {
  const [diff, setDiff] = React.useState(sampleDiff);
  const [diffInfo, setDiffInfo] = React.useState<File[] | null>(null);

  const onUpdateDiff = (value: string) => {
    setDiff(value);
  };

  React.useEffect(() => {
    const info = parse.parse(diff);
    setDiffInfo(info);
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
          if (diffInfo) {
            const now = new Date();
            const diff = diffInfo.map((file) => fileToDiff(file));
            const diffText = diff.reduce(
              (sum, file) => {
                sum.push([
                  { value: "#" },
                  { value: `${file.oldPath}` },
                  { value: `${file.newPath}` },
                ]);
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
            navigator.clipboard.writeText(CSV.stringify(diffText));
          }
        }}
      >
        Copy to Clipboard
      </button>
      {diffInfo && diffInfo.map((file, idx) => <DiffFile key={`${idx}`} file={file} />)}
    </div>
  );
}

export default App;
