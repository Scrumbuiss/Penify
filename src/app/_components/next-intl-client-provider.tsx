import {
  NextIntlClientProvider as NextIntlClientProviderINTL,
  useMessages,
} from "next-intl";

const NextIntlClientProviderS = ({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) => {
  const messages = useMessages();

  return (
    <NextIntlClientProviderINTL locale={locale} messages={messages}>
      {children}
    </NextIntlClientProviderINTL>
  );
};

export default NextIntlClientProviderS;
