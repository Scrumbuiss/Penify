import { type Metadata, type NextPage } from "next";

import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import BlogPosts from "../../_components/blog-posts";
import BlogPostsReview from "../../_components/blog-posts-review";
import BlogPostsReviewAdmin from "../../_components/blog-posts-review-admin";
import { getTranslations } from "next-intl/server";
import { api } from "@/trpc/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const Dashboard: NextPage = async () => {
  const session = await auth();

  if (!session) redirect("/");

  const user = await api.user.get.query(session.user.id);

  if (user?.isBanned) redirect("/");

  const t = await getTranslations("Dashboard");

  return (
    <div className="dashboard min-h-[85dvh]">
      <section>
        <div className="wrapper">
          <h2 className="h1 text-black">
            {t("hello")} {session.user.name}
          </h2>
        </div>
      </section>
      <BlogPosts />
      <BlogPostsReviewAdmin />
      <BlogPostsReview />
    </div>
  );
};

export default Dashboard;
