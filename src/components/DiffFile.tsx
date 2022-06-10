import { File } from "gitdiff-parser";
import { DiffHunk, hunkToDiff } from "./DiffHunk";

export type DiffFileProps = {
  file: File;
};

export const fileToDiff = (file: File) => {
  return {
    ...file,
    hunks: file.hunks.map((hunk) => {
      return hunkToDiff(hunk);
    }),
  };
};

export function DiffFile(props: DiffFileProps) {
  const { file } = props;
  const key = `${file.newPath}-${file.oldPath}`;
  return (
    <div className="diff-file">
      <div className="diff-header">
        <div className="diff-state"></div>
        <div className="diff-column">
          <span>{file.oldPath}</span>
        </div>
        <div className="diff-column">
          <span>{file.newPath}</span>
        </div>
      </div>
      <div>
        {file.hunks.map((hunk, idx) => {
          return <DiffHunk key={`${key}-${idx}`} hunk={hunk} />;
        })}
      </div>
    </div>
  );
}
