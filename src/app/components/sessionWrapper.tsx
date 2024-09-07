// src/app/components/SessionWrapper.tsx
"use client"; // Garante que este componente é um Client Component

import { SessionProvider } from "next-auth/react";
import React from "react";

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
