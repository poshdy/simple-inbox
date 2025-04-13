import { KBarResults, useMatches } from "kbar";
import React from "react";
import { ResultItem } from "./result-item";

const RenderResults = () => {
  const { results, rootActionId } = useMatches();
  return (
    <KBarResults
      items={results}
      onRender={({ active, item }) =>
        typeof item == "string" ? (
          <div className="px-4 py-2 text-xs uppercase font-semibold text-muted-foreground">
            {item}
          </div>
        ) : (
          <ResultItem
            action={item}
            currentActionId={rootActionId ?? ""}
            active={active}
          />
        )
      }
    />
  );
};

export default RenderResults;
