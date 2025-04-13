import React from "react";
import {
  Archive,
  ArchiveX,
  Clock,
  EllipsisVertical,
  Forward,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MessageActions = () => {
  return (
    <div className="border-b p-2 flex items-center justify-between w-full ">
      <div className="flex items-center gap-2">
        <Button variant={"ghost"} size={"icon"}>
          <Archive className="size-4" />
        </Button>

        <Button variant={"ghost"} size={"icon"}>
          <ArchiveX className="size-4" />
        </Button>

        <Button variant={"ghost"} size={"icon"}>
          <Trash2 className="size-4" />
        </Button>

        <span className="w-[0.5px] h-3 bg-zinc-500" />

        <Button variant={"ghost"} size={"icon"}>
          <Clock className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={"ghost"} size={"icon"}>
          <Reply className="size-4" />
        </Button>

        <Button variant={"ghost"} size={"icon"}>
          <ReplyAll className="size-4" />
        </Button>

        <Button variant={"ghost"} size={"icon"}>
          <Forward className="size-4" />
        </Button>

        <span className="w-[0.5px] h-3 bg-zinc-500" />

        <Button variant={"ghost"} size={"icon"}>
          <EllipsisVertical className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageActions;
