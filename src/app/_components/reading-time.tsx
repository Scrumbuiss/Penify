import { Book } from "./svg";

const ReadingTime = ({ readingTime }: { readingTime: string }) => {
  return (
    <div className="flex items-center gap-2">
      <Book />
      <div className="text-[14px] text-white">{readingTime}</div>
    </div>
  );
};

export default ReadingTime;
