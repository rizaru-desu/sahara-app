"use client";

import React, { useEffect } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";

export default function Home() {
  const router = useRouter();

  const [menuOpen, isMenuOpen] = React.useState(false);

  return (
    <main className=" dark:bg-white bg-white">
      <div className="min-h-screen">
        <SideBar
          opens={menuOpen}
          closeds={() => {
            console.log("close");
            isMenuOpen(false);
          }}
        />
        <NavBar
          items={{ label: "Dashboard", link: "#" }}
          opens={() => {
            console.log("open");
            isMenuOpen(!menuOpen);
          }}
        />
      </div>
    </main>
  );
}
