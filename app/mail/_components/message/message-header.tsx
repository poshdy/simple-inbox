import dayjs from "dayjs";

import React from "react";

type MessageHeaderProps = {
  data: {
    id: string;
    sentAt: Date;
    bodySnippet: string;
    sysLabels: string[];
    subject: string;
    sysClassifications: string[];
    from: {
      name: string | null;
      id: string;
      accountId: string;
      address: string;
      raw: string | null;
    };
    to: {
      name: string | null;
      id: string;
      accountId: string;
      address: string;
      raw: string | null;
    }[];
  };
};
const MessageHeader = ({
  data: { from, subject, sentAt },
}: MessageHeaderProps) => {
  return (
    <div className="flex items-start gap-4 text-sm w-full p-4">
      <span className="size-10 relative rounded-full overflow-hidden shrink-0  flex items-center justify-center bg-muted">
        {from?.name
          ?.split(" ")
          .map((chunk) => chunk[0])
          .join("")}
      </span>

      <div className="grid gap-1 space-y-1">
        <span className="font-semibold">{from.name}</span>
        <span className="text-xs line-clamp-1 ">{subject}</span>
        <span className="text-xs  line-clamp-1">Reply-To: {from.address}</span>
      </div>

      <div className="text-xs shrink-0  ml-auto text-muted-foreground">
        {dayjs(sentAt).format("D MMM YYYY hh:mm A")}
      </div>
    </div>
  );
};

export default MessageHeader;
