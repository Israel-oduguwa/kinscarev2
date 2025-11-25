import Link from "next/link";
import CaregiverNavbarRight from "./CaregiverNavbarRight";

function CaregiverNavbar() {
  return (
    <header>
      <nav >
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
        <Link className="flex items-center mr-2" href="/">
            <img
              className="h-6 pr-1 sm:h-9"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="logo"
            />
            <p className="text-sm font-medium">Kinscare</p>
          </Link>
          <div className="flex items-center lg:order-2">
            <CaregiverNavbarRight/>
          </div>
          <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
            {/* <NavbarLink /> */}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default CaregiverNavbar;
