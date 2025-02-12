"use client";

import { Chip } from "@nextui-org/react";

const UsersList = ({
  users,
}: {
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
    <section>
      <div className="wrapper">
        <h1 className="h1 mb-4 text-black">Users list</h1>
        {users.length > 0 ? (
          <ul className="mb-2 flex flex-col gap-2">
            {users.map((user) => (
              <li key={user.id}>
                <div className="flex flex-wrap items-center justify-between gap-8 rounded-md bg-white p-3 duration-250 transition-background hover:bg-grey-light">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="h3 text-black">{user.name}</h2>
                    <Chip size="sm" variant="faded">
                      {user.role}
                    </Chip>
                  </div>
                  <p className="text-black">{user.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <h2 className="h1 text-center">No Users</h2>
        )}
      </div>
    </section>
  );
};

export default UsersList;
