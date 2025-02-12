import "@/styles/globals.css";

import { Poppins } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "../_components/providers";
import Navbar from "../_components/navbar";
import { auth } from "@/server/auth";
import { Toaster } from "react-hot-toast";
import NextIntlClientProvider from "../_components/next-intl-client-provider";
import Footer from "../_components/footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getTranslations } from "next-intl/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/server/core";
import UserOptionsPopup from "../_components/user-options-popup";

const poppins = Poppins({
  weight: ["400", "500", "600"],
  preload: false,
});

export const generateMetadata = async ({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | [] | undefined>;
}) => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const haveCategorySearchParams = searchParams !== undefined;

  return {
    title: "Penify",
    creator: "Dawid",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    description: t("description"),
    applicationName: "Penify",
    keywords: [
      "penify",
      "blog",
      t("keywords.article"),
      t("keywords.writing"),
      t("keywords.content"),
      t("keywords.publishing"),
      t("keywords.reading"),
      t("keywords.education"),
      t("keywords.knowledge"),
      t("keywords.learning"),
      t("keywords.information"),
    ],
    publisher: "Penify",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    openGraph: {
      title: "Penify blog",
      description: t("description"),
      url: `https://www.penifyapp.com/${locale}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      siteName: "Penify",
      images: [
        {
          url: "/open-graph-image.png",
        },
      ],
    },
    metadataBase: new URL("https://www.penifyapp.com"),
    alternates: {
      canonical: `/${locale}${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      languages: {
        en: `/en${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
        de: `/de${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
        pl: `/pl${haveCategorySearchParams ? `?category=${searchParams.category as string}` : ""}`,
      },
    },
    // Google Adsense
    // other: {
    //   "google-adsense-account": "",
    // },
  };
};

// export const runtime = "edge";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  return (
    <html lang={locale}>
      <body className={poppins.className}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <TRPCReactProvider cookies={cookies().toString()}>
          <NextIntlClientProvider locale={locale}>
            <Providers>
              <Navbar session={session} />
              <main className="dark">{children}</main>
              <Footer />
              {session && <UserOptionsPopup session={session} />}
              <Toaster />
            </Providers>
          </NextIntlClientProvider>
        </TRPCReactProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
