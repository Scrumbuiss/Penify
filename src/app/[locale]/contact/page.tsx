import LoginPopup from "@/app/_components/login-popup";
import NavigationSidebar from "@/app/_components/navigation-sidebar";
import { auth } from "@/server/auth";
import ContactForm from "./_components/contact-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Contact");

  return {
    title: t("contact"),
    description: t("contact-message"),
    applicationName: "Penify",
    robots: "index, follow",
    alternates: {
      canonical: `/contact`,
      languages: {
        en: `/en/contact`,
        de: `/de/contact`,
        pl: `/pl/contact`,
      },
    },
  };
}

const Contact = async () => {
  const session = await auth();

  return (
    <div className="wrapper">
      <div className="flex">
        <NavigationSidebar session={session} searchParams={{}} />
        <ContactForm />
      </div>
      <LoginPopup />
    </div>
  );
};

export default Contact;
