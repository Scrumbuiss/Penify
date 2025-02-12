import { cn } from "@/utils";
import { Chip } from "@nextui-org/react";

const TagWithDate = ({
  date,
  topic,
  className,
}: {
  date: string;
  topic: string;
  className?: string;
}) => {
  return (
    <div className="flex flex-nowrap">
      <Chip radius="sm" className="z-10 bg-grey-dark text-white">
        {topic}
      </Chip>
      <Chip
        radius="sm"
        className={cn(
          "-ml-4 border-[2px] border-grey-dark bg-transparent pl-4 text-white",
          className,
        )}
      >
        {date}
      </Chip>
    </div>
  );
};

export default TagWithDate;
