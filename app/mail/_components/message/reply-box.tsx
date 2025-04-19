import EmailEditor from "@/components/editor";
import { useTRPC } from "@/trpc/root";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

interface ReplyProps {
  threadId: string;
  accountId: string;
}
const ReplyBox = ({ accountId, threadId }: ReplyProps) => {
  const trpc = useTRPC();
  
  const [value, setValue] = useState<string>("");
  const [toValues, setToValues] =
    useState<{ label: string; value: string }[]>();
  const [ccValues, setCcValues] =
    useState<{ label: string; value: string }[]>();

  const [subject, setSubject] = useState<string>();
  const { data: replyMessage, isPending } = useQuery(
    trpc.mails.getReplyDetails.queryOptions({ accountId, threadId })
  );

  useEffect(() => {
    setSubject(
      replyMessage?.subject.startsWith("Re:")
        ? replyMessage.subject
        : `Re: ${replyMessage?.subject}`
    );

    setToValues(
      replyMessage?.to.map((address) => ({ label: address, value: address }))
    );
    
    if (replyMessage?.cc) {
      setCcValues(
        replyMessage.cc.map((to) => ({ label: to.address, value: to.address }))
      );
    }
  }, [replyMessage]);

  if (isPending) {
    return <div>loadinf</div>;
  }

  return (
    <section className="w-[95%] mx-auto my-2  space-y-2 flex flex-col">
      <EmailEditor
        setSubject={setSubject}
        ccValues={ccValues || []}
        toValues={toValues || []}
        setToValues={setToValues}
        setCcValues={setCcValues}
        handleSend={() => console.log()}
        to={replyMessage?.to.map((to) => to) || []}
        subject={subject ?? ""}
        value={value}
        setValue={setValue}
      />
    </section>
  );
};

export default ReplyBox;
