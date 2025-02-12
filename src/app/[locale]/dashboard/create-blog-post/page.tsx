import BlogPostForm from "@/app/_components/blog-post-form";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { type Metadata, type NextPage } from "next";
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

const CreateBlogPost: NextPage = async () => {
  const session = await auth();

  if (!session) redirect("/");

  const user = await api.user.get.query(session.user.id);

  if (user?.isBanned) redirect("/");

  const userRole = await api.dashboard.getUserRole.query();

  const isAdmin = userRole?.role === "ADMIN";

  return (
    <div className="dashboard">
      <BlogPostForm isAdmin={isAdmin} />
    </div>
  );
};

export default CreateBlogPost;
