"use client";

import * as React from "react";
import {NextUIProvider} from "@nextui-org/system";
import {useRouter} from "next/navigation";
import {Session} from "next-auth";
import {SessionProvider} from "next-auth/react";

export interface ProvidersProps {
  children: React.ReactNode;
  session: Session|null,
}

export function Providers({children, session}: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    </NextUIProvider>
  );
}
