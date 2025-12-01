"use client";

import React from "react";
import axios from "axios";
import { useAuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useApiClient } from "@/hooks/useApiClient";

type Applicant = {
  _id: string;
  email?: string | null;
  phone?: string | null;
  zipcode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  tags?: string[];
  jump_start?: boolean;
  contact?: {
    channel?: { address?: string };
    channelAddress?: string;
  };
};

function ApplicantsSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="hidden md:flex space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TwilioApplicantsPage() {
 const {userData} = useAuthContext();
  const {user}:any = useUser();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [applicants, setApplicants] = React.useState<Applicant[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const canFetch = Boolean(userData && userData.role === "admin" || user.primaryEmailAddress.emailAddress === "oduguwa.israel22@gmail.com");
  const {privateApi} = useApiClient();

  const fetchApplicants = React.useCallback(
    async (showRefresh = false) => {
      if (!canFetch) return;

      const controller = new AbortController();
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await privateApi.get("/api/v1/providers/jumpstart/get-twilio-applicants",
          { signal: controller.signal }
        );
        // console.log(res.data)
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setApplicants(data);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch applicants."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }

      return () => controller.abort();
    },
    [canFetch]
  );

  React.useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleRefresh = () => {
    fetchApplicants(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : "?";
  };

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-800">
                  Authentication Required
                </h3>
                <p className="text-orange-700 text-sm">
                  You must be signed in to view this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userData.role !== "admin" && user.primaryEmailAddress.emailAddress !== "oduguwa.israel22@gmail.com") {

    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Access Restricted
                </h3>
                <p className="text-amber-700 text-sm">
                  This page is only available for{" "}
                  <Badge variant="secondary" className="ml-1">
                    admin
                  </Badge>{" "}
                  role.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getApplicantId = (doc: any) =>
  typeof doc?._id === "string" ? doc._id : doc?._id?.$oid ?? "";


  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Jumpstart Applicants
          </h1>
          <p className="text-slate-600 mt-2">All applications from twilio</p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Applicants
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {applicants.length}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* 
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">With Email</p>
                <p className="text-2xl font-bold text-green-900">
                  {applicants.filter(a => a.email).length}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Main Content */}
     {applicants.map((applicant: any) => {
  const id = getApplicantId(applicant);
  const phone =
    applicant?.phone ??
    applicant?.contact?.channel?.address ??
    applicant?.contact?.channelAddress ??
    null;

  const created = applicant?.createdAt
    ? formatDate(applicant.createdAt)
    : applicant?.timestamp
    ? formatDate(applicant.timestamp as string)
    : "Unknown";

  return (
    <Card
      key={id || JSON.stringify(applicant)}
      className="hover:shadow-md transition-shadow duration-200 border-slate-200"
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="h-12 w-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {getInitials(applicant.email || "?")}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 truncate flex items-center gap-2">
                  {applicant.email || "No email provided"}
                  {applicant.jump_start && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Jumpstart
                    </Badge>
                  )}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {applicant.source && (
                    <Badge variant="outline" className="text-xs">
                      {applicant.source}
                    </Badge>
                  )}
                  {Array.isArray(applicant.tags) &&
                    applicant.tags.map((tag: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Right side: Contact + Created + View Link */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-sm">
                {phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{phone}</span>
                  </div>
                )}

                {applicant.zipcode && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{applicant.zipcode}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{created}</span>
                </div>

                {/* View / Edit link */}
                <div className="justify-self-end">
                  <Link
                    href={id ? `/agent/twilio/provider/${id}` : "#"}
                    prefetch={false}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                    aria-disabled={!id}
                    onClick={(e) => {
                      if (!id) e.preventDefault();
                    }}
                  >
                    View / Edit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
})}

    </div>
  );
}
