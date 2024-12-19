import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-gray-300 pt-32 pb-8 dark:border-gray-800">
      <div>
        <div className="m-auto space-y-8 px-4 text-gray-600 dark:text-gray-400 sm:px-12 xl:max-w-6xl xl:px-0">
          <div className="grid grid-cols-8 gap-6 md:gap-0">
            <div className="col-span-8 md:col-span-2 lg:col-span-4">
              <div className="flex h-full items-center justify-between gap-6 border-b border-white py-6 dark:border-gray-800 md:flex-col md:items-start md:justify-between md:space-y-6 md:border-none md:py-0">
                <div>
                  <Link
                    href="/"
                    aria-label="Kinscare logo"
                    className="flex items-center"
                  >
                    <img
                      className="h-10 pr-1 py-1 sm:h-14"
                      src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                      alt="logo"
                    />{" "}
                    <p className="text-s text-gray-900 font-medium">Kinscare</p>
                  </Link>
                  <Link
                    href="https://tailus.io"
                    className="mt-2 inline-block text-sm max-w-sm antialiased text-gray-800"
                  >
                    Our goal is to match caregivers and providers as efficiently
                    as possible.
                  </Link>
                </div>
                <div className="flex gap-6">
                  <Link
                    href="#"
                    target="_blank"
                    aria-label="github"
                    className="hover:text-primary dark:hover:text-primaryLight"
                  >
                    <span className="sr-only">Github</span>
                    <img
                      src="https://via.placeholder.com/20" // Replace with your GitHub icon
                      alt="GitHub"
                      className="h-6"
                    />
                  </Link>
                  <Link
                    href="#"
                    target="_blank"
                    aria-label="twitter"
                    className="hover:text-primary dark:hover:text-primaryLight"
                  >
                    <span className="sr-only">Twitter</span>
                    <img
                      src="https://via.placeholder.com/20" // Replace with your Twitter icon
                      alt="Twitter"
                      className="h-6"
                    />
                  </Link>
                  <Link
                    href="#"
                    target="_blank"
                    aria-label="medium"
                    className="hover:text-primary dark:hover:text-primaryLight"
                  >
                    <span className="sr-only">Medium</span>
                    <img
                      src="https://via.placeholder.com/20" // Replace with your Medium icon
                      alt="Medium"
                      className="h-6"
                    />
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-span-8 md:col-span-6 lg:col-span-4">
              <div className="grid grid-cols-2 gap-6 pb-16 sm:grid-cols-2 md:pl-16">
                <div>
                  <h2 className="text-base font-medium text-gray-800 dark:text-gray-200">
                    Company
                  </h2>
                  <ul className="mt-4 list-inside space-y-4">
                    <li>
                      <Link
                        href="/"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        About us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/how-to-use-kinscare"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        How to use Kinscare
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faqp"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        FAQs
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800 dark:text-gray-200">
                    Resources
                  </h2>
                  <ul className="mt-4 list-inside space-y-4">
                    <li>
                      <Link
                        href="#"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Plans and Pricing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/registry"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Recruit caregiver
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Find jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Job Alerts
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/start"
                        className="text-sm duration-100 hover:text-primary dark:hover:text-white"
                      >
                        Start
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-between text-sm md:pl-16">
                <span>
                  © Kinscare {new Date().getFullYear()}{" "}
                  <span>All rights reserved</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
