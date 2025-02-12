"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { Fragment, type ReactNode, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  children: ReactNode;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    adsbygoogle?: any | any[];
  }
}

const GoogleAdUnit = ({ children }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, [pathname, searchParams]);
  return <Fragment>{children}</Fragment>;
};

export default GoogleAdUnit;
