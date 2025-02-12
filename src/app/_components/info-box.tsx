import { InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const InfoBox = ({ text }: { text: string }) => {
  const t = useTranslations("Dashboard");

  return (
    <div className="mb-4 flex items-center gap-6 rounded-md bg-sky-300 px-8 py-4">
      <InfoIcon size={32} className="min-w-fit" />
      <div>
        <h2 className="h2 mb-2 text-black">{t("info")}</h2>
        <p className="text-black">{text}</p>
      </div>
    </div>
  );
};

export default InfoBox;
