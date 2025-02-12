import { api } from "@/trpc/server";
import Card from "./card";

const FeaturedArticle = async () => {
  const featuredArticle = await api.articles.getFeaturedArticle.query();

  return (
    <section>
      <div className="wrapper">
        <div className="flex">
          <Card
            name={featuredArticle?.createdBy?.name ?? ""}
            userImage={featuredArticle?.createdBy?.image ?? ""}
            link={featuredArticle?.id ?? ""}
            topic={featuredArticle?.category ?? ""}
            date={new Date(
              featuredArticle?.createdAt ?? "",
            ).toLocaleDateString()}
            headline={featuredArticle?.title ?? ""}
            description={featuredArticle?.description ?? ""}
            image={featuredArticle?.image ?? ""}
            option="featured"
            readingTime={`${featuredArticle?.readingTime} minutes`}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
