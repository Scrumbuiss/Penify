"use client";

import { Tab, Chip, Tabs } from "@nextui-org/react";
import ContactList from "./contact-list";
import UsersList from "./users-list";

const ManagementTabs = ({
  contacts,
  users,
}: {
  contacts: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    theme: string;
    message: string;
  }[];
  users: {
    image: string | null;
    id: string;
    name: string | null;
    password: string | null;
    email: string;
    emailVerified: Date | null;
    about: string | null;
    keywords: string | null;
    role: "ADMIN" | "AUTHOR";
  }[];
}) => {
  return (
    <Tabs
      aria-label="Options"
      color="primary"
      variant="underlined"
      className="px-8"
      classNames={{
        tabList:
          "gap-6 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-[#22d3ee]",
        tab: "max-w-fit px-0 h-12",
        tabContent: "group-data-[selected=true]:text-[#06b6d4]",
      }}
    >
      <Tab
        key="contact"
        title={
          <div className="flex items-center space-x-2">
            <span>Contact</span>
            <Chip size="sm" variant="faded">
              {contacts.length.toString()}
            </Chip>
          </div>
        }
      >
        <ContactList contacts={contacts} />
      </Tab>
      <Tab
        key="users"
        title={
          <div className="flex items-center space-x-2">
            <span>Users</span>
            <Chip size="sm" variant="faded">
              {users.length.toString()}
            </Chip>
          </div>
        }
      >
        <UsersList users={users} />
      </Tab>
    </Tabs>
  );
};

export default ManagementTabs;
