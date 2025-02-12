"use client";

import { Avatar, Link } from "@nextui-org/react";

import TagWithDate from "./tag-with-date";
import ReadingTime from "./reading-time";
import { useTranslations } from "next-intl";
import Image from "next/image";

const ArticleHeader = ({
  article,
  articleLanguages,
}: {
  article:
    | {
        id: string;
        title: string;
        image: string;
        createdAt: Date;
        category: string;
        readingTime: string;
        createdBy: { name: string | null };
        languageExtended: string | null;
      }
    | undefined;
  articleLanguages: (
    | {
        id: string;
        isAccepted: boolean;
        languageExtended:
          | "PL"
          | "EN"
          | "DE"
          | "SA"
          | "BG"
          | "CN"
          | "CZ"
          | "EE"
          | "FI"
          | "FR"
          | "GR"
          | "HU"
          | "ID"
          | "IT"
          | "JP"
          | "KR"
          | "LV"
          | "NO"
          | "PT"
          | "BR"
          | "RO"
          | "SK"
          | "SI"
          | "ES"
          | "SE"
          | "TR"
          | "UA";
      }
    | undefined
  )[];
}) => {
  const t = useTranslations("Common");

  return (
    <section>
      <div className="wrapper">
        <div>
          <Image
            alt={article?.title ?? ""}
            src={article?.image ?? ""}
            priority
            quality={80}
            width={900}
            height={300}
            className="w-ful max-h-[300px] rounded-lg object-cover"
            loading="eager"
          />
          <div className="mt-4 flex items-center justify-between gap-2 lg:flex-col lg:items-start">
            <div className="flex gap-4">
              <TagWithDate
                date={new Date(article?.createdAt ?? "").toLocaleDateString()}
                topic={t(article?.category) ?? ""}
                className="-ml-4"
              />
              <ReadingTime
                readingTime={`${article?.readingTime} ${t("minutes")}`}
              />
            </div>
            <div className="text-sm font-normal text-white">
              {t("author")}: {article?.createdBy?.name}
            </div>
          </div>
          <div className="mt-2">
            <h3 className="h4 mb-2 text-white">{t("available-languages")}:</h3>
            <ul className="flex gap-2">
              <li key={article?.id} className="text-sm font-normal text-white">
                <Link
                  className="flex gap-2 rounded-md bg-slate-600 p-2"
                  href={`/${article?.id}?category=${article?.category}`}
                >
                  <Avatar
                    alt={
                      article?.languageExtended === "EN"
                        ? "language us"
                        : `language ${article?.languageExtended!.toLowerCase() ?? "avatar"}`
                    }
                    className="h-6 w-6"
                    src={`https://flagcdn.com/${
                      article?.languageExtended === "EN"
                        ? "us"
                        : article?.languageExtended!.toLowerCase()
                    }.svg`}
                  />
                  {article?.languageExtended}
                </Link>
              </li>
              {articleLanguages
                .filter((article) => article?.isAccepted === true)
                .map((item) => (
                  <>
                    <li
                      key={item?.id}
                      className="text-sm font-normal text-grey-soft"
                    >
                      <Link
                        className="flex gap-2 rounded-md p-2 transition-all duration-250 hover:bg-slate-600"
                        href={`/${item?.id}?category=${article?.category}`}
                      >
                        <Avatar
                          alt={
                            item?.languageExtended === "EN"
                              ? "language us"
                              : `language ${(item?.languageExtended as string).toLowerCase()}`
                          }
                          className="h-6 w-6"
                          src={`https://flagcdn.com/${
                            item?.languageExtended === "EN"
                              ? "us"
                              : item?.languageExtended!.toLowerCase()
                          }.svg`}
                        />
                        {item?.languageExtended}
                      </Link>
                    </li>
                  </>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleHeader;
