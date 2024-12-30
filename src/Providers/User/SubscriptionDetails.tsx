import { Button } from "@/components/ui/button";
import React from "react";

interface SubscriptionProps {
  subscription: {
    status: string;
    current_period_start: number;
    current_period_end: number;
    plan: {
      amount: number;
      currency: string;
      interval: string;
    };
    quantity: number;
    id: string;
  };
}

const SubscriptionDetails: React.FC<SubscriptionProps> = ({ subscription }) => {
  const {
    status,
    current_period_start,
    current_period_end,
    plan,
    quantity,
    id,
  } = subscription;

  // Format dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format price
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  return (
    <div className="mx-auto bg-white  dark:bg-gray-800">
      <h1 className="text-xl font-bold  text-gray-900 dark:text-white">
        Subscription Details
      </h1>
      {/* <p className="text-sm  text-gray-500 dark:text-gray-400 mb-6">
        Manage your subscription easily.
      </p> */}
      <div className="space-y-4">
        {/* Subscription ID */}
        {/* <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Subscription ID
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {id}
          </span>
        </div> */}
        {/* Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Status
          </span>
          <span
            className={`text-sm font-medium ${
              status === "active"
                ? "text-green-600"
                : "text-red-600"
            } dark:${
              status === "active"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        {/* Current Period */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Current Period
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDate(current_period_start)} - {formatDate(current_period_end)}
          </span>
        </div>
        {/* Plan Details */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Plan
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatPrice(plan.amount, plan.currency)} / {plan.interval}
          </span>
        </div>
        {/* Quantity */}
        {/* <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Quantity:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {quantity}
          </span>
        </div> */}
      </div>
      {/* <div className="mt-6">
        <Button>
          Manage Subscription
       </Button>
      </div> */}
    </div>
  );
};

export default SubscriptionDetails;
