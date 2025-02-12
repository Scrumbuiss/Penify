"use client";

import { Autocomplete, AutocompleteItem, Link } from "@nextui-org/react";
import { SearchIcon } from "./svg";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

const AutocompleteSearchBar = () => {
  const t = useTranslations("Navbar");

  const [search, setSearch] = useState<string>("");

  const { data: articles, isLoading } =
    api.articles.getSearchedArticles.useQuery({
      search,
    });

  return (
    <Autocomplete
      classNames={{
        listboxWrapper: "max-h-[320px]",
        selectorButton: "text-default-500",
      }}
      items={search ? articles ?? [] : []}
      isLoading={isLoading}
      inputProps={{
        classNames: {
          input: "ml-1 text-white",
          inputWrapper: "h-[48px] data-[focus=true]:!border-orange",
        },
      }}
      onInputChange={(value) => setSearch(value)}
      listboxProps={{
        hideSelectedIcon: true,
        itemClasses: {
          base: [
            "rounded-medium",
            "text-default-500",
            "transition-opacity",
            "data-[pressed=true]:opacity-70",
            "data-[selectable=true]:focus:bg-default-100",
            "data-[focus-visible=true]:ring-default-500",
          ],
        },
      }}
      aria-label="Select an article"
      placeholder={t("enter-article-name")}
      popoverProps={{
        offset: 10,
        classNames: {
          base: "rounded-large",
          content: "border-small border-default-100 bg-black",
        },
      }}
      startContent={<SearchIcon className="text-default-400" />}
      radius="full"
      variant="bordered"
    >
      {(item) => (
        <AutocompleteItem
          key={item.id}
          classNames={{
            base: "data-[focus=true]:!bg-transparent data-[active=true]:!bg-transparent !p-0",
            wrapper: "hover:!bg-transparent",
            title:
              "!text-grey-dark !cursor-default hover:!bg-transparent data-[focus=true]:!bg-transparent",
          }}
          textValue={item.title}
        >
          <Link
            href={`/${item.id}`}
            className="flex h-full flex-col items-start justify-start gap-1 rounded-md bg-transparent p-2 transition-all duration-250 hover:bg-grey-dark"
          >
            <h3 className="h3">{item.title}</h3>
            <p>
              {
                (
                  item as {
                    id: string;
                    title: string;
                    createdBy: { name: string };
                  }
                ).createdBy.name
              }
            </p>
          </Link>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export default AutocompleteSearchBar;
