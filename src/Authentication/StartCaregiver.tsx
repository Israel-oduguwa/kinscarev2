"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  HeartPulse,
  Inbox,
  LocateFixed,
  Phone,
  ShieldCheck,
  Users2,
  Calendar, 
  MapPin,
  DollarSign,
  ChevronDown,
  Workflow,
} from "lucide-react";

function StartCaregiver() {
  // Smooth scroll handler
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // High-quality Unsplash hero photo (nurse assisting senior)
  // License: Unsplash photos are free to use, no attribution required (but alt text is added for a11y)
  const HERO_IMG =
    "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1920&auto=format&fit=crop";

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900"
        aria-labelledby="hero-heading"
      >
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-[url('https://firebasestorage.googleapis.com/v0/b/career-awesome-ac470.appspot.com/o/RED%20hue%20fing%20caregvers.svg?alt=media&token=83121d84-9a7e-46b2-ad0d-b76ff20e84e5')] bg-cover bg-center mix-blend-soft-light" />
        {/* Global gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-36">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left column: copy + CTAs */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center bg-indigo-800/30 backdrop-blur-sm rounded-full px-4 py-1 mb-5 border border-indigo-500/30">
                <BadgeCheck className="w-5 h-5 text-indigo-300 mr-2" />
                <span className="text-sm font-medium text-indigo-200">
                  Trusted by 15,000+ caregivers
                </span>
              </div>

              <h1
                id="hero-heading"
                className="text-4xl leading-tight md:text-6xl font-bold text-white tracking-tight"
              >
                Find{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  caregiver jobs
                </span>{" "}
                that Work for You
              </h1>
              <p className="mt-5 max-w-2xl text-gray-200 text-base md:text-lg">
                Hospitals, clinics, nursing homes, and home care agencies are
                hiring near you. Browse roles, apply fast, and get hired.
              </p>

              {/* Quick value bullets */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-gray-100 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-3">
                  <HeartPulse className="w-5 h-5 text-amber-400" />
                  CNA, HCA, NAR, Companion
                </div>
                <div className="flex items-center gap-2 text-gray-100 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-3">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  Hospitals • Clinics • Homes
                </div>
                <div className="flex items-center gap-2 text-gray-100 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Full-time • Part-time • Live-in
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/find-jobs"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3.5 text-base font-semibold shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 duration-300"
                  aria-label="Browse caregiver jobs"
                >
                  Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 text-base font-semibold backdrop-blur transition border border-white/20 transform hover:-translate-y-0.5 duration-300"
                  aria-label="See how Kinscare helps caregivers"
                  type="button"
                >
                  How it works
                </button>
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex flex-wrap items-center gap-4 text-gray-200 text-xs md:text-sm">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  Secure & privacy-first
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Users2 className="w-4 h-4 text-indigo-300" />
                  1:1 employer messages
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Bell className="w-4 h-4 text-indigo-300" />
                  Instant job alerts
                </div>
              </div>
            </div>

            {/* Right column: hero image card */}
            <div className="relative">
              <div className="relative mx-auto w-full max-w-[560px] aspect-[4/3] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                {/* Decorative gradient edge */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/10" />
                <Image
                  src={HERO_IMG}
                  alt="Nurse helping an elderly woman in a healthcare setting"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 560px"
                  className="object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="hidden md:flex items-center gap-2 absolute -bottom-6 left-8 rounded-2xl bg-white/90 backdrop-blur p-3 pr-4 shadow-xl ring-1 ring-black/5">
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-800">
                  Verified employers only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-indigo-900 to-transparent z-20"></div>
      </section>

      {/* How it works (scroll target) */}
      <section
        id="how-it-works"
        className="py-16 md:py-20 bg-gradient-to-b from-indigo-50 to-white"
        aria-labelledby="how-heading"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center text-indigo-700 bg-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <BadgeCheck className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">How it works</span>
            </div>
            <h2
              id="how-heading"
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
            >
              Land a job in three simple steps
            </h2>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
              Create your profile, get matched, and chat directly with employers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Create Profile</h3>
              <p className="mt-2 text-sm text-gray-600">
                Add your licenses, experience, and availability to get relevant matches.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">
              <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Get Matches</h3>
              <p className="mt-2 text-sm text-gray-600">
                We surface roles that fit your preferences with clear pay & schedules.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-200">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Chat & Get Hired</h3>
              <p className="mt-2 text-sm text-gray-600">
                Message employers directly, schedule interviews, and accept offers.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/find-jobs"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 text-base font-semibold shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 duration-300"
            >
              Start Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center text-indigo-700 bg-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <BadgeCheck className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Featured Opportunities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Latest Caregiver Jobs Near You
            </h2>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
              Hand-picked opportunities with competitive pay and flexible schedules
            </p>
          </div>

        

          <div className="mt-2 text-center">
            <Link
              href="/find-jobs"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 text-base font-semibold shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 duration-300"
            >
              View All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="find-caregiver-jobs" className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center text-indigo-700 bg-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <HeartPulse className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">For Caregivers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Why Choose Kinscare?
            </h2>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
              Designed specifically to empower healthcare professionals
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit Card 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Receive Job Offers</h3>
              <p className="mt-3 text-gray-600">
                Get matched with opportunities that fit your qualifications and preferences
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <ul className="space-y-3">
                  {/* <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Personalized job recommendations</span>
                  </li> */}
                  <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Get offers from top employers in hospitals, assisted living homes, and private residences.</span>
                  </li>
                  <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Access to new listings in your area</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Direct Communication</h3>
              <p className="mt-3 text-gray-600">
                Connect directly with hiring managers without intermediaries
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Easily communicate with hiring managers and caregivers who match your profile.</span>
                  </li>
                  <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Schedule interviews directly</span>
                  </li>
                  {/* <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Real-time notifications</span>
                  </li> */}
                </ul>
              </div>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-100 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <LocateFixed className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">Smart Job Search</h3>
              <p className="mt-3 text-gray-600">
                Find the perfect role with powerful filtering and location tools
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Browse thousands of jobs in different industries and apply instantly.</span>
                  </li>
                  {/* <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">Commute time calculator</span>
                  </li> */}
                  <li className="flex items-start">
                    <BadgeCheck className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">One-click applications</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-0.5 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-8 md:mb-0">
                  <h3 className="text-2xl font-bold text-gray-900">Ready to find your perfect role?</h3>
                  <p className="text-gray-600 mt-2">
                    Join thousands of caregivers who found their ideal job through Kinscare
                  </p>
                </div>
                <div className="md:w-1/3 flex justify-center md:justify-end">
                  <Link
                    href="/find-jobs"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 text-base font-semibold shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center text-indigo-700 bg-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <Users2 className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Caregivers Love Kinscare
            </h2>
            <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
              Hear from healthcare professionals who found their dream jobs
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Sarah Johnson</h4>
                  <p className="text-indigo-600">Certified Nursing Assistant</p>
                </div>
              </div>
              <div className="text-gray-600 italic">
                &quot;Kinscare helped me find a position that perfectly matched my skills and schedule. The application process was so simple, and I heard back from employers within hours!&quot;
              </div>
              <div className="flex mt-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Michael Rodriguez</h4>
                  <p className="text-indigo-600">Home Health Aide</p>
                </div>
              </div>
              <div className="text-gray-600 italic">
                &quot;After months of searching through traditional job sites, I found my ideal position on Kinscare in just two days. The direct communication with employers made all the difference.&quot;
              </div>
              <div className="flex mt-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center text-indigo-700 bg-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <ShieldCheck className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">Help Center</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 mt-3">
              Everything you need to know about finding caregiver jobs with Kinscare
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <details className="group rounded-2xl border border-gray-200 bg-white p-6 open:shadow-lg open:border-indigo-100 transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  Do all caregiver jobs require a license?
                </span>
                <span className="ml-4 transition group-open:rotate-180">
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </span>
              </summary>
              <p className="mt-3 text-gray-600">
              Not all jobs require a license. Some employers offer in-house training and support for licensing.
              </p>
            </details>

            <details className="group rounded-2xl border border-gray-200 bg-white p-6 open:shadow-lg open:border-indigo-100 transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  Does CNA work meet clinical requirements?
                </span>
                <span className="ml-4 transition group-open:rotate-180">
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </span>
              </summary>
              <p className="mt-3 text-gray-600">
                Yes, working as a CNA in hospitals or nursing homes can fulfill clinical work experience requirements.
              </p>
            </details>

            <details className="group rounded-2xl border border-gray-200 bg-white p-6 open:shadow-lg open:border-indigo-100 transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  How quickly can I expect to hear back after applying?
                </span>
                <span className="ml-4 transition group-open:rotate-180">
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </span>
              </summary>
              <p className="mt-3 text-gray-600">
                Most employers respond within 24-48 hours for urgent positions.
                Our data shows 78% of qualified applicants receive initial contact
                within 72 hours. Setting up job alerts ensures you never miss
                an opportunity.
              </p>
            </details>

            <details className="group rounded-2xl border border-gray-200 bg-white p-6 open:shadow-lg open:border-indigo-100 transition-all">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  Are there part-time or flexible schedule options?
                </span>
                <span className="ml-4 transition group-open:rotate-180">
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </span>
              </summary>
              <p className="mt-3 text-gray-600">
                Absolutely. We specialize in connecting caregivers with roles that
                fit their lifestyle. Over 40% of our listings offer flexible
                scheduling, including part-time, per diem, weekend-only, and
                evening shifts.
              </p>
            </details>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/find-jobs"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 text-base font-semibold shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 duration-300"
            >
              Start Your Job Search <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StartCaregiver;
