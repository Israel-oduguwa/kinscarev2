import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      {/* Upper Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Section */}
        <div className="flex flex-col items-start space-y-4">
          <Link href="/" aria-label="Kinscare logo" className="flex items-center">
            <img
              className="h-12 sm:h-14"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="logo"
            />
          </Link>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Our goal is to match caregivers and providers as efficiently as possible.
          </p>
        </div>
  
        {/* Links Section */}
        <div className="grid grid-cols-3 gap-8">
          {/* Company Column */}
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Company
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
  
          {/* Resources Column */}
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Resources
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  Plans and Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/find-caregivers"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  Recruit caregiver
                </Link>
              </li>
              <li>
                <Link
                  href="/find-jobs"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  Find jobs
                </Link>
              </li>
             
            </ul>
          </div>
  
          {/* FAQs Column */}
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              FAQs
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/faqp"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  FAQ Providers
                </Link>
              </li>
              <li>
                <Link
                  href="/faqc"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                  FAQ Caregivers
                </Link>
              </li>
              <li>
                <Link
                  href="/faqe"
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                >
                FAQ  Explorer 
                </Link>
              </li>
            </ul>
          </div>
        </div>
  
        {/* Contact Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
            Get in Touch
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Have questions? Reach out to us and we'll get back to you shortly.
          </p>
          <Link
            href="/contact"
            className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Contact Us
          </Link>
        </div>
      </div>
  
      {/* Divider */}
      <div className="border-t border-[hsl(var(--border))] my-8"></div>
  
      {/* Lower Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          © Kinscare {new Date().getFullYear()} All rights reserved.
        </p>
        <ul className="flex space-x-4">
          <li>
            <Link
              href="#"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
            >
              Facebook
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
            >
              Twitter
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
            >
              LinkedIn
            </Link>
          </li>
        </ul>
      </div>
    </div>
  </footer>
  
  );
};

export default Footer;
