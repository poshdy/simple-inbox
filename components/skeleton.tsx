import React from "react";

type SkeletonProps = {
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean;
  count: number;
  body?: boolean;
};

const Skeleton = ({
  count,
  avatar = false,
  paragraph = true,
  title = true,
  body = false,
}: SkeletonProps) => {
  return (
    <div className="w-[95%] mx-auto max-w-full p-2 pt-2 flex flex-col gap-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-start mb-4 animate-pulse">
          {avatar && (
            <div className="w-10 h-10 bg-zinc-300 rounded-full mr-4"></div>
          )}
          <div className="flex-1">
            
            {title && (
              <div className="h-4 bg-zinc-300 rounded mb-2 w-3/4"></div>
            )}
            {paragraph && <div className="h-4 bg-zinc-300 mb-2 w-full"></div>}
            {paragraph && (
              <div className="h-4 bg-zinc-300 rounded mb-2 w-full"></div>
            )}
            {body && (
              <div className="h-96 bg-zinc-300 rounded mb-2 w-full"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
