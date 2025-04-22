"use client";
import React, { useState } from "react";

import EmailEditor from "@/components/editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PenBox } from "lucide-react";
import useThreads from "@/hooks/use-threads";
import { useTRPC } from "@/trpc/root";
import { useMutation } from "@tanstack/react-query";

const ComposeDrawer = () => {
  const trpc = useTRPC();
  const { account } = useThreads();
  const { mutateAsync } = useMutation(trpc.mails.sendEmail.mutationOptions());
  const [value, setValue] = useState<string>("");
  const [toValues, setToValues] = useState<{ label: string; value: string }[]>(
    []
  );
  const [ccValues, setCcValues] = useState<{ label: string; value: string }[]>(
    []
  );
  const [subject, setSubject] = useState<string>("");

  const handleSend = async () => {
    const to = toValues.map((item) => item.value);

    await mutateAsync({
      accountId: account?.id as string,
      to,
      subject,
      body: value,
    });
  };
  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-xs  text-secondary hover:bg-primary/90 transition-colors duration-200 ease-in-out">
        Compose <PenBox className="size-4" />
      </DialogTrigger>
      <DialogContent className="w-[2000px] md:min-w-[800px] sm:min-w-[400px]">
        <DialogHeader>
          <DialogTitle>Send an email</DialogTitle>
        </DialogHeader>

        <div>
          <EmailEditor
            value={value}
            setValue={setValue}
            ccValues={ccValues}
            handleSend={handleSend}
            defaultToolbarExpanded={true}
            setCcValues={setCcValues}
            setSubject={setSubject}
            setToValues={setToValues}
            subject={subject}
            to={[]}
            toValues={toValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeDrawer;
