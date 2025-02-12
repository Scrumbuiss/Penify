"use client";

import { Card as CardNextUI, CardBody, Image, Link } from "@nextui-org/react";
import { type FC } from "react";
import { cn } from "@/utils";
import TagWithDate from "./tag-with-date";
import ReadingTime from "./reading-time";
import { useTranslations } from "next-intl";
import NextImage from "next/image";
import { FollowerPointerCard } from "./ui/following-pointer-card";

type Option = {
  option?: string;
} & (DefaultCard | FeaturedCard);

type DefaultCard = {
  option?: "default";
};

type FeaturedCard = {
  option?: "featured";
};

const Card: FC<
  {
    link: string;
    topic: string;
    date: string;
    readingTime: string;
    headline?: string;
    description?: string;
    image: string;
    name: string;
    userImage: string;
  } & Option
> = ({
  link,
  topic,
  date,
  headline,
  description,
  image,
  readingTime,
  name,
  userImage,
  option = "default",
}) => {
  const t = useTranslations("Common");

  return (
    <FollowerPointerCard
      name={name}
      image={userImage}
      className="h-full w-full"
    >
      <CardNextUI
        isPressable
        className="group flex h-full w-full flex-row bg-black-dark p-4"
      >
        <Link href={`/${link}?category=${topic}`} className="w-full">
          <CardBody
            className={cn("flex w-full gap-10 overflow-visible p-0", {
              "flex-row lg:flex-col": option === "featured",
              "flex-col gap-2": option === "default",
            })}
          >
            <div className="flex w-full flex-col">
              <CardHeading
                topic={t(topic)}
                date={date}
                readingTime={readingTime}
              />
              {option === "featured" && (
                <h1 className="h1 mb-1 mt-2 transition-colors duration-250 group-hover:text-orange">
                  {headline}
                </h1>
              )}
              {option === "default" && (
                <h2 className="h2 mb-1 mt-2 transition-colors duration-250 group-hover:text-orange">
                  {headline}
                </h2>
              )}
              <p className="font-Segoe_UI">{description}</p>
            </div>
            <Image
              as={NextImage}
              fill
              sizes="100vw"
              alt="article image"
              className={cn(" w-full rounded-xl object-cover", {
                "max-h-[142px]": option === "default",
              })}
              priority
              src={image}
              quality={80}
              classNames={{
                wrapper: cn("bg-[#27272a] h-[142px]", {
                  "lg:-order-1 min-w-[400px] h-[300px] max-h-[300px] lg:!max-w-[none]":
                    option === "featured",
                  "-order-1 !max-w-[none]": option === "default",
                }),
              }}
            />
          </CardBody>
        </Link>
      </CardNextUI>
    </FollowerPointerCard>
  );
};

const CardHeading: FC<{
  topic: string;
  date: string;
  readingTime: string;
}> = ({ topic, date, readingTime }) => {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <div>
        <TagWithDate date={date} topic={topic} />
      </div>
      <ReadingTime readingTime={readingTime} />
    </div>
  );
};

export default Card;
