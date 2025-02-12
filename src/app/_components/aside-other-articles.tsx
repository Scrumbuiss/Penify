import AsideCard from "./aside-card";
import { api } from "@/trpc/server";

const AsideOtherArticles = async ({ articleId }: { articleId: string }) => {
  const relatedArticles = await api.articles.getRelatedArticles.query({
    articleId: articleId,
  });

  return (
    <>
      {relatedArticles.map((article) => (
        <AsideCard
          name={article.createdBy.name ?? ""}
          userImage={article.createdBy.image ?? ""}
          key={article.title}
          headline={article.title}
          image={article.image}
          link={article.id}
          category={article.category}
        />
      ))}
    </>
  );
};

export default AsideOtherArticles;
