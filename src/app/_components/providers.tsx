"use client";

import { useRouter } from "@/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { type FC } from "react";

const Providers: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();

  return <NextUIProvider navigate={router.push}>{children}</NextUIProvider>;
};

export default Providers;
