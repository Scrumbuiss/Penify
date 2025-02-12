"use client";

import { Avatar, AvatarIcon } from "@nextui-org/react";
import { useTranslations } from "next-intl";

const ArticleContentAuthor = ({
  createdBy,
}: {
  createdBy:
    | {
        image: string | null;
        about: string | null;
        name: string | null;
        keywords: string | null;
      }
    | undefined;
}) => {
  const t = useTranslations("BlogPost");

  return (
    <>
      {createdBy?.keywords && createdBy?.about && (
        <div className="py-4">
          <h2 className="h2 mb-4">{t("about-author")}</h2>
          <div className="flex gap-4">
            <Avatar
              icon={createdBy.image ? undefined : <AvatarIcon />}
              isBordered
              color="default"
              src={createdBy.image ?? ""}
              className="min-h-[56px] min-w-[56px]"
            />
            <div>
              <h3 className="h4">{createdBy.keywords}</h3>
              <p className="text-sm">{createdBy.about}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleContentAuthor;
