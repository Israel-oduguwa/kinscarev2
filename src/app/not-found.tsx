import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-100/70 to-transparent blur-3xl" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 py-20 text-center">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
          <MapPin className="h-4 w-4 text-indigo-500" />
          Page not found
        </div>

        <div className="flex flex-col items-center gap-4">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
            alt="KinsCare"
            width={72}
            height={72}
            className="h-16 w-16"
            priority
          />
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            The link might be outdated or the page may have moved. Use the options below
            to get back on track.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="shadow-sm">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/agent">Agent dashboard</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/jumpstart-hiring/apply">
              <ArrowLeft className="h-4 w-4" />
              Back to hiring flow
            </Link>
          </Button>
        </div>

        <div className="mt-6 text-sm text-slate-500">
          Need help?{" "}
          <a
            href="mailto:support@kinscare.org"
            className="font-semibold text-indigo-600 underline underline-offset-4"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
