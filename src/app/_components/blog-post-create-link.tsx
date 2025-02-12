"use client";

import { Link } from "@nextui-org/react";
import { AddIcon } from "./svg";

const BlogPostCreateLink = ({ headline }: { headline: string }) => {
  return (
    <Link href="/dashboard/create-blog-post" className="block">
      <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-grey-soft transition-all duration-250 hover:border-black">
        <h3 className="h4 mb-2 text-black">{headline}</h3>
        <AddIcon />
      </div>
    </Link>
  );
};

export default BlogPostCreateLink;
