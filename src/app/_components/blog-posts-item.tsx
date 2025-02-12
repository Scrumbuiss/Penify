'use client';
 
import { type FC } from "react";
import { Image, Link } from "@nextui-org/react";
import { cn } from "@/utils";
import NextImage from "next/image";

const BlogPostsItem: FC<{
  title: string;
  description: string;
  id: string;
  image: string;
  author?: string;
}> = ({ title, description, id, image, author }) => {
  const headlineStyles = "h2 mb-2 line-clamp-2 break-all text-white";

  return (
    <li key={id}>
      <Link
        href={`/dashboard/${id.toString()}`}
        className="group block hover:opacity-100"
      >
        <div className="relative flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-grey-soft bg-black transition-all duration-250 hover:border-black">
          <Image
            as={NextImage}
            width={300}
            height={300}
            src={image}
            className="h-full w-full object-cover"
            classNames={{
              wrapper:
                "absolute bg-black !max-w-[unset] inset-0 opacity-60 transition-all duration-250 group-hover:opacity-10",
            }}
          />
          <div className="z-10 p-2 text-center opacity-0 transition-all duration-250 group-hover:opacity-100">
            <h3 className={cn(headlineStyles, "mb-3 text-orange")}>{author}</h3>
            <h4 className={headlineStyles}>{title}</h4>
            <p className="line-clamp-3 break-all text-grey-soft">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
};
export default BlogPostsItem;
