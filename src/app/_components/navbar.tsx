"use client";

import {
  Navbar as NavbarNext,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Link,
  AvatarIcon,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import AutocompleteSearchBar from "./autocomplete-search-bar";
import {
  useNavbarUserOptionsStore,
  useNavigationSidebarStore,
} from "@/store/global-store";
import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { type Session } from "next-auth";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { useState } from "react";

const Navbar = ({ session }: { session: Session | null }) => {
  const t = useTranslations("Navbar");

  const onChangeCollapsed = useNavigationSidebarStore(
    (state) => state.onChangeCollapsed,
  );
  const pathname = usePathname();

  return (
    <NavbarNext
      maxWidth="full"
      className={cn("wrapper bg-black py-2", {
        "dashboard bg-slate-200": pathname.includes("/dashboard"),
      })}
      classNames={{
        wrapper: "gap-0",
      }}
    >
      {pathname.includes("/dashboard") ? (
        <NavbarBrand>
          <Link href="/">
            <h1 className="h1 text-black">Penify</h1>
          </Link>
        </NavbarBrand>
      ) : (
        <NavbarBrand className="hidden lg:block">
          <button onClick={onChangeCollapsed} aria-label="menu button">
            <Menu size={32} className="text-white" />
          </button>
        </NavbarBrand>
      )}

      {!pathname.includes("/dashboard") && (
        <div className="from-pink-500 to-yellow-500 ml-[200px] flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-tr lg:ml-6">
          <AutocompleteSearchBar />
        </div>
      )}
      {session && <AdminNavigationLinks />}
      <NavbarContent justify="end">
        <NavbarItem>
          {pathname.includes("/dashboard") && (
            <div className="flex gap-8">
              <div className="flex gap-4 md:hidden">
                <Button
                  as={Link}
                  variant="flat"
                  className="bg-cyan-400"
                  href="/"
                >
                  {t("back-to-home")}
                </Button>
              </div>
              {session && <UserToolbar session={session} />}
            </div>
          )}
        </NavbarItem>
      </NavbarContent>
    </NavbarNext>
  );
};

export default Navbar;

const AdminNavigationLinks = () => {
  const t = useTranslations("Navbar");

  const { data: userRole } = api.dashboard.getUserRole.useQuery();

  const isAdmin = userRole?.role === "ADMIN";
  const pathname = usePathname();

  return (
    <NavbarContent justify="center">
      <NavbarItem>
        {pathname.includes("/dashboard") && isAdmin && (
          <div className="flex gap-8">
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-black">
                {t("dashboard")}
              </Link>
              <Link href="/dashboard/management" className="text-black">
                {t("management")}
              </Link>
            </div>
          </div>
        )}
      </NavbarItem>
    </NavbarContent>
  );
};

const UserToolbar = ({ session }: { session: Session }) => {
  const t = useTranslations("Navbar");

  const { data: user } = api.user.get.useQuery(session?.user.id);

  const [isOpen, setIsOpen] = useState(false);

  const { setShowUserOptions } = useNavbarUserOptionsStore((state) => ({
    setShowUserOptions: state.setShowUserOptions,
  }));

  const userOptions = [
    {
      title: `${t("signed-in-as")} ${session.user.name}`,
      href: "",
    },
    {
      title: t("settings"),
      onClick: () => {
        setShowUserOptions(true);
        setIsOpen(false);
      },
    },
    {
      title: t("analytics"),
      href: "",
    },
    {
      title: t("help-and-feedback"),
      href: "/contact",
    },
    {
      title: t("logout"),
      onClick: () => signOut({ callbackUrl: "/" }),
      key: "logout",
    },
  ];

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(value) => setIsOpen(value)}
      showArrow
      placement="bottom-end"
    >
      <PopoverTrigger>
        <Avatar
          icon={user?.image ? undefined : <AvatarIcon />}
          isBordered
          color="default"
          src={user?.image ?? ""}
          className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
        />
      </PopoverTrigger>
      <PopoverContent className="p-1">
        <ul>
          {userOptions.map((option, index) => (
            <li key={option.title}>
              <Link
                as={option.onClick ? Button : Link}
                href={option.href}
                isDisabled={!option.href && index > 0 && !option.onClick}
                onClick={option.onClick}
                className={cn(
                  "block w-full rounded-lg p-2 text-black hover:bg-gray-200",
                  {
                    "pointer-events-none cursor-default font-bold": index === 0,
                    "transition-all duration-250 hover:bg-red-200 hover:text-red-700":
                      option.key === "logout",
                    "bg-transparent text-left": option.onClick,
                  },
                )}
              >
                {option.title}
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
