import { Change } from "gitdiff-parser";

export type DiffChangeProps = {
  change: Change | null;
  type: "normal" | "delete" | "insert";
};

export function DiffChange(props: DiffChangeProps) {
  const { change, type } = props;
  if (change) {
    return (
      <pre className={`diff-${type} diff-left`}>
        <code>{change.content} </code>
      </pre>
    );
  }
  return <pre className={`diff-normal diff-left`}></pre>;
}
