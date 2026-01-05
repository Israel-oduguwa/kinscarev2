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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Subscription
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            Current details
          </h3>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Plan
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {formatPrice(plan.amount, plan.currency)}{" "}
            <span className="text-sm font-medium text-slate-500">
              / {plan.interval}
            </span>
          </p>
        </div>
        {/* <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Current period
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {formatDate(current_period_start)}
          </p>
          <p className="text-sm text-slate-500">
            Renews on {formatDate(current_period_end)}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
