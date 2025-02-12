import { api } from "@/trpc/server";
import Card from "./card";
import { getTranslations } from "next-intl/server";

const ArticleList = async ({
  searchParams,
  locale,
}: {
  searchParams: Record<string, string | [] | undefined>;
  locale: string;
}) => {
  const articles = await api.articles.getAllArticles.query({
    category: searchParams.category as string | undefined,
    locale: locale.toUpperCase() as "PL" | "EN" | "DE",
  });
  const t = await getTranslations("Common");

  return (
    <section className="pt-0">
      <div className="wrapper">
        {articles.localeArticles.length > 0 ? (
          <ul className="grid grid-cols-3 gap-6 lg:grid-cols-2 md:grid-cols-1">
            {articles.localeArticles
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map(
                ({
                  title,
                  category,
                  description,
                  id,
                  image,
                  createdAt,
                  readingTime,
                  createdBy,
                }) => (
                  <li key={id}>
                    <Card
                      name={createdBy.name ?? ""}
                      userImage={createdBy.image ?? ""}
                      link={id}
                      topic={category}
                      date={new Date(createdAt).toLocaleDateString()}
                      headline={title}
                      description={description}
                      image={image}
                      readingTime={`${readingTime} ${t("minutes")}`}
                    />
                  </li>
                ),
              )}
          </ul>
        ) : (
          <h2 className="h1 text-center">
            {t("no-articles-in-this-category")}
          </h2>
        )}
        {articles.otherLanguageArticles.length > 0 && (
          <>
            <h2 className="h1 mb-10 mt-20 text-center">
              {t("articles-in-other-languages")}
            </h2>
            <ul className="grid grid-cols-3 gap-6 lg:grid-cols-2 md:grid-cols-1">
              {articles.otherLanguageArticles
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map(
                  ({
                    title,
                    category,
                    description,
                    id,
                    image,
                    createdAt,
                    readingTime,
                    createdBy,
                  }) => (
                    <li key={id}>
                      <Card
                        name={createdBy.name ?? ""}
                        userImage={createdBy.image ?? ""}
                        link={id}
                        topic={category}
                        date={new Date(createdAt).toLocaleDateString()}
                        headline={title}
                        description={description}
                        image={image}
                        readingTime={`${readingTime} ${t("minutes")}`}
                      />
                    </li>
                  ),
                )}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};

export default ArticleList;
