"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  Briefcase,
  MapPin,
  Phone,
  BadgeCheck,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";

// Replace with your real context or agent/user data
const AGENT_NAME = "Agent Name";
const AGENT_ID = "AGENT_USER_ID"; // fetch from context/auth in production

const BASE_URL = "http://localhost:8081/api/v1/providers/";

function AgentQueue() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
   const { privateApi } = useApiClient();
 const {userData} = useAuthContext();
  //   console.log(userData)
  const router = useRouter();

  // Fetch applications
  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}jumpstart/queue`);
      // console.log(res.data);
      // Move taken applications (with .takenBy) to the end
      const sorted: any = [...(res.data.queue || [])].sort((a, b) => {
        if (!!a.takenBy && !b.takenBy) return 1;
        if (!a.takenBy && !!b.takenBy) return -1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setApps(sorted);
    } catch (err) {
      setError("Error loading queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Accept an application
  const handleAccept = async (id: any) => {
    setAcceptingId(id);
    try {
      // API to flag the app as taken
      const res = await privateApi.post(`${BASE_URL}jumpstart/add-caregiver`, {
        applicationId: id,
        agentId: userData.userID,
        agentEmail: userData.auth.email,
      });
      if (res.data.success) {
        fetchQueue();
        router.push(`/agent/application/${id}`);
      } else {
        alert(res.data.message || "Could not accept application.");
      }
    } catch (e) {
      alert("Network error or server error.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleView = (idx: any, agentStatus:any, _id:any) => {
    if(agentStatus === "assigned"){
      router.push(`/agent/application/${_id}`)
    }else{
      setExpanded(expanded === idx ? null : idx);
    }
  };

  if (loading)
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto text-center text-red-600 py-20">
        {error}
      </div>
    );

  if (!apps.length)
    return (
      <div className="max-w-xl mx-auto text-center text-gray-600 py-20">
        No pending Jumpstart applications. Check back soon!
      </div>
    );

  return (
    <div className="max-w-3xl px-0 xl:px-2">
      <div className="space-y-6">
        {apps.map((app: any, idx) => {
          const { user, application, createdAt, status, takenBy, _id }: any =
            app;
          const isTaken = !!takenBy;
          return (
            <div
              key={_id || idx}
              className={`bg-white border border-gray-100 rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all ${
                isTaken ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={user?.profileImage} alt={user?.name} />
                  <AvatarFallback>
                    <User className="w-6 h-6 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <div className="font-semibold text-lg text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application?.organizationName}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                      {application?.whoNeedsCare}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {application?.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-4 md:mt-0 md:pl-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="text-gray-500 text-sm mb-2 sm:mb-0">
                    Submitted{" "}
                    {createdAt
                      ? formatDistanceToNow(new Date(createdAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === "payment_pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status === "payment_pending"
                        ? "Payment Pending"
                        : status === "active"
                        ? "Active"
                        : status}
                    </span>
                    {isTaken ? (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Taken by {takenBy?.name || "Another Agent"}
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={acceptingId === _id || app?.agentStatus}
                        onClick={() => handleAccept(_id)}
                      >
                        {acceptingId === _id ? "Accepting..." : "Accept & View"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(idx, app?.agentStatus, _id)}
                    >
                      {expanded === idx ? "Hide" : "View"}
                    </Button>
                  </div>
                </div>
                {expanded === idx && (
                  <div className="mt-4 border-t pt-4 space-y-2">
                    <div className="text-gray-700 text-sm">
                      <Briefcase className="w-4 h-4 inline mr-1 text-indigo-500" />
                      <span className="font-medium">Roles:</span>{" "}
                      {application?.type?.join(", ") || "—"}
                    </div>
                    <div className="text-gray-700 text-sm">
                      <BadgeCheck className="w-4 h-4 inline mr-1 text-green-500" />
                      <span className="font-medium">Licenses:</span>{" "}
                      {application?.licenses?.join(", ") || "—"}
                    </div>
                    <div className="text-gray-700 text-sm">
                      <MapPin className="w-4 h-4 inline mr-1 text-indigo-500" />
                      <span className="font-medium">Location:</span>{" "}
                      {application?.location || "—"}
                    </div>
                    <div className="text-gray-700 text-sm">
                      <Phone className="w-4 h-4 inline mr-1 text-indigo-500" />
                      <span className="font-medium">Phone:</span>{" "}
                      {application?.phone || "—"}
                    </div>
                    <div className="text-gray-700 text-sm">
                      <span className="font-medium">Notes:</span>{" "}
                      {application?.notes || "—"}
                    </div>
                    {/* You can add more agent actions here */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AgentQueue;
