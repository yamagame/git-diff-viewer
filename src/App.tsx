import React from "react";
import "./App.css";
import parse, { File } from "gitdiff-parser";
import { sampleDiff } from "./sample";
import { DiffFile } from "./components/DiffFile";

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
      {diffInfo && diffInfo.map((file, idx) => <DiffFile key={`${idx}`} file={file} />)}
    </div>
  );
}

export default App;
