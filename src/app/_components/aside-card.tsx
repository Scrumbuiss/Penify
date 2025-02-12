"use client";

import { type FC } from "react";
import { Image, Link } from "@nextui-org/react";
import NextImage from "next/image";
import { FollowerPointerCard } from "./ui/following-pointer-card";

const AsideCard: FC<{
  headline: string;
  image: string;
  link: string;
  category: string;
  name: string;
  userImage: string;
}> = ({ headline, image, link, category, name, userImage }) => {
  return (
    <FollowerPointerCard
      name={name}
      image={userImage}
      className="h-full w-full"
    >
      <Link
        href={`/${link}?category=${category}`}
        className="group flex rounded-2xl p-2 transition-all duration-250 hover:bg-grey-dark"
      >
        <Image
          as={NextImage}
          alt={headline}
          fill
          src={image}
          quality={80}
          sizes="100vw"
          className="object-cover"
          classNames={{
            wrapper:
              "relative max-h-[80px] bg-[#27272a] min-h-[80px] max-w-[80px] min-w-[80px]",
          }}
        />
        <p className="ml-2 line-clamp-2 text-sm text-grey-soft transition-colors duration-250 group-hover:text-orange">
          {headline}
        </p>
      </Link>
    </FollowerPointerCard>
  );
};

export default AsideCard;
