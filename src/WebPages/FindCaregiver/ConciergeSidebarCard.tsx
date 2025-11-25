"use client";
import React from "react";
import { Sparkles, Check, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const ConciergeSidebarCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="w-full max-w-md mx-auto mb-8  sticky top-20
      bg-gradient-to-br from-white via-blue-50 to-sky-50
      rounded-2xl shadow-xl border border-sky-100/60 px-7 py-8
      flex flex-col items-center gap-4  overflow-hidden
      transition-all duration-300 backdrop-blur-sm
      before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.05)_0%,rgba(14,165,233,0)_70%)]"
  >
    {/* Decorative Elements */}
    <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-blue-400/10 blur-xl"></div>
    <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-sky-400/10 blur-xl"></div>
    
    {/* Header */}
    <div className="flex items-center gap-3  z-10">
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="p-2 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full shadow-lg"
      >
        <Sparkles className="h-4 w-4 text-white" />
      </motion.div>
      <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600 tracking-tight">
        Jumpstart Hiring
      </span>
    </div>
    
    {/* Description */}
    <div className="text-center text-gray-700 mb-3 text-base font-medium z-10">
      <p className="mb-2">Want to save time hiring?</p>
      <p className="leading-relaxed ">
        <span className="font-semibold text-blue-600">KinsCare agents</span> will search, 
        screen, and schedule interviews with <span className="font-semibold text-sky-600">3 caregivers for you in 3 days</span>—guaranteed.
      </p>
    </div>
    
    {/* Benefits */}
    <ul className="text-gray-700 text-sm mb-4 flex flex-col gap-2 w-full z-10">
      {[
        "Handpicked matches—no stress",
        "Interviews arranged for you",
        "2 weeks full platform access"
      ].map((item, index) => (
        <li key={index} className="flex items-center gap-2">
          <div className="bg-blue-100/70 p-1 rounded-full">
            <Check className="h-4 w-4 text-blue-600" />
          </div>
          <span>{item}</span>
        </li>
      ))}
    </ul>
    
    {/* CTA Button */}
    <motion.div 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="w-full z-10"
    >
      <Link
        href="/jumpstart-hiring/apply"
        className="group inline-block w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-lg px-4 py-3.5 text-white font-bold text-base text-center transition-all duration-300 relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-yellow-200 group-hover:animate-pulse" />
          <span>Get Started — $175</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
    </motion.div>
    
    {/* Footer */}
    <div className="mt-2 text-xs text-gray-500 text-center z-10">
      <span>No commitment · Quick turnaround · Satisfaction guaranteed</span>
    </div>
  </motion.div>
);

export default ConciergeSidebarCard;