"use client";

import React from "react";

export default function SubscribePage() {
  const handleSubscribe = () => {
    // Replace this with your actual CCBill link once account is active
    window.location.href = "https://bill.ccbill.com/jpost/signup.cgi?clientAccnum=0000000&clientSubacc=0000&formName=subscribe";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">✨ OnlyAi Creator Access</h1>
      <p className="text-gray-700 max-w-md mb-8">
        Subscribe to unlock exclusive AI creator content. 
        Your payment is securely processed through <strong>CCBill</strong>.
      </p>
      <button
        onClick={handleSubscribe}
        className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all"
      >
        Subscribe via CCBill 💳
      </button>
      <p className="text-sm text-gray-500 mt-6">
        Already subscribed? <a href="/auth/login" className="text-pink-600 underline">Sign in</a>
      </p>
    </div>
  );
}
