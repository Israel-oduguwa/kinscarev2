import React from "react";
import Link from "next/link";
import ProviderNavbarRight from "./ProviderNavbarRight";
import Image from "next/image";

function ProviderNavbar() {
  return (
    <header>
      <nav className="bg-white/60 z-50 backdrop-blur-md fixed top-0 w-full border-b border-gray-100 px-4 lg:px-6 py-3 transition-all duration-300 dark:bg-gray-800/60">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link className="flex items-center mr-2" href="/">
            <Image
              className="h-6 pr-1 sm:h-9"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="logo"
              width={40}
              height={40}
            />
            <p className="text-sm font-medium">Kinscare</p>
          </Link>
          <div className="flex items-center lg:order-2">
            <ProviderNavbarRight />
          </div>
          <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
            {/* <NavbarLink /> */}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default ProviderNavbar;
