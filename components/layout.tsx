import React, { ReactNode } from "react";
import NavDrawer from "./navDrawer";
import { NavContextProvider } from "../context/navContext";
import NavToggle from "./navToggle";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="relative text-white bg-black">
      <NavContextProvider>
        <div className="absolute top-0 right-0 z-10 w-24 h-full bg-white opacity-50"></div>
        <NavDrawer />
        <NavToggle classList="absolute top-0 right-0 m-2 z-30" />
        {children}
      </NavContextProvider>
    </main>
  );
}
