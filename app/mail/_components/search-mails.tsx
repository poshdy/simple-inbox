import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

type Props = {};

const SearchMails = (props: Props) => {
  return (
    <div className="w-[90%] mx-auto flex gap-1  border border-zinc-300 rounded-lg items-center px-2 py-1 ">
      <Search className="text-zinc-400" size={20} />
      <Input
        className="border-none focus-visible:ring-0 placeholder:text-sm outline-none shadow-none "
        placeholder="Search.."
      />
    </div>
  );
};
export default SearchMails;
