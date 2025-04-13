import { ActionImpl, ActionId } from "kbar";
import { useMemo } from "react";
import React from "react";
export const ResultItem = ({
  action,
  active,
  currentActionId,
}: {
  action: ActionImpl;
  currentActionId: ActionId;
  active: boolean;
}) => {
  const ancestors = useMemo(() => {
    if (!currentActionId) return action.ancestors;
    const index = action.ancestors.findIndex(
      (ancestor) => ancestor.id === currentActionId
    );
    return action.ancestors.slice(index + 1);
  }, [action.ancestors, currentActionId]);

  return (
    <div
      className={`px-4 py-2  flex items-center justify-between cursor-pointer relative z-10`}
    >
      {active && (
        <div className="bg-gray-200 dark:bg-gray-700 border-l-4 border-black dark:border-white absolute inset-0 !z-[-1]"></div>
      )}
      <div className="flex gap-4 items-center relative z-10">
        {action.icon && action.icon}
        <div className="flex flex-col gap-1">
          <div>
            {ancestors.length > 0 &&
              ancestors.map((ancestor) => (
                <React.Fragment key={ancestor.id}>
                  <span className="opacity-50 mr-2">{ancestor.name}</span>
                  <span className="mr-2">&rsaquo;</span>
                </React.Fragment>
              ))}
            <span>{action.name}</span>
          </div>
          {action.subtitle && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {action.subtitle}
            </span>
          )}
        </div>
      </div>
      {action.shortcut?.length ? (
        <div className="grid grid-flow-col gap-1 relative z-10">
          {action.shortcut.map((sc) => (
            <kbd
              key={sc}
              className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-1 border border-gray-200 dark:border-gray-700 shadow font-medium rounded-md text-xs flex items-center gap-1"
            >
              {sc}
            </kbd>
          ))}
        </div>
      ) : null}
    </div>
  );
};
