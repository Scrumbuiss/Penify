"use client";

import ContactPopup from "./contact-popup";
import { useState } from "react";

const ContactList = ({
  contacts,
}: {
  contacts: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    theme: string;
    message: string;
  }[];
}) => {
  const [contactId, setContactId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <div className="wrapper">
        <h1 className="h1 mb-4 text-black">Contact list</h1>
        {contacts.length > 0 ? (
          <ul className="mb-2 flex flex-col gap-2">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                onClick={() => {
                  setContactId(contact.id);
                  setIsOpen(true);
                }}
              >
                <div className="flex cursor-pointer items-center justify-between gap-8 rounded-md bg-white p-3 duration-250 transition-background hover:bg-grey-light">
                  <h2 className="h3 text-black">{contact.theme}</h2>
                  <p className="text-black">{contact.email}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <h2 className="h1 text-center">No contacts</h2>
        )}
        {contactId && (
          <ContactPopup
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            contactId={contactId}
          />
        )}
      </div>
    </section>
  );
};

export default ContactList;
