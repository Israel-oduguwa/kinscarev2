"use client"; // Enable client-side rendering in Next.js 15
import React, { useEffect, useState } from "react";

const TextAnimation: React.FC = () => {
  const texts = [
    "I want to be a Licensed Practical Nurse (LPN).",
    "I want to be a Registered Nurse (RN/BSN).",
    "I want to be an Advanced Practice Registered Nurse (MSN, DNP, ARNP).",
    "I want to be a Pharmacist.",
    "I want to be a Physician Assistant.",
    "I want to be a Surgery Technician.",
    "I want to be a Sonographer.",
    "I want to be a Radiology Technologist.",
    "I want to be a Respiratory Therapist.",
    "I want to be an Occupational Therapist.",
    "I want to be a Physical Therapist.",
    "I want to be a Pharmacy Technician Assistant.",
    "I want to be a Physical Therapist Assistant.",
    "I want to be a Medical Assistant."
];
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const typingSpeed = 90; // Speed of typing in ms
  const delayBetweenTexts = 6000; // Wait before switching to next text

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (charIndex < texts[textIndex].length) {
        timeout = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, delayBetweenTexts);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, typingSpeed);
      } else {
        setIsTyping(true);
        setTextIndex((prev) => (prev + 1) % texts.length); // Move to next text
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isTyping, textIndex, texts]);

  return (
    <div className="text-xl md:text-3xl font-semibold tracking-tight text-gray-800 mt-8 text-center">
      <span>{texts[textIndex].substring(0, charIndex)}</span>
      <span className="text-indigo-400 animate-blink">|</span>
    </div>
  );
};

export default TextAnimation;
