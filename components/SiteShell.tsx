"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Cursor from "./Cursor";
import ProgressBar from "./ProgressBar";
import Nav from "./Nav";
import SideLabel from "./SideLabel";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("no-cursor");
    } else {
      document.body.classList.remove("no-cursor");
    }
  }, [isAdmin]);

  return (
    <>
      {!isAdmin && <Cursor />}
      {!isAdmin && <ProgressBar />}
      {!isAdmin && <Nav />}
      {!isAdmin && <SideLabel />}
      {children}
    </>
  );
}
