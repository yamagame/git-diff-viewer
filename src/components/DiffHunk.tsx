import React from "react";
import { Hunk, Change } from "gitdiff-parser";
import { DiffChange } from "./DiffChange";

type ZipChange = [Change[], Change | null, number];
type ZipSplitChange = [Change | null, Change | null];

const zipChanges = (changes: Change[]) => {
  const [result] = changes.reduce(
    ([result, last, lastDeletionIndex], current, i) => {
      if (!last) {
        result.push(current);
        return [result, current, current.isDelete ? i : -1];
      }
      if (current.isInsert && lastDeletionIndex >= 0) {
        result.splice(lastDeletionIndex + 1, 0, current);
        return [result, current, lastDeletionIndex + 2];
      }
      result.push(current);
      const newLastDeletionIndex = current.isDelete ? (last.isDelete ? lastDeletionIndex : i) : i;
      return [result, current, newLastDeletionIndex];
    },
    [[], null, -1] as ZipChange
  );
  return result;
};

const splitChanges = (changes: Change[]) => {
  const result: ZipSplitChange[] = [];
  changes.forEach((change, idx) => {
    if (change.isNormal) {
      result.push([change, change]);
    } else if (change.isDelete) {
      result.push([change, null]);
    } else if (change.isInsert) {
      if (idx > 0 && changes[idx - 1].isDelete) {
        result[result.length - 1][1] = change;
      } else {
        result.push([null, change]);
      }
    }
  });
  return result;
};

export type DiffHunkProps = {
  hunk: Hunk;
};

export function DiffHunk(props: DiffHunkProps) {
  const { hunk } = props;
  const [changes, setChanges] = React.useState<ZipSplitChange[]>([]);

  React.useEffect(() => {
    setChanges(splitChanges(zipChanges(hunk.changes)));
  }, [hunk.changes]);

  return (
    <>
      {changes.map((change, idx) => {
        return (
          <div key={`${idx}`} className="diff-hunk">
            <DiffChange key={`old-${idx}`} change={change[0]} />
            <DiffChange key={`new-${idx}`} change={change[1]} />
          </div>
        );
      })}
    </>
  );
}
