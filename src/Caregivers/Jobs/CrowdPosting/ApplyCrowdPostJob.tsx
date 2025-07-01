import { Interweave } from "interweave";
import {
  MapPin,
  Phone,
  User,
  Briefcase,
  Clock,
  DollarSign,
  Car,
  Star,
  ShieldCheck,
  Zap,
  Heart,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Send,
} from "lucide-react";
import React from "react";
import { polyfill } from "interweave-ssr";
import ApplyJobButton from "./ApplyJobButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import CaregiverApplyUI from "./CaregiverApplyUI";

polyfill();

async function ApplyCrowdPostJob({ jobID }: any) {
  const res = await fetch(
    `https://api.kinscare.org/api/v1/providers/crowd-post/${jobID}`,
    { cache: "no-cache" }
  );
  const { job, similarJobs } = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e6f0ff] py-8 md:py-12 overflow-hidden relative">
      {/* Floating elements for visual interest */}
      <CaregiverApplyUI job={job} jobID={jobID} />
    </div>
  );
}



export default ApplyCrowdPostJob;