import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "@/navigation";
import ManagementTabs from "./_components/management-tabs";
import { type Metadata } from "next";

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

const Management = async () => {
  const session = await auth();

  if (!session) redirect("/");

  const userRole = await api.dashboard.getUserRole.query();

  if (userRole?.role !== "ADMIN") redirect("/");

  const contacts = await api.dashboard.getUserContacts.query();
  const users = await api.user.getAll.query();

  return (
    <div className="dashboard min-h-[85dvh]">
      <div className="flex w-full flex-col">
        <ManagementTabs contacts={contacts} users={users} />
      </div>
    </div>
  );
};

export default Management;
