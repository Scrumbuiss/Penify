"use client";

import { cn } from "@/utils";
import { Link } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const Footer = () => {
  const t = useTranslations("Footer");

  const pathname = usePathname();

  return (
    <footer
      className={cn(
        "sticky bottom-0 left-0 right-0 z-40 bg-black text-grey-soft",
        {
          "bg-grey-light text-black": pathname.includes("/dashboard"),
        },
      )}
    >
      <div
        className={cn("wrapper", {
          dashboard: pathname.includes("/dashboard"),
        })}
      >
        <div
          className={cn(
            "ml-[199px] flex justify-between gap-2 border-l-1 border-t-1 border-grey-dark p-4 lg:ml-0 md:flex-col",
            {
              "ml-0 border-l-0 border-t-0": pathname.includes("/dashboard"),
            },
          )}
        >
          <div className="md:order-1">
            {t("created-by")} Scrumbuiss. {t("all-rights-reserved")} &copy;
          </div>
          <div className="flex gap-4">
            <Link
              href="/faq"
              className={cn(
                "text-grey-soft transition-colors duration-250 hover:text-primary-main",
                {
                  "text-black": pathname.includes("/dashboard"),
                },
              )}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className={cn(
                "text-grey-soft transition-colors duration-250 hover:text-primary-main",
                {
                  "text-black": pathname.includes("/dashboard"),
                },
              )}
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
