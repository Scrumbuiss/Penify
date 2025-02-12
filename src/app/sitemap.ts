import { db } from "@/server/db";
import { type MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await db.query.articles.findMany();

  const generateArticlesSitemap = articles.map((article) => {
    return {
      url: `https://penifyapp.com/en/${article.id}`,
      lastModified: article.createdAt,
      changeFrequency: "daily" as
        | "weekly"
        | "daily"
        | "always"
        | "hourly"
        | "monthly"
        | "yearly"
        | "never"
        | undefined,
      priority: 1,
      alternates: {
        languages: {
          en: `https://penifyapp.com/en/${article.id}`,
          de: `https://penifyapp.com/de/${article.id}`,
          pl: `https://penifyapp.com/pl/${article.id}`,
        },
      },
    };
  });

  return [
    {
      url: "https://penifyapp.com/en",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          en: "https://penifyapp.com/en",
          de: "https://penifyapp.com/de",
          pl: "https://penifyapp.com/pl",
        },
      },
    },
    {
      url: "https://penifyapp.com/en/faq",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          en: "https://penifyapp.com/en/faq",
          de: "https://penifyapp.com/de/faq",
          pl: "https://penifyapp.com/pl/faq",
        },
      },
    },
    {
      url: "https://penifyapp.com/en/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: {
        languages: {
          en: "https://penifyapp.com/en/contact",
          de: "https://penifyapp.com/de/contact",
          pl: "https://penifyapp.com/pl/contact",
        },
      },
    },
    ...generateArticlesSitemap,
  ];
}
