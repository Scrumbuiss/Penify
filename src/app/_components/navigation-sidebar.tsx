"use client";

import {
  useNavbarUserOptionsStore,
  useNavigationSidebarStore,
} from "@/store/global-store";
import {
  ScrollShadow,
  Avatar,
  AvatarIcon,
  Button,
  Link,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { ArticleTopics } from "./blog-post-form";
import { cn } from "@/utils";
import { BugIcon, LayoutDashboardIcon, SidebarCloseIcon } from "lucide-react";
import { type Session } from "next-auth";
import { useLoginStore } from "@/store/login-store";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import { useLocale, useTranslations } from "next-intl";
import { Link as LinkIntl } from "@/navigation";

const NavigationSidebar = ({
  session,
  searchParams,
}: {
  session: Session | null;
  searchParams: Record<string, string | [] | undefined>;
}) => {
  const t = useTranslations("Sidebar");
  const tCommon = useTranslations("Common");

  const onChange = useLoginStore((state) => state.onChange);

  const mediaQueryMedium = useMediaQuery("(min-width: 1024px)");

  const { collapsed, onChangeCollapsed, setCollapsed } =
    useNavigationSidebarStore((state) => ({
      collapsed: state.collapsed,
      setCollapsed: state.setCollapsed,
      onChangeCollapsed: state.onChangeCollapsed,
    }));

  const { setShowUserOptions } = useNavbarUserOptionsStore((state) => ({
    setShowUserOptions: state.setShowUserOptions,
  }));

  const asideRef = useClickOutside(() => setCollapsed(true));

  const pathname = usePathname();

  useEffect(() => {
    if (mediaQueryMedium) {
      useNavigationSidebarStore.setState({ collapsed: false });
    } else {
      useNavigationSidebarStore.setState({ collapsed: true });
    }
  }, [mediaQueryMedium]);

  return (
    <aside
      ref={asideRef}
      className={cn(
        "sticky top-0 z-50 -mt-20 h-[100dvh] w-full min-w-[200px] max-w-[200px] overflow-y-auto border-r-1 border-r-grey-dark bg-black p-4 transition-all duration-200 ease-in-out lg:fixed lg:left-0 lg:mt-0",
        {
          "lg:left-[-200px]": collapsed,
        },
      )}
    >
      <div>
        <nav>
          <div className="hidden lg:flex">
            <button
              onClick={onChangeCollapsed}
              className="ml-auto"
              aria-label="menu button close"
            >
              <SidebarCloseIcon className=" text-white transition-colors duration-250 hover:text-orange" />
            </button>
          </div>
          <Link href="/">
            <h1
              className={cn("h1 mb-4", {
                "text-black": pathname.includes("/dashboard"),
              })}
            >
              Penify
            </h1>
          </Link>
          {session && (
            <div className="-mx-3 mb-6 rounded-md bg-cyan-600 p-3 pr-1">
              <h3 className="mb-2 text-xs">{t("overview")}</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "-ml-2 flex items-center gap-2 rounded-md p-2 text-white transition-colors duration-200 hover:bg-sky-400 hover:text-black hover:opacity-100",
                    )}
                  >
                    <LayoutDashboardIcon />
                    {t("dashboard")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className={cn(
                      "-ml-2 flex items-center gap-2 rounded-md p-2 text-white transition-colors duration-200 hover:bg-sky-400 hover:text-black hover:opacity-100",
                    )}
                  >
                    <BugIcon />
                    {t("report-bug")}
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div>
            <h3 className=" mb-2 mt-4 text-xs">{t("categories")}</h3>
            <ScrollShadow className="-ml-2 mb-2 max-h-[45dvh]">
              <ul className="flex flex-col gap-2">
                {["all", ...ArticleTopics].map((topic) => (
                  <li key={topic} value={topic}>
                    <Link
                      href={topic === "all" ? "/" : `/?category=${topic}`}
                      className={cn(
                        "block cursor-pointer rounded-md p-2 text-grey-soft transition-colors duration-200 hover:bg-gray-600 hover:text-orange",
                        {
                          "bg-gray-600 text-orange":
                            searchParams.category === topic ||
                            (topic === "all" && !searchParams.category),
                        },
                      )}
                    >
                      {tCommon(topic)}
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollShadow>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {session ? (
              <Button
                className="h-[unset] w-full justify-start bg-gray-700 !px-1 !py-4 hover:bg-slate-600 "
                onClick={() => setShowUserOptions(true)}
              >
                <UserAvatar session={session} />
              </Button>
            ) : (
              <Button
                onClick={onChange}
                variant="flat"
                color="warning"
                className="w-full"
              >
                {t("login")}
              </Button>
            )}
          </div>
          <LocaleSwitcher />
        </nav>
      </div>
    </aside>
  );
};

export default NavigationSidebar;

const LocaleSwitcher = () => {
  const t = useTranslations("Sidebar");

  const pathname = usePathname();

  const locale = useLocale();

  return (
    <Select
      defaultSelectedKeys={[locale]}
      className="mt-4 max-w-xs"
      disallowEmptySelection
      classNames={{
        trigger:
          "bg-black text-white border-grey-dark border-1 hover:!bg-grey-dark transition-all duration-200 ease-in-out",
        label: "!text-white",
        value: "!text-white",
      }}
      label={t("select-language")}
    >
      <SelectItem
        key="de"
        textValue={t("germany")}
        className="relative"
        startContent={
          <Avatar
            alt={t("germany")}
            className="h-6 w-6"
            src="https://flagcdn.com/de.svg"
          />
        }
      >
        <LinkIntl
          href={
            pathname === `/${locale}`
              ? "/"
              : `${pathname.replace(/^\/[a-z]{2}/, "")}`
          }
          className="absolute inset-0 flex h-full w-full"
          locale="de"
        >
          <span className="my-auto block w-full pl-10">{t("germany")}</span>
        </LinkIntl>
      </SelectItem>
      <SelectItem
        key="en"
        textValue={t("english")}
        className="relative"
        startContent={
          <Avatar
            alt={t("english")}
            className="h-6 w-6"
            src="https://flagcdn.com/us.svg"
          />
        }
      >
        <LinkIntl
          href={
            pathname === `/${locale}`
              ? "/"
              : `${pathname.replace(/^\/[a-z]{2}/, "")}`
          }
          className="absolute inset-0 flex h-full w-full"
          locale="en"
        >
          <span className="my-auto block w-full pl-10">{t("english")}</span>
        </LinkIntl>
      </SelectItem>
      <SelectItem
        key="pl"
        textValue={t("polish")}
        startContent={
          <Avatar
            alt={t("polish")}
            className="h-6 w-6"
            src="https://flagcdn.com/pl.svg"
          />
        }
      >
        <LinkIntl
          href={
            pathname === `/${locale}`
              ? "/"
              : `${pathname.replace(/^\/[a-z]{2}/, "")}`
          }
          className="absolute inset-0 flex h-full w-full"
          locale="pl"
        >
          <span className="my-auto block w-full pl-10">{t("polish")}</span>
        </LinkIntl>
      </SelectItem>
    </Select>
  );
};

const UserAvatar = ({ session }: { session: Session }) => {
  const t = useTranslations("Sidebar");

  const { data: user } = api.user.get.useQuery(session?.user.id);

  const { data: userRole } = api.dashboard.getUserRole.useQuery();

  return (
    <>
      <Avatar
        icon={user?.image ? undefined : <AvatarIcon />}
        src={user?.image ?? ""}
        classNames={{
          base: "bg-gradient-to-br min-w-[40px] from-[#FFB457] to-[#FF705B]",
          icon: "text-black/80",
        }}
      />
      <div>
        <h3 className="whitespace-pre-wrap text-left text-xs">{user?.name}</h3>
        <p className="text-left text-xs text-grey-soft">
          {userRole?.role && t(userRole?.role)}
        </p>
      </div>
    </>
  );
};
