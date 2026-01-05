"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import {
  convertISODateToNormal,
  getChatAccess
} from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Crown,
  Loader2,
  RefreshCw,
  ShieldAlert,
  User,
  XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import VerifyAccount from "../Candidates/VerifyAccount";
import PricingPlan from "./PricingPlan";
import SubscriptionDetails from "./SubscriptionDetails";
import { toast } from "@/components/ui/use-toast";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY ?? "");

function AccountSettings() {
  const authData: any = useAuthContext();
  const { contactData, userData } = authData;
  // Inside your component (UpdateProfile)
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false); // Add for verification dialog

  // State to track free trial modal visibility and client secret
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const {privateApi} = useApiClient()
  const [clientSecret, setClientSecret] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("client_secret") : null
  );
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [billingHistoryOpen, setBillingHistoryOpen] = useState(false);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [paymentActionLoading, setPaymentActionLoading] = useState<string | null>(
    null
  );
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  // console.log(userData?.availability);
  const verifyPaymentMethod = () => {
    setOpenModal(true);
    setIsVerificationDialogOpen(false);
  };
  useEffect(() => {
   if(contactData){
     fetchSubscriptionData();
   }
  }, [contactData]);

  const { trialActive, subscriptionActive } = getChatAccess(contactData);
  const trialBadgeLabel =
    contactData?.trial_status === "active" ? "Trial Active" : "Trial Active";

  const handleStartTrial = async () => {
    setIsDialogOpen(true);
  };

  const fetchSubscriptionData = async () => {
    try {
      if (!contactData?.customer_id) return;

      const getSubData = await privateApi.get(
        `/api/v1/providers/subscription/${contactData.customer_id}`
      );
      setSubscriptionData(getSubData.data.subscription);
    } catch (error) {
      console.log(error);
    }
  };

  const closePricingDialog = () => {
    setIsDialogOpen(false);
  };

  const refreshSubscriptionData = async () => {
    setLoading(true);
    await fetchSubscriptionData();
    setLoading(false);
  };

  const customerId = contactData?.customer_id;
  const subscriptionId = subscriptionData?.id;

  const formatMoney = (amount?: number, currency?: string) => {
    if (amount === undefined || !currency) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  const fetchBillingHistory = async () => {
    if (!customerId) return;
    setBillingHistoryLoading(true);
    try {
      const { data } = await privateApi.get(
        `/api/v1/providers/billing-history/${customerId}`
      );
      const invoices = data?.invoices || data?.data || data || [];
      setBillingHistory(Array.isArray(invoices) ? invoices : []);
    } catch (error: any) {
      toast({
        title: "Unable to load invoices",
        description: error?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBillingHistoryLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!customerId) return;
    setPaymentMethodsLoading(true);
    try {
      const response = await privateApi.post(
        "/api/v1/providers/payment-methods",
        { customerId }
      );
      const cards = response.data?.data || [];
      setPaymentMethods(cards);
    } catch (error: any) {
      toast({
        title: "Unable to load payment methods",
        description: error?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const handleCreateSetupIntent = async () => {
    if (!customerId) return;
    setIsSavingCard(true);
    try {
      const { data } = await privateApi.post(
        "/api/v1/providers/create-setup-intent",
        { customerId }
      );
      setSetupIntentSecret(data?.clientSecret || null);
      setShowAddCardForm(true);
    } catch (error: any) {
      toast({
        title: "Unable to start setup",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCard(false);
    }
  };

  const setDefaultCard = async (paymentMethodId: string) => {
    if (!customerId) return;
    setPaymentActionLoading(paymentMethodId);
    try {
      await privateApi.post("/api/v1/providers/payment-methods/default", {
        customerId,
        paymentMethodId,
        subscriptionId,
      });
      toast({
        title: "Default card updated",
        description: "This card will be used for billing.",
      });
      await fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Unable to update card",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentActionLoading(null);
    }
  };

  const detachCard = async (paymentMethodId: string) => {
    setPaymentActionLoading(paymentMethodId);
    try {
      await privateApi.post("/api/v1/providers/payment-methods/detach", {
        paymentMethodId,
        customerId,
      });
      toast({
        title: "Card removed",
        description: "The payment method has been detached.",
      });
      await fetchPaymentMethods();
    } catch (error: any) {
       console.log(error)
      toast({
        title: "Unable to remove card",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentActionLoading(null);
    }
  };

  useEffect(() => {
    if (billingHistoryOpen) {
      fetchBillingHistory();
    }
  }, [billingHistoryOpen, customerId]);

  useEffect(() => {
    if (paymentMethodsOpen) {
      fetchPaymentMethods();
    }
  }, [paymentMethodsOpen, customerId]);

  const billingSummary = useMemo(() => {
    if (!billingHistory.length) return null;
    const latest = billingHistory[0];
    return {
      amount: formatMoney(latest?.amount_paid || latest?.amount_due, latest?.currency),
      status: latest?.status,
      date: latest?.created
        ? new Date(latest.created * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    };
  }, [billingHistory]);

  const formatEpochDate = (epoch?: number) => {
    if (!epoch) return "—";
    return new Date(epoch * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const normalizedPlan = `${contactData?.plan || ""}`.toLowerCase();
  const subscriptionStatus = `${subscriptionData?.status || ""}`.toLowerCase();
  const isSubscriptionLive =
    subscriptionActive ||
    ["active", "trialing", "complete", "paid", "authorized"].includes(
      subscriptionStatus
    );
  const canUpgradeToMonthly =
    isSubscriptionLive &&
    (normalizedPlan === "daily" ||
      normalizedPlan === "weekly" ||
      subscriptionData?.plan?.interval === "day" ||
      subscriptionData?.plan?.interval === "week");

  const nextBillingLabel = trialActive
    ? convertISODateToNormal(contactData?.trial_end_date)
    : subscriptionActive
    ? formatEpochDate(subscriptionData?.current_period_end)
    : "—";

  const currentPlanLabel = trialActive
    ? "Free Trial"
    : subscriptionActive
    ? "Premium Plan"
    : "No Active Plan";

  const isOnMonthlyPlan =
    normalizedPlan === "monthly" ||
    subscriptionData?.plan?.interval === "month";

  const planButtonLabel = trialActive
    ? "Upgrade Plan"
    : subscriptionActive
    ? isOnMonthlyPlan
      ? "Manage Plan"
      : "Upgrade Plan"
    : "View Plans";

  const handlePlanAction = () => {
    if (planButtonLabel === "Manage Plan") {
      setPaymentMethodsOpen(true);
      return;
    }

    handleStartTrial();
  };

  const handleUpgradeToMonthly = async () => {
    if (!subscriptionId) {
      toast({
        title: "Subscription unavailable",
        description: "We could not locate your current subscription.",
        variant: "destructive",
      });
      return;
    }

    setUpgradeLoading(true);
    try {
      await privateApi.post("/api/v1/providers/subscription/upgrade-plan", {
        subscriptionId,
        targetPriceId: "price_1SG0FJAoahxG9SLG2zl4tRUp",
      });
      toast({
        title: "Upgrade successful",
        description: "Your plan has been upgraded to Monthly.",
      });
      await refreshSubscriptionData();
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error?.message || "Unable to upgrade plan.",
        variant: "destructive",
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-50 to-slate-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-left mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Provider Account
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Account Settings
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Manage your profile, subscription, and account preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white/80 rounded-2xl shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] border border-slate-200/70 overflow-hidden backdrop-blur">
              <div className="p-6 border-b border-slate-200/70">
                <div className="flex items-center">
                  <div className="bg-linear-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center text-white">
                    {userData.profileImage ? (
                      <Image
                        alt="profile-image"
                        className="w-12 h-12 rounded-lg"
                        width={48}
                        height={48}
                        fetchPriority="high"
                        src={userData.profileImage}
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="font-semibold text-slate-900 truncate max-w-[150px]">
                      {userData?.name || contactData?.name}
                    </h2>
                    <p className="text-sm text-slate-500 truncate max-w-[150px]">
                      {contactData?.email}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {[
                  {
                    id: "account",
                    icon: <User className="w-5 h-5" />,
                    label: "Account",
                  },
                  {
                    id: "billing",
                    icon: <CreditCard className="w-5 h-5" />,
                    label: "Billing & Plans",
                  },
                  // {
                  //   id: "delete",
                  //   icon: <Trash2 className="w-5 h-5" />,
                  //   label: "Delete Account",
                  // },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-50 via-blue-100/70 to-transparent text-blue-700 font-medium shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white/80 rounded-2xl shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] border border-slate-200/70 backdrop-blur">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : activeTab === "account" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/80 rounded-2xl shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] border border-slate-200/70 backdrop-blur"
              >
                <div className="p-4 border-b border-slate-200/70">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Account Information
                  </h2>
                </div>

                <div className="p-6">
                  {!contactData?.verified && (
                    <div className="flex items-start p-4 mb-6 bg-amber-50 rounded-xl border border-amber-200">
                      <ShieldAlert
                        className="text-yellow-500 mt-1 mr-3 shrink-0"
                        size={20}
                      />
                      <div>
                        <h3 className="font-semibold text-amber-800">
                          Unverified Account
                        </h3>
                        <p className="text-amber-700 text-sm mt-1">
                          Please verify your account to access all features.
                        </p>
                      </div>
                      <Button
                        variant="link"
                        onClick={() => setIsVerificationDialogOpen(true)}
                      >
                        Click here to verify your account.
                      </Button>
                    </div>
                  )}
                  <Dialog
                    open={isVerificationDialogOpen}
                    onOpenChange={setIsVerificationDialogOpen}
                  >
                    <DialogContent
                      // closePosition="left"
                      className="mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <DialogTitle className="pt-4">
                        Get Verified & Connect To More Caregivers
                      </DialogTitle>
                      <DialogDescription className="">
                        You probably hate being solicited by scammers and so do
                        our caregivers. To prevent exploitation, we now require
                        all employers to complete a quick, FREE one-time
                        identity verification. This ensures trust, safety, and
                        shows caregivers your interest is genuine. Verify now to
                        help maintain a secure community!
                      </DialogDescription>
                      <Button
                        className="mt-4 bg-blue-500 hover:bg-blue-700"
                        onClick={verifyPaymentMethod}
                      >
                        Verify Now
                      </Button>
                    </DialogContent>
                  </Dialog>

                  {userData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-slate-200/70 rounded-2xl p-5 bg-white/80">
                        <h3 className="text-slate-500 text-sm font-medium mb-3">
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-500">Full Name</p>
                            <p className="font-medium text-slate-900">
                              {userData.fname} {userData.lname}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Email Address
                            </p>
                            <p className="font-medium text-slate-900">
                              {contactData?.email}
                            </p>
                            <div className="mt-1">
                              {contactData?.verified ? (
                                <span className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                  <XCircle className="w-3 h-3 mr-1" />{" "}
                                  Unverified
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Address</p>
                            <p className="font-medium text-slate-900">
                              {userData.address}, {userData.city},{" "}
                              {userData.zipcode}
                            </p>
                          </div>
                        </div>
                        <Link href="/provider/account/settings/profile">
                          <Button variant="outline" className="mt-6 w-full ">
                            Update Profile
                          </Button>
                        </Link>
                      </div>

                      <div className="border border-slate-200/70 rounded-2xl p-5 bg-white/80">
                        <h3 className="text-slate-500 text-sm font-medium mb-3">
                          Subscription Status
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-slate-500">
                                Current Plan
                              </p>
                              <p className="font-medium text-slate-900">
                                {trialActive
                                  ? "Free Trial"
                                  : subscriptionActive
                                  ? "Premium Plan"
                                  : "No Active Plan"}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {trialActive ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {trialBadgeLabel}
                                </span>
                              ) : subscriptionActive ? (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                                  Subscribed
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>

                          {trialActive ? (
                            <div>
                              <p className="text-xs text-slate-500">
                                Trial Period Ends
                              </p>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                                <p className="font-medium text-slate-900">
                                  {convertISODateToNormal(
                                    contactData?.trial_end_date
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : !trialActive && subscriptionActive && subscriptionData ? (
                            <div>
                              <p className="text-xs text-gray-500">
                                Subscription Details
                              </p>
                              <SubscriptionDetails
                                subscription={subscriptionData}
                              />
                            </div>
                          ) : (
                            <div className="pt-2">
                              <p className="text-slate-500 text-sm">
                                You don&apos;t have an active subscription
                              </p>
                            </div>
                          )}

                          <div className="pt-4">
                            <Button
                              className="w-full bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all"
                              onClick={handlePlanAction}
                            >
                              {planButtonLabel}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="bg-slate-200 border-2 border-dashed rounded-2xl w-16 h-16 mx-auto" />
                      <p className="mt-4 text-slate-500">Loading user data...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === "billing" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/80 rounded-2xl shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] border border-slate-200/70 backdrop-blur"
              >
                <div className="p-6 border-b border-slate-200/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Billing
                    </p>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                      Billing & Plans
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Manage subscription, invoices, and payment methods.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={refreshSubscriptionData}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                          Status
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            trialActive
                              ? "bg-blue-100 text-blue-800"
                              : subscriptionActive
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {trialActive
                            ? "Trial"
                            : subscriptionActive
                            ? "Subscribed"
                            : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-4 text-lg font-semibold text-slate-900">
                        {currentPlanLabel}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Access to premium messaging and contact unlocks.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                          Next billing
                        </span>
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-slate-900">
                        {nextBillingLabel}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {trialActive
                          ? "Trial period end date."
                          : subscriptionActive
                          ? "Next renewal date."
                          : "No active billing cycle."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.25)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                          Verification
                        </span>
                        {contactData?.verified ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="mt-4 text-lg font-semibold text-slate-900">
                        {contactData?.verified ? "Verified" : "Not verified"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {contactData?.verified
                          ? "Identity verified for secure messaging."
                          : "Verify to start a free trial."}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 mt-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Current Plan
                    </h3>

                    {trialActive ? (
                      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <Crown className="text-yellow-500 mr-2" />
                              <span className="font-semibold text-slate-900">
                                Free Trial
                              </span>
                            </div>
                            <p className="text-slate-600 mt-2">
                              Your trial ends on{" "}
                              {convertISODateToNormal(
                                contactData?.trial_end_date
                              )}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {trialBadgeLabel}
                          </span>
                        </div>
                      </div>
                    ) : subscriptionActive && subscriptionData ? (
                      <div className="bg-linear-to-r from-indigo-50 to-slate-50 border border-indigo-200 rounded-2xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            {/* <div className="flex items-center">
                              <Crown className="text-purple-500 mr-2" />
                              <span className="font-semibold text-slate-900">
                                Premium Plan
                              </span>
                            </div> */}
                            <SubscriptionDetails
                              subscription={subscriptionData}
                            />
                          </div>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                            Subscribed
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                        <h4 className="font-medium text-slate-700 mb-2">
                          No Active Subscription
                        </h4>
                        <p className="text-slate-500 text-sm mb-4">
                          Subscribe to a plan to access premium features
                        </p>
                        <Button
                          className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                          onClick={handleStartTrial}
                        >
                          View Plans
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.25)]">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Payment methods
                      </h4>
                      <p className="mt-2 text-sm text-slate-500">
                        Update the card used for billing and verification.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => setPaymentMethodsOpen(true)}
                      >
                        Manage payment methods
                      </Button>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.25)]">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Billing history
                      </h4>
                      <p className="mt-2 text-sm text-slate-500">
                        View receipts and download invoices for your records.
                      </p>
                      {billingSummary ? (
                        <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs text-slate-600">
                          Last invoice {billingSummary.date} · {billingSummary.amount}
                        </div>
                      ) : null}
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => setBillingHistoryOpen(true)}
                      >
                        View invoices
                      </Button>
                    </div>
                  </div>
                  {canUpgradeToMonthly ? (
                    <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Upgrade to Monthly
                          </p>
                          <p className="text-sm text-slate-600">
                            Move to the Monthly plan. Downgrades aren’t allowed.
                          </p>
                        </div>
                        <Button
                          onClick={handleUpgradeToMonthly}
                          disabled={upgradeLoading}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {upgradeLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Upgrade to Monthly
                        </Button>
                      </div>
                    </div>
                  ) : null}
                    {/* For now lets remove the subscription management */}
                  {/* <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Subscription Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-5">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Payment Methods
                        </h4>
                        <p className="text-gray-500 text-sm mb-4">
                          Add or update your payment methods
                        </p>
                        <Button variant="outline" className="w-full">
                          Manage Payment Methods
                        </Button>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-5">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Billing History
                        </h4>
                        <p className="text-gray-500 text-sm mb-4">
                          View and download your invoices
                        </p>
                        <Button variant="outline" className="w-full">
                          View Billing History
                        </Button>
                      </div>
                    </div>
                  </div> */}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
               
              </motion.div>
            )}
          </div>
        </div>

        <VerifyAccount setOpenModal={setOpenModal} openModal={openModal} />
        <Dialog open={paymentMethodsOpen} onOpenChange={setPaymentMethodsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="text-lg font-semibold">
              Payment methods
            </DialogTitle>
            <DialogDescription>
              Manage the card used for subscription billing.
            </DialogDescription>
            <div className="mt-6 space-y-4">
              {paymentMethodsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : paymentMethods.length ? (
                <div className="space-y-3">
                  {paymentMethods.map((card: any) => {
                    const isDefault = card.default || card.isDefault;
                    return (
                      <div
                        key={card.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {card.card?.brand?.toUpperCase() || "Card"} ending in{" "}
                            {card.card?.last4 || "****"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Expires{" "}
                            {String(card.card?.exp_month || "").padStart(2, "0")}/
                            {card.card?.exp_year || "—"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isDefault ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Default
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDefaultCard(card.id)}
                              disabled={paymentActionLoading === card.id}
                            >
                              Set default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => detachCard(card.id)}
                            disabled={paymentActionLoading === card.id || isDefault}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No saved cards yet.
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Add or replace card
                    </p>
                    <p className="text-xs text-slate-500">
                      Update the default card used for subscriptions.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCreateSetupIntent}
                    disabled={isSavingCard}
                  >
                    {isSavingCard ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Add new card
                  </Button>
                </div>
                {showAddCardForm && setupIntentSecret ? (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <Elements stripe={stripePromise} options={{ clientSecret: setupIntentSecret }}>
                      <UpdateCardForm
                        onSuccess={async (paymentMethodId) => {
                          await setDefaultCard(paymentMethodId);
                          setShowAddCardForm(false);
                        }}
                        onCancel={() => setShowAddCardForm(false)}
                      />
                    </Elements>
                  </div>
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={billingHistoryOpen} onOpenChange={setBillingHistoryOpen}>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="text-lg font-semibold">
              Billing history
            </DialogTitle>
            <DialogDescription>
              Download receipts and invoices for your records.
            </DialogDescription>
            <div className="mt-6 space-y-3">
              {billingHistoryLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : billingHistory.length ? (
                billingHistory.map((invoice: any) => (
                  <div
                    key={invoice.id || invoice.number}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {invoice.number || "Invoice"} ·{" "}
                        {formatMoney(
                          invoice.amount_paid || invoice.amount_due,
                          invoice.currency
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {invoice.created
                          ? new Date(invoice.created * 1000).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—"}{" "}
                        · {invoice.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {invoice.hosted_invoice_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.hosted_invoice_url, "_blank")}
                        >
                          View
                        </Button>
                      ) : null}
                      {invoice.invoice_pdf ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(invoice.invoice_pdf, "_blank")}
                        >
                          Download
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No invoices yet.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        {/* Dialog/Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl! mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-0">
            <PricingPlan closePricingDialog={closePricingDialog} />
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}



function UpdateCardForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (paymentMethodId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      toast({
        title: "Stripe not ready",
        description: "Please wait and try again.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {},
      redirect: "if_required",
    });

    if (result.error) {
      toast({
        title: "Card update failed",
        description: result.error.message || "Unable to save card.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    const paymentMethodId = result.setupIntent?.payment_method as
      | string
      | undefined;

    if (!paymentMethodId) {
      toast({
        title: "Card update failed",
        description: "Payment method could not be confirmed.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    await onSuccess(paymentMethodId);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !stripe || !elements}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save card
        </Button>
      </div>
    </form>
  );
}

export default AccountSettings;
