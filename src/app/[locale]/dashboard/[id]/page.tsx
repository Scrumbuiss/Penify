import BlogPostForm from "@/app/_components/blog-post-form";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

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

const ArticleDetailPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | [] | undefined>;
}) => {
  const session = await auth();

  if (!session) redirect("/");

  const user = await api.user.get.query(session.user.id);

  if (user?.isBanned) redirect("/");

  const userRole = await api.dashboard.getUserRole.query();

  const userOriginalArticle =
    await api.dashboard.currentUserOriginalArticle.query({
      articleId: params.id ?? "",
    });

  const languageEnumFromPrisma =
    searchParams.language?.toString().toUpperCase() ??
    userOriginalArticle?.languageExtended;

  const isAdmin = userRole?.role === "ADMIN";

  if (!userOriginalArticle && userRole?.role !== "ADMIN") {
    return (
      <div className="dashboard">
        <div className="mt-10 flex flex-col items-center justify-center">
          <h1 className="h1 mb-4 text-black">
            Sorry bro but this is not your Blog Post
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <BlogPostForm
        isAdmin={isAdmin}
        articleId={params.id ?? ""}
        searchParams={searchParams}
        languageEnumFromPrisma={languageEnumFromPrisma}
      />
    </div>
  );
};

export default ArticleDetailPage;
