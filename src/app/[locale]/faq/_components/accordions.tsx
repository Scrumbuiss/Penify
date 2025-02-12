"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";
import { useTranslations } from "next-intl";

const Accordions = () => {
  const t = useTranslations("Faq");

  const items = [
    {
      title: t("accordion-1.title"),
      content: t("accordion-1.content"),
    },
  ];

  return (
    <section className="section w-full">
      <h2 className="h2 mb-8 text-center">FAQ</h2>
      <Accordion variant="splitted" className="w-full">
        {items.map(({ title, content }) => (
          <AccordionItem
            key={title}
            aria-label={title}
            className="!p-0 text-white"
            title={title}
            classNames={{
              base: "!p-0 [&>section]:!p-0",
              trigger: "px-4",
              content: "px-4 pb-4",
            }}
          >
            {content}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default Accordions;
