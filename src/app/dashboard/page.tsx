"use client";

import React, { useCallback, useEffect } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";

export default function Home() {
  const router = useRouter();

  const [menuOpen, isMenuOpen] = React.useState(false);

  const open = React.useCallback(() => {
    isMenuOpen(!menuOpen);
  }, [menuOpen]);

  return (
    <main className=" dark:bg-white bg-white">
      <div className="min-h-screen">
        <SideBar opens={menuOpen} closeds={open} />
        <NavBar items={{ label: "Dashboard", link: "#" }} opens={open} />
      </div>
    </main>
  );
}
