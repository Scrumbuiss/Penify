import { type FC } from "react";
import { api } from "@/trpc/server";
import BlogPostsItem from "./blog-posts-item";
import BlogPostsItemsWrapper from "./blog-posts-items-wrapper";
import { getTranslations } from "next-intl/server";
import BlogPostCreateLink from "./blog-post-create-link";

const BlogPosts: FC = async () => {
  const userAcceptedArticles =
    await api.dashboard.getUserAcceptedArticles.query();

  const t = await getTranslations("Dashboard");

  return (
    <section>
      <div className="wrapper">
        <div>
          <h2 className="h2 mb-4 text-black">{t("your-blog-posts")}</h2>
          <BlogPostsItemsWrapper>
            <li>
              <BlogPostCreateLink headline={t("create-blog-post")} />
            </li>
            {userAcceptedArticles.map(({ title, description, id, image }) => (
              <BlogPostsItem
                title={title}
                id={id}
                description={description}
                image={image}
              />
            ))}
          </BlogPostsItemsWrapper>
        </div>
      </div>
    </section>
  );
};

export default BlogPosts;
