"use client";
import React from "react";
import FeedbackForm from "./FeedbackForm";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 sm:px-12 py-16">
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Title Section */}
      <div className="">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Contact Us
        </h2>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Got questions or feedback? We'd love to hear from you. Reach out to us using the form or email below.
        </p>
      </div>
  
      {/* Email Card
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-8 rounded-lg shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Us</h3>
          <p className="text-sm mt-1">support@example.com</p>
        </div>
       
      </div> */}
  
      {/* Contact Form */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {/* <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Send Us a Message
        </h3> */}
        <FeedbackForm />
      </div>
    </div>
  </div>
  
  );
};

export default ContactUs;
