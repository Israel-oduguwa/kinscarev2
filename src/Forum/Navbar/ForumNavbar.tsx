import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import NavbarActions from "./NavbarActions";
// this is the navbar for normal pages

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          <Menu />
        </div>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ForumNavbar() {
  return (
    <header>
      <nav className="bg-white/60 z-50 backdrop-blur-md fixed top-0 w-full border-b border-gray-100 px-4 lg:px-6 py-3 transition-all duration-300 dark:bg-gray-800/60">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link className="flex items-center mr-2" href="/">
            <img
              className="h-6 pr-1 sm:h-9"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="logo"
            />
            <p className="text-sm font-medium">Kinscare</p>
          </Link>
          <div className="flex items-center lg:order-2">
            <NavbarActions/>
            <div className="lg:hidden flex items-center">
              <SheetDemo />
            </div>
          </div>
          <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
            {/* <NavbarLink /> */}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default ForumNavbar;
