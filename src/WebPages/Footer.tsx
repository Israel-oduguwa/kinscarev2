import Link from "next/link";
import Image from "next/image";
const Footer = () => {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <Link
              href="/"
              aria-label="Kinscare logo"
              className="flex items-center"
            >
              <Image
                className="h-14 w-auto"
                width={120}
                height={56}
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="Kinscare Logo"
              />
            </Link>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs">
              We’ll match you with top caregivers personally found for you, fast
              and guaranteed
            </p>
          </div>

          {/* Navigation */}
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Resources */}
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-3 tracking-wide">
                Links
              </h3>
              <ul className="space-y-2">
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
                    Recruit Caregiver
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jumpstart-hiring"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                  >
                    We’ll Find Caregivers for You
                  </Link>
                </li>
                <li>
                  <Link
                    href="/find-jobs"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                  >
                    Find Jobs
                  </Link>
                </li>
              </ul>
            </div>
            {/* FAQs */}
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-3 tracking-wide">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/community"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refer-and-earn"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition"
                  >
                    Refer & Earn with Kinscare
                  </Link>
                </li>
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
                    FAQ Explorer
                  </Link>
                </li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-3 tracking-wide">
                Company
              </h3>
              <ul className="space-y-2">
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
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Get in Touch
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Have questions? Reach out to us and we&apos;ll get back to you
              shortly.
            </p>
            <Link
              href="/contact"
              className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
            >
              Contact Us
            </Link>
            <div className="flex items-center gap-3 ">
              <Link
                href="https://www.facebook.com/kinscareandhealth/"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
              >
                <Image
                  src="https://tse2.mm.bing.net/th/id/OIP.KJQX2RdJJiFZfl9IeaAKoQHaHa?r=0&pid=Api"
                  width={40}
                  height={40}
                  alt="Facebook"
                  className="hover:scale-110 transition-transform duration-200"
                />
              </Link>
              {/* <Link
                href="https://twitter.com/"
                target="_blank"
                rel="noopener"
                aria-label="Twitter/X"
              >
                <Image
                  src="/icons/twitter.png"
                  width={28}
                  height={28}
                  alt="Twitter"
                  className="hover:scale-110 transition-transform duration-200"
                />
              </Link>
              <Link
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
              >
                <Image
                  src="/icons/linkedin.png"
                  width={28}
                  height={28}
                  alt="LinkedIn"
                  className="hover:scale-110 transition-transform duration-200"
                />
              </Link> */}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[hsl(var(--border))] my-6" />

        {/* Lower Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          <p>
            © Kinscare {new Date().getFullYear()} &middot; All rights reserved.
          </p>
          <p className="mt-8 text-xs text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            At KinsCare we connect caregivers and providers. While we do not
            employ caregivers or independently verify every profile or posting,
            we encourage all users to carefully review and select the right fit
            for their needs.
            <span className="block mt-1 font-medium">
              For extra peace of mind, try our&nbsp;
              <Link
                href="/jumpstart-hiring"
                className="underline text-primary hover:text-[hsl(var(--primary-dark))] transition"
              >
                Jumpstart Hiring service
              </Link>
              &nbsp;to get matched personally with qualified caregivers by a
              dedicated KinsCare agent.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
