"use client"
import MongoContext from "@/app/MongoContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useContext, useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || "");

function FreeTrialPayment({onClose}:any) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const mongo:any = useContext(MongoContext)
    const {userData, user} = mongo;
    useEffect(() => {
       const client_secret = typeof window !== "undefined" ? localStorage.getItem("client_secret") : null
        setClientSecret(client_secret)
    }, [clientSecret])
    
    const appearance:any = {
        theme: 'flat',
      };
  return (
    <div className="">
     <div>
          <p className="text-gray-600 mb-4">
            Get started with your 14-day free trial by adding your payment
            details. You won’t be charged until your trial ends.
          </p>
        </div>
        <div>
      <h1 className="font-bold antialiased tracking-tight mb-4">Enter you card details</h1>
      {clientSecret && userData ? (
        <Elements  stripe={stripePromise} options={{ clientSecret, appearance }}>
          <PaymentForm
              close={onClose}
              clientSecret={clientSecret}
              userID={userData.userID}
              customerId={user?.customData?.customer_id}
              priceId="price_1QP2OuAoahxG9SLGNoc37Lxo"
              intentType="setup"
              onSuccess={(result) => {
                // console.log("Card saved successfully:", result);
                alert("Card saved!");
              } }
              onError={(error) => {
                console.error("Error saving card:", error);
              } } setIsTrialExpired={undefined}          />
        </Elements>
      ) : (
        <p>Loading...</p>
      )}
    </div>
      
    </div>
  );
}

export default FreeTrialPayment;
