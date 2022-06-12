import * as Diff from "diff";

export type DiffChangeProps = {
  content: string | Diff.Change[];
  type: "normal" | "delete" | "insert";
};

export function DiffChange(props: DiffChangeProps) {
  const { content, type } = props;
  if (typeof content === "string") {
    return (
      <pre className={`diff-${type} diff-left`}>
        <code>{content} </code>
      </pre>
    );
  } else if (content) {
    return (
      <pre className={`diff-code-normal diff-left`}>
        <code className="diff-code">
          {content.map((v, i) => {
            if (v.added) {
              return (
                <span key={i} className="diff-code-added">
                  {v.value}
                </span>
              );
            }
            if (v.removed) {
              return (
                <span key={i} className="diff-code-removed">
                  {v.value}
                </span>
              );
            }
            return <span key={i}>{v.value}</span>;
          })}
        </code>
      </pre>
    );
  }
  return <pre className={`diff-normal diff-left`}></pre>;
}
