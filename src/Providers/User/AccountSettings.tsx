"use client";
import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Trash2,
  Info,
  Crown,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import FreeTrialPayment from "./FreeTrialPayment";
import PricingPlan from "./PricingPlan";
import SubscriptionDetails from "./SubscriptionDetails";
import DeleteAccount from "./DeleteAccount";
import {
  convertISODateToNormal,
  fetchContactsData,
  isTrialActive,
} from "@/lib/utils";
import Image from "next/image";
import VerifyAccount from "../Candidates/VerifyAccount";

function AccountSettings() {
  const mongo: any = useContext(MongoContext);
  const { user, customData, userData, setUser, setCustomData } = mongo;
  // Inside your component (UpdateProfile)
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false); // Add for verification dialog

  // State to track free trial modal visibility and client secret
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("client_secret") : null
  );
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  // console.log(userData?.availability);
  const verifyPaymentMethod = () => {
    setOpenModal(true);
    setIsVerificationDialogOpen(false);
  };
  useEffect(() => {
    const fetchCustomData = async () => {
      setLoading(true);
      const fetchedData: any = await fetchContactsData(
        user.customData.userID,
        user.customData.email
      );
      if (fetchedData) {
        await setCustomData(fetchedData.result);
      }
      setLoading(false);
    };

    fetchCustomData();
    if (customData) {
      fetchSubscriptionData();
    }
  }, [user]);

  const trialActive = isTrialActive(
    customData?.trial_start_date,
    customData?.trial_end_date
  );

  const handleStartTrial = async () => {
    setIsDialogOpen(true);
  };

  const fetchSubscriptionData = async () => {
    try {
      if (!customData?.customer_id) return;

      const getSubData = await axios.get(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/subscription/${customData.customer_id}`
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Account Settings
          </h1>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
            Manage your profile, subscription, and account preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center text-white">
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
                    <h2 className="font-bold text-gray-800 truncate max-w-[150px]">
                      {userData?.name || user?.customData?.name}
                    </h2>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">
                      {user?.customData?.email}
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
                    className={`flex items-center w-full p-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
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
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : activeTab === "account" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Account Information
                  </h2>
                </div>

                <div className="p-6">
                  {!user?.customData?.verified && (
                    <div className="flex items-start p-4 mb-6 bg-yellow-50 rounded-lg border border-yellow-200">
                      <ShieldAlert
                        className="text-yellow-500 mt-1 mr-3 flex-shrink-0"
                        size={20}
                      />
                      <div>
                        <h3 className="font-semibold text-yellow-800">
                          Unverified Account
                        </h3>
                        <p className="text-yellow-700 text-sm mt-1">
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
                      closePosition="left"
                      className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
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
                      <div className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-gray-500 text-sm font-medium mb-3">
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p className="font-medium">{userData.fname} {userData.lname}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Email Address
                            </p>
                            <p className="font-medium">
                              {user?.customData?.email}
                            </p>
                            <div className="mt-1">
                              {user?.customData?.verified ? (
                                <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                  <XCircle className="w-3 h-3 mr-1" />{" "}
                                  Unverified
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="font-medium">
                              {userData.address}, {userData.city},{" "}
                              {userData.zipcode}
                            </p>
                          </div>
                        </div>
                        <Link href="/provider/account/settings/profile">
                          <Button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all">
                            Update Profile
                          </Button>
                        </Link>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-gray-500 text-sm font-medium mb-3">
                          Subscription Status
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-500">
                                Current Plan
                              </p>
                              <p className="font-medium">
                                {trialActive && !customData?.subscribed
                                  ? "Free Trial"
                                  : "Premium Plan"}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {trialActive && !customData?.subscribed ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  Trial Active
                                </span>
                              ) : customData?.subscribed && subscriptionData ? (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                  Subscribed
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>

                          {trialActive && !customData?.subscribed ? (
                            <div>
                              <p className="text-xs text-gray-500">
                                Trial Period Ends
                              </p>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                <p className="font-medium">
                                  {convertISODateToNormal(
                                    customData?.trial_end_date
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : !trialActive &&
                            customData?.subscribed &&
                            subscriptionData ? (
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
                              <p className="text-gray-500 text-sm">
                                You don&apos;t have an active subscription
                              </p>
                            </div>
                          )}

                          <div className="pt-4">
                            <Button
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all"
                              onClick={handleStartTrial}
                            >
                              {trialActive
                                ? "Upgrade Plan"
                                : "Veiw Plans"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                      <p className="mt-4 text-gray-500">Loading user data...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === "billing" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                    Billing & Plans
                  </h2>
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
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Current Plan
                    </h3>

                    {trialActive && !customData?.subscribed ? (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <Crown className="text-yellow-500 mr-2" />
                              <span className="font-bold text-gray-800">
                                Free Trial
                              </span>
                            </div>
                            <p className="text-gray-600 mt-2">
                              Your trial ends on{" "}
                              {convertISODateToNormal(
                                customData?.trial_end_date
                              )}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    ) : customData?.subscribed && subscriptionData ? (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <Crown className="text-purple-500 mr-2" />
                              <span className="font-bold text-gray-800">
                                Premium Plan
                              </span>
                            </div>
                            <SubscriptionDetails
                              subscription={subscriptionData}
                            />
                          </div>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            Subscribed
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                        <h4 className="font-medium text-gray-700 mb-2">
                          No Active Subscription
                        </h4>
                        <p className="text-gray-500 text-sm mb-4">
                          Subscribe to a plan to access premium features
                        </p>
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                          onClick={handleStartTrial}
                        >
                          View Plans
                        </Button>
                      </div>
                    )}
                  </div>
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
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Trash2 className="w-5 h-5 mr-2 text-blue-500" />
                    Account Deletion
                  </h2>
                </div>
                <div className="p-6">
                  <DeleteAccount />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <VerifyAccount setOpenModal={setOpenModal} openModal={openModal} />
        {/* Dialog/Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-0">
            <PricingPlan closePricingDialog={closePricingDialog} />
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}

// // Dialog components (simplified for example)
// const InDialog = ({ open, onOpenChange, children }: any) =>
//   open ? (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       {children}
//     </div>
//   ) : null;

// const InDialogContent = ({ children, className }: any) => (
//   <motion.div
//     initial={{ scale: 0.95, opacity: 0 }}
//     animate={{ scale: 1, opacity: 1 }}
//     className={className}
//   >
//     {children}
//   </motion.div>
// );

export default AccountSettings;
