"use client"

import React from "react";

export default function ContactSupport({ 
  className = "",
  whatsapp = "",
  linkedin = "",
  facebook = ""
}: { className?: string; whatsapp?: string; linkedin?: string; facebook?: string }) {
  return (
    <div className={`mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-8 border border-blue-200 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">📧 Contact & Support</h3>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
          For any queries, suggestions, or feedback about this IPL Analytics Dashboard
        </p>
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Email us at:</p>
              <a 
                href="mailto:munnakumar6204835946@gmail.com" 
                className="break-all text-sm sm:text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                munnakumar6204835946@gmail.com
              </a>
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">We'll get back to you within 24 hours</p>

        {(whatsapp || linkedin || facebook) && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600">
                <span>WhatsApp</span>
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-800">
                <span>LinkedIn</span>
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                <span>Facebook</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


