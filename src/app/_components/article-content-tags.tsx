"use client";

import { type articlesTagsType } from "@/server/db/schema";
import { Chip } from "@nextui-org/react";

const ArticleContentTags = ({
  articleTags,
}: {
  articleTags: articlesTagsType[] | undefined;
}) => {
  if (!articleTags) return null;

  return (
    <>
      {!!articleTags.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {articleTags.map(({ tag }, index) => (
            <Chip
              key={index}
              radius="sm"
              className="z-10 bg-grey-dark text-white"
            >
              {tag}
            </Chip>
          ))}
        </div>
      )}
    </>
  );
};

export default ArticleContentTags;
