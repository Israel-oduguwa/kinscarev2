/* eslint-disable react/no-unescaped-entities */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import axios from "axios";
import { format, formatDistanceToNowStrict, isAfter } from "date-fns";
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Phone,
  RefreshCw,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const statusMap: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  payment_pending: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    label: "Awaiting Payment",
    icon: <Clock className="w-4 h-4" />,
  },
  active: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    label: "Active (Agent Working)",
    icon: <RefreshCw className="w-4 h-4" />,
  },
  expired: {
    color: "bg-rose-100 text-rose-700 border-rose-200",
    label: "Expired",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  complete: {
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    label: "Service Active",
    icon: <BadgeCheck className="w-4 h-4" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const stat = statusMap[status] || {
    color: "bg-gray-100 text-gray-600 border-gray-200",
    label: status,
    icon: <span className="w-2 h-2 bg-gray-400 rounded-full" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${stat.color}`}
    >
      {stat.icon}
      <span>{stat.label}</span>
    </div>
  );
}



function AuditTrail({ auditTrail = [] }: { auditTrail: any[] }) {
  if (!auditTrail.length) return null;

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Progress Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-gray-200 pl-6 space-y-2">
          {auditTrail.map((item, idx) => (
            <li key={idx} className="relative pl-6 pb-6 last:pb-0">
              <div className="absolute -left-2.5 top-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <h4 className="font-medium text-gray-800 capitalize">
                    {item.event.replace(/_/g, " ")}
                  </h4>
                  {item.details && (
                    <p className="text-gray-500 text-sm mt-1">{item.details}</p>
                  )}
                </div>
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {format(new Date(item.timestamp), "MMM d, yyyy · h:mm a")}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function ProviderTracking() {
  const {
    userData: { userID },
  }: any = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const {privateApi} = useApiClient();
  const fetchDetails = async () => {
    try {
      const { data } = await privateApi.get(`/api/v1/providers/jumpstart/request?userID=${userID}`
      );
      setOrder(data.order || null);
      console.log(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userID) fetchDetails();
  }, [userID]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDetails();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="rounded-xl">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="text-indigo-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No Active Jumpstart Order
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You don't have any active Jumpstart Hiring requests. Start a new
          request to get matched with qualified caregivers.
        </p>
        <a
          href="/jumpstart-hiring/apply"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Get Started
          <ChevronRight className="ml-2 w-4 h-4" />
        </a>
      </div>
    );
  }

  // Counts for progress
  const uniqueCaregiverIds = Array.from(
    new Set((order?.caregivers || []).map((cg: any) => cg.caregiverId))
  );
  const sourcedCount = uniqueCaregiverIds.length;
  const interviewedCount = (order?.caregivers || []).filter(
    (cg: any) => cg.interviewed
  ).length;
  const target = 3;

  const progressValue = Math.min(
    100,
    Math.round((interviewedCount / target) * 100)
  );

  const isActive =
    order.status === "complete" &&
    isAfter(new Date(order.subscription_end_date), new Date());

  let daysLeft = "";
  if (order.subscription_end_date) {
    daysLeft =
      formatDistanceToNowStrict(new Date(order.subscription_end_date), {
        unit: "day",
      }) + (isActive ? " left in service" : " (ended)");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Jumpstart Hiring Progress
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <span className="text-sm text-gray-500">
              Order placed: {format(new Date(order.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        {order.subscription_end_date && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">{daysLeft}</span>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <Card className="rounded-xl border-0 bg-gradient-to-r from-indigo-50 to-indigo-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Form Submitted</p>
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Payment Received</p>
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {sourcedCount >= target ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Caregivers Sourced
                  </p>
                  <span className="text-xs text-gray-500">
                    {sourcedCount} sourced
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {interviewedCount >= target ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">Interviews Done</p>
                  <span className="text-xs text-gray-500">
                    {interviewedCount}/{target} completed
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Overall progress
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {progressValue}%
                </span>
              </div>
              <Progress
                value={progressValue}
                className="h-2.5 bg-gray-200"
                // indicatorClass="bg-indigo-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Caregivers */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Recommended Caregivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {interviewedCount === 0 ? (
            <div className="py-8 text-center rounded-lg border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                Interviews in progress
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Our team is currently scheduling interviews with potential
                caregivers. We'll notify you as soon as candidates are available
                for review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Interviewed On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(order?.caregivers || [])
                    .filter((cg: any) => cg.interviewed)
                    .map((cg: any, idx: number) => {
                      const event = order.auditTrail.find(
                        (a: any) =>
                          a.event === "caregiver_marked_interviewed" &&
                          a.caregiverId === cg.caregiverId
                      );
                      return (
                        <tr
                          key={cg.caregiverId + idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/provider/candidates/${cg.caregiverId}`}>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">
                                    {cg.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {cg.experience} years experience
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {cg.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Interviewed
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {event
                              ? format(new Date(event.timestamp), "MMM d, yyyy")
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex=flex-shrink-0">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-800">
                  {order.user?.name || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">
                  {order.user?.email || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {order.user?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Started</p>
                <p className="font-medium text-gray-800">
                  {order.createdAt
                    ? format(new Date(order.createdAt), "MMM d, yyyy")
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <AuditTrail auditTrail={order.auditTrail} />

      {/* Next Steps */}
      <Card className="rounded-xl border-indigo-100 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            What happens next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-gray-700">
            <p>
              Our agent is actively sourcing caregivers for your needs.
              Here's what to expect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You'll receive up to 3 qualified caregiver matches within 3
                business days
              </li>
              <li>We'll schedule interviews at times convenient for you</li>
              <li>
                Full directory access for 2 weeks after service completion
              </li>
              <li>Real-time updates via email and SMS</li>
            </ul>
            <p className="pt-2 font-medium text-indigo-700">
              Your dedicated agent: <span className="font-semibold"></span>
              {order?.agent?.agentEmail || "oder"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}