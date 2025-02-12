import ArticleAside from "../../_components/article-aside";
import LoginPopup from "../../_components/login-popup";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { type Metadata } from "next";
import NavigationSidebar from "../../_components/navigation-sidebar";
import ArticleHeader from "../../_components/article-header";
import ArticleContent from "../../_components/article-content";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { articleId: string; locale: string };
  searchParams: Record<string, string | [] | undefined>;
}): Promise<Metadata> {
  const article = await api.articles.getArticle.query({ id: params.articleId });

  const haveCategorySearchParams = searchParams.category !== undefined;

  return {
    title: article?.title,
    description: article?.description,
    applicationName: "Penify",
    keywords: [
      ...(article?.ArticleTags?.map((tag) => tag.tag) ?? ""),
      article?.category ?? "",
      "penify",
      "article",
      "writing",
      "blog",
      "content",
      "publishing",
      "reading",
      "education",
      "knowledge",
      "learning",
      "information",
    ],
    creator: article?.createdBy?.name,
    publisher: "Penify",
    robots: "index, follow",
    openGraph: {
      title: article?.title,
      description: article?.description,
      url: `https://www.penifyapp.com/${params.articleId}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      siteName: "Penify",
      images: [
        {
          url: article?.image ?? "",
        },
      ],
    },
    alternates: {
      canonical: `/${params.locale}/${params.articleId}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      languages: {
        en: `/en/${params.articleId}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
        de: `/de/${params.articleId}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
        pl: `/pl/${params.articleId}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      },
    },
  };
}

const Article = async ({
  params,
  searchParams,
}: {
  params: { articleId: string };
  searchParams: Record<string, string | [] | undefined>;
}) => {
  const session = await auth();

  const article = await api.articles.getArticle.query({ id: params.articleId });
  if (article === null || article === undefined) notFound();

  const articleLanguages = await api.articles.getArticleLanguages.query({
    id: params.articleId,
  });

  return (
    <div className="wrapper">
      <div className="flex">
        <NavigationSidebar session={session} searchParams={searchParams} />
        <div>
          <ArticleHeader
            article={article}
            articleLanguages={articleLanguages}
          />
          <ArticleContent session={session} article={article} />
        </div>
        <ArticleAside articleId={params.articleId} />
      </div>
      <LoginPopup />
    </div>
  );
};

export default Article;
