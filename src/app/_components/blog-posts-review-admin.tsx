import { api } from "@/trpc/server";
import BlogPostsItem from "./blog-posts-item";
import BlogPostsItemsWrapper from "./blog-posts-items-wrapper";
import { getTranslations } from "next-intl/server";

const BlogPostsReviewAdmin = async () => {
  const userRole = await api.dashboard.getUserRole.query();

  if (userRole?.role !== "ADMIN") return;

  const allUsersArticlesOnReview =
    await api.dashboard.getUserArticlesToReview.query();

  const t = await getTranslations("Dashboard");

  return (
    <section>
      <div className="wrapper">
        <h2 className="h2 mb-2 text-black">
          {t("user-articles-to-be-approve")}
        </h2>
        <div>
          {allUsersArticlesOnReview.length > 0 ? (
            <div className="flex flex-col gap-4">
              <BlogPostsItemsWrapper>
                {allUsersArticlesOnReview.map(
                  ({ title, description, id, image, createdBy }) => (
                    <BlogPostsItem
                      key={id}
                      title={title}
                      id={id}
                      description={description}
                      image={image}
                      author={createdBy.name!}
                    />
                  ),
                )}
              </BlogPostsItemsWrapper>
            </div>
          ) : (
            <p>{t("no-user-posts-to-approve")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogPostsReviewAdmin;
