import { Change } from "gitdiff-parser";

export type DiffChangeProps = {
  change: Change | null;
};

export function DiffChange(props: DiffChangeProps) {
  const { change } = props;
  if (change) {
    return (
      <pre className={`diff-${change.type} diff-left`}>
        <code>{change.content} </code>
      </pre>
    );
  }
  return <pre className={`diff-normal diff-left`}></pre>;
}
