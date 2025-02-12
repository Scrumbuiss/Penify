import { auth } from "@/server/auth";
import LoginPopup from "../_components/login-popup";
import NavigationSidebar from "../_components/navigation-sidebar";
import FeaturedArticle from "../_components/featured-article";
import ArticleList from "../_components/article-list";
import { getTranslations } from "next-intl/server";

export const generateMetadata = async ({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | [] | undefined>;
}) => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const haveCategorySearchParams = searchParams !== undefined;

  return {
    openGraph: {
      title: "Penify blog",
      description: t("description"),
      url: `https://www.penifyapp.com/${locale}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      siteName: "Penify",
      images: [
        {
          url: "/open-graph-image.png",
        },
      ],
    },
    alternates: {
      canonical: `/${locale}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      languages: {
        en: `/en${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
        de: `/de${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
        pl: `/pl${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      },
    },
  };
};

export default async function Home({
  searchParams,
  params: { locale },
}: {
  searchParams: Record<string, string | [] | undefined>;
  params: { locale: string };
}) {
  const session = await auth();

  return (
    <>
      <div className="wrapper">
        <div className="flex">
          <NavigationSidebar session={session} searchParams={searchParams} />
          <div className="w-full">
            <FeaturedArticle />
            <ArticleList searchParams={searchParams} locale={locale} />
          </div>
        </div>
      </div>
      {!session && <LoginPopup />}
    </>
  );
}
