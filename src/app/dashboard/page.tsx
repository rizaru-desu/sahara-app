"use client";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import React, { useEffect } from "react";
import _ from "lodash";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [menuOpen, isMenuOpen] = React.useState(false);

  return (
    <main className=" dark:bg-white bg-white">
      <div className="min-h-screen">
        <SideBar
          opens={menuOpen}
          closeds={() => {
            isMenuOpen(false);
          }}
        />
        <NavBar
          items={{ label: "Dashboard", link: "#" }}
          opens={() => {
            isMenuOpen(!menuOpen);
          }}
        />
      </div>
    </main>
  );
}
