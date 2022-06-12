import React from "react";
import { Hunk, Change } from "gitdiff-parser";
import { DiffChange } from "./DiffChange";
import * as Diff from "diff";

type ZipChange = [Change[], Change | null, number];
type ZipSplitChange = {
  type: "normal" | "delete" | "insert";
  old: Change | null;
  new: Change | null;
  diff?: Diff.Change[];
};

export const zipChanges = (changes: Change[]) => {
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

export const splitChanges = (changes: Change[]) => {
  const result: ZipSplitChange[] = [];
  changes.forEach((change, idx) => {
    if (change.isNormal) {
      result.push({ type: "normal", old: change, new: change });
    } else if (change.isDelete) {
      result.push({ type: "delete", old: change, new: null });
    } else if (change.isInsert) {
      if (idx > 0 && changes[idx - 1].isDelete) {
        const changes = result[result.length - 1];
        changes.new = change;
        changes.diff = Diff.diffChars(changes.old?.content || "", changes.new?.content || "");
      } else {
        result.push({ type: "insert", old: null, new: change });
      }
    }
  });
  return result.map((v) => {
    if (v.old?.content.trim() === v.new?.content.trim()) {
      v.type = "normal";
    }
    return v;
  });
};

export const hunkToDiff = (hunk: Hunk) => {
  return splitChanges(zipChanges(hunk.changes));
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
        const oldType = change.type === "normal" ? "normal" : change.old?.type || "normal";
        const newType = change.type === "normal" ? "normal" : change.new?.type || "normal";
        const oldContent = change.diff
          ? change.diff.filter((v) => !v.added)
          : change.old?.content || "";
        const newContent = change.diff
          ? change.diff.filter((v) => !v.removed)
          : change.new?.content || "";
        return (
          <div key={`${idx}`} className="diff-hunk">
            <div className="diff-state diff-left">{change.type !== "normal" ? "NG" : ""}</div>
            <DiffChange key={`old-${idx}`} content={oldContent} type={oldType} />
            <DiffChange key={`new-${idx}`} content={newContent} type={newType} />
          </div>
        );
      })}
    </>
  );
}
