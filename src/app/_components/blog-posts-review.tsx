import { api } from "@/trpc/server";
import { type FC } from "react";
import BlogPostsItem from "./blog-posts-item";
import BlogPostsItemsWrapper from "./blog-posts-items-wrapper";
import InfoBox from "./info-box";
import { getTranslations } from "next-intl/server";

const BlogPostsReview: FC = async () => {
  const userOnReviewArticles =
    await api.dashboard.getUserOnReviewArticles.query();

  const t = await getTranslations("Dashboard");

  return (
    <section>
      <div className="wrapper">
        <div>
          <InfoBox text={t("blog-posts-review-info")} />
          <h2 className="h2 mb-2 text-black">
            {t("your-blog-posts-on-review")}
          </h2>
          {userOnReviewArticles.length > 0 ? (
            <BlogPostsItemsWrapper>
              {userOnReviewArticles.map(({ title, description, id, image }) => (
                <BlogPostsItem
                  key={id}
                  title={title}
                  id={id}
                  description={description}
                  image={image}
                />
              ))}
            </BlogPostsItemsWrapper>
          ) : (
            <p>{t("currently-there-are-no-posts-on-review")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogPostsReview;
