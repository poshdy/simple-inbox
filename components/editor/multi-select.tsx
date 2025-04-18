import useThreads from "@/hooks/use-threads";
import { useTRPC } from "@/trpc/root";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Select from "react-select/creatable";
import Avatar from "react-avatar";
export type InputValue = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  onChange: (values: InputValue[]) => void;
  value: InputValue[];
  placeholder: string;
};

const MultiSelect = ({
  placeholder,

  label,
  onChange,
  value,
}: Props) => {
  const { accountId } = useThreads();
  const trpc = useTRPC();
  const { data: suggestions, isPending } = useQuery(
    trpc.mails.getSuggestions.queryOptions({ accountId })
  );

  if (isPending) {
    return "loading";
  }

  const options = suggestions?.map((address) => ({
    label: (
      <span className="flex items-center gap-1">
        <Avatar round name={address.address} size="25" textSizeRatio={2} />
        {address.address}
      </span>
    ),
    value: address.address,
  }));
  // const [input, setInput] = useState();
  // const options = suggestions.m;

  return (
    <div className="flex gap-1 items-center border rounded-md px-1">
      <span className="text-xs font-medium ml-2 text-gray-500">{label}</span>
      <Select
        isMulti
        value={value}
        className="w-full flex-1 !placeholder:text-xs"
        classNames={{
          placeholder: () => {
            return "!placeholder:text-sm";
          },
          control: () => {
            return "!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent";
          },
          multiValue: () => {
            return "dark:!bg-gray-700";
          },
          multiValueLabel: () => {
            return "dark:text-white dark:bg-gray-700 rounded-md";
          },
        }}
        // onInputChange={setInput}
        placeholder={placeholder}
        classNamePrefix="select"
        // value={value}
        // @ts-ignore
        options={options}
        // @ts-ignore
        onChange={onChange}
      />
    </div>
  );
};

export default MultiSelect;
