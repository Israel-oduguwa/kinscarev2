"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, BadgeCheck, User, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const API_BASE = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/jumpstart";

export default function InterviewingPage({ applicationId }: { applicationId: string }) {
 const {userData} = useAuthContext();
  const agentId = userData?.userID;
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [toggling, setToggling] = useState<string>(""); // userID being toggled
  const [removing, setRemoving] = useState<string>(""); // userID being removed

  const fetchCaregivers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/interview-caregivers`, {
        params: { applicationId, agentId },
      });
      setCaregivers(res.data.caregivers || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch caregivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId && agentId) fetchCaregivers();
    // eslint-disable-next-line
  }, [applicationId, agentId]);

  // Toggle interviewed status
  const toggleInterviewed = async (caregiverId: string, current: boolean) => {
    setToggling(caregiverId);
    try {
      await axios.patch(`${API_BASE}/toggle-interviewed`, {
        applicationId,
        caregiverId,
        agentId,
        interviewed: !current,
      });
      toast({ title: "Updated!", description: "Interviewed status updated." });
      fetchCaregivers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setToggling("");
    }
  };

  // Remove caregiver from interview list
  const removeCaregiver = async (caregiverId: string) => {
    setRemoving(caregiverId);
    try {
     const red = await privateApi.post(`${API_BASE}/remove-interview`, {
        applicationId,
        caregiverId,
        removedBy:agentId,
      });
      console.log(red)
      toast({ title: "Removed!", description: "Caregiver removed from interview list." });
      fetchCaregivers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setRemoving("");
    }
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto text-center text-red-600 py-20">
        {error}
      </div>
    );

  if (!caregivers.length)
    return (
      <div className="max-w-xl mx-auto text-center text-gray-600 py-20">
        No caregivers added for interview yet.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
        Your Interview List
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {caregivers.map((cg) => (
          <div
            key={cg.userID}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-4 transition hover:shadow-xl relative"
          >
            <div className="flex gap-4 items-center">
              <Avatar className="w-16 h-16 shadow border">
                <AvatarImage src={cg.profileImage || undefined} alt={cg.name || "Caregiver"} />
                <AvatarFallback>
                  <User className="w-8 h-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-gray-800">
                    {cg.name || cg.fname + " " + cg.lname}
                  </span>
                  {cg.licenses?.length > 0 && (
                    <span className="flex items-center bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      {cg.licenses?.join(", ")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {cg.city && <span>{cg.city}, </span>}
                  {cg.zipcode}
                </div>
                <div className="text-xs text-gray-500">
                  Registered:{" "}
                  {cg.created ? (
                    format(new Date(cg.created), "MMM d, yyyy")
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
            <div className="text-gray-700 text-sm">
              <span className="font-medium">Email:</span>{" "}
              {cg.auth?.email || cg.email || "—"}
            </div>
            <div className="text-gray-700 text-sm">
              <span className="font-medium">Phone:</span>{" "}
              {cg.tel || cg.auth?.tel || "—"}
            </div>
            <div className="text-gray-700 text-sm">
              <span className="font-medium">Availability:</span>{" "}
              {cg.availability?.join(", ") || "—"}
            </div>
            <div className="text-gray-700 text-sm">
              <span className="font-medium">Certifications:</span>{" "}
              {cg.certifications || "—"}
            </div>
            <div className="text-xs text-gray-400 mb-2">
              Added:{" "}
              {cg.addedAt
                ? format(new Date(cg.addedAt), "MMM d, yyyy h:mm a")
                : "—"}
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              {/* Toggle Interviewed */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={cg.interviewed}
                  onCheckedChange={() => toggleInterviewed(cg.userID, cg.interviewed)}
                  disabled={toggling === cg.userID}
                />
                <span className="text-sm">
                  {cg.interviewed ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" /> Interviewed
                    </span>
                  ) : (
                    "Mark as Interviewed"
                  )}
                </span>
                {toggling === cg.userID && <Loader2 className="animate-spin w-4 h-4 text-gray-400" />}
              </div>
              {/* Remove Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeCaregiver(cg.userID)}
                disabled={removing === cg.userID}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {removing === cg.userID ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
