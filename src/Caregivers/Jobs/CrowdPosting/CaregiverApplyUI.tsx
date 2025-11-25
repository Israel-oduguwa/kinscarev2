"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Interweave } from "interweave";
import {
    ArrowRight,
    Briefcase,
    Car,
    ChevronRight,
    Clock,
    DollarSign,
    Heart,
    MapPin,
    Send,
    ShieldCheck,
    Star,
    User,
    Zap
} from "lucide-react";
import Image from "next/image";
import ApplyJobButton from "./ApplyJobButton";

function CaregiverApplyUI({job, jobID}:any) {
  return (
   <>
     <motion.div 
           className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#6366f130] blur-3xl -z-10"
           animate={{ scale: [1, 1.05, 1] }}
           transition={{ duration: 8, repeat: Infinity }}
         />
         <motion.div 
           className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#c7d2fe30] blur-3xl -z-10"
           animate={{ scale: [1, 1.07, 1] }}
           transition={{ duration: 10, repeat: Infinity, delay: 1 }}
         />
         
         <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Main Job Card */}
             <div className="lg:col-span-2">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
                 className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-white/30 relative"
               >
               
                 
                 <div className="flex flex-col p-6 md:p-8 lg:p-10 gap-4">
                   {/* Header with floating badge */}
                   <div className="relative">
                     <div className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 shadow-md">
                       <Zap className="w-4 h-4 mr-1.5" />
                       {job?.schedule?.[0]}
                     </div>
                     <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-[85%]">
                       {job?.title}
                     </h1>
                   </div>
                   
                   {/* Employer with verified badge */}
                   <div className="flex items-center gap-4 mb-2 relative">
                     <div className="relative">
                       <Image
                         className="rounded-full border-4 border-white shadow-lg"
                         width={90}
                         height={90}
                         src={job.profileImage}
                         alt="Employer avatar"
                       />
                       <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
                         <ShieldCheck className="w-5 h-5 text-green-500" />
                       </div>
                     </div>
                     <div>
                       <p className="text-sm text-gray-500">Posted by</p>
                       <div className="flex items-center gap-2">
                         <p className="font-bold text-gray-900">
                           {job?.employer_name}
                         </p>
                         <div className="flex items-center text-amber-500">
                           <Star className="w-4 h-4 fill-amber-400" />
                           <span className="text-sm font-bold ml-1">4.9</span>
                         </div>
                       </div>
                       <div className="flex items-center text-gray-500 text-sm mt-1">
                         <Clock className="w-4 h-4 mr-1" />
                         <span>
                           Posted {format(new Date(job.created), "PPP")}
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   {/* Tags and Details - Grid Layout */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                       <div className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                         <MapPin className="w-4 h-4 text-indigo-500" />
                         Location
                       </div>
                       <p className="font-semibold text-sm">{job?.address}, {job?.city}</p>
                     </div>
                     
                     {job?.mobility && (
                       <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                         <div className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                           <Car className="w-4 h-4 text-indigo-500" />
                           Transportation
                         </div>
                         <p className="font-semibold text-sm">
                           {job.mobility === "car_needed" ? "Car Required" : "No Car Needed"}
                         </p>
                       </div>
                     )}
                     
                     {job?.salary && (
                       <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                         <div className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                           <DollarSign className="w-4 h-4 text-indigo-500" />
                           Rate
                         </div>
                         <p className="font-semibold">${job.salary}/hour</p>
                       </div>
                     )}
                     
                     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                       <div className="text-gray-500 text-sm flex items-center gap-2 mb-1">
                         <Briefcase className="w-4 h-4 text-indigo-500" />
                         Type
                       </div>
                       <p className="font-semibold text-sm">Full-time</p>
                     </div>
                   </div>
                   
                   {/* Description with animated expand */}
                   <div>
                     <h3 className="text-xl font-bold text-gray-800  flex items-center gap-1">
                       <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                       Job Description
                     </h3>
                     <div className="prose prose-indigo max-w-none text-gray-700 bg-white/50">
                       <Interweave content={job?.description || ""} />
                     </div>
                   </div>
                   
              
                   {/* Apply Button with animation */}
                   <motion.div
                    
                   >
                     <ApplyJobButton job={job} jobID={jobID} />
                   </motion.div>
                 </div>
               </motion.div>
               
               {/* Alert Preferences with modern toggle */}
               {job?.alert_preferences?.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: 0.1 }}
                   className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-md p-6 border border-white/30"
                 >
                   <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-800">Alert Preferences</h2>
                     <div className="flex items-center">
                       <span className="text-sm text-gray-600 mr-2">Enable alerts</span>
                       <div className="relative inline-block w-12 h-6 cursor-pointer">
                         <input type="checkbox" className="sr-only" id="toggle" />
                         <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                         <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform"></div>
                       </div>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-3">
                     {job.alert_preferences.map((pref, idx) => (
                       <span
                         key={idx}
                         className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium rounded-full transition-all hover:shadow-md border border-indigo-100"
                       >
                         <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                         {pref}
                       </span>
                     ))}
                   </div>
                 </motion.div>
               )}
             </div>
   
             {/* Sidebar - Persuasive Elements */}
             <aside className="flex flex-col gap-6">
               {/* Why Apply Card */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="bg-gradient-to-br from-indigo-50 to-white backdrop-blur-xl rounded-2xl shadow-md p-6 flex flex-col gap-5 border border-white/30"
               >
                 <div className="flex items-center justify-between">
                   <h3 className="text-xl font-bold text-indigo-900">Why You&apos;ll Love This Role</h3>
                   <div className="bg-indigo-100 p-2 rounded-lg">
                     <Zap className="w-4 h-4 text-indigo-600" />
                   </div>
                 </div>
                 <ul>
                   {[
                     { 
                       icon: <Clock className="w-5 h-5 text-indigo-600" />,
                       title: "Flexible Scheduling",
                       text: "Choose shifts that fit your lifestyle with our smart scheduling system"
                     },
                     { 
                       icon: <DollarSign className="w-5 h-5 text-indigo-600" />,
                       title: "Competitive Pay",
                       text: `Earn $${job.compensation}/hr + bonuses and overtime opportunities`
                     },
                     { 
                       icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
                       title: "Full Benefits",
                       text: "Medical, dental, retirement plans and professional development"
                     },
                    
                   ].map((item, index) => (
                     <motion.li 
                       key={index}
                       whileHover={{ x: 5 }}
                       className="flex items-start gap-3 p-3 rounded-xl hover:bg-indigo-50/50 transition-colors"
                     >
                       <div className="bg-white p-2 rounded-lg shadow-sm mt-0.5">
                         {item.icon}
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-800">{item.title}</h4>
                         <p className="text-gray-600 text-sm">{item.text}</p>
                       </div>
                     </motion.li>
                   ))}
                 </ul>
                 
                 <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 mt-3 text-white">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-bold text-lg">Fast-Track Application</p>
                       <p className="text-indigo-100 text-sm">Complete in under 2 minutes</p>
                     </div>
                     <div className="bg-white/20 p-2 rounded-lg">
                       <Send className="w-5 h-5" />
                     </div>
                   </div>
                 </div>
               </motion.div>
               
               {/* Testimonial with animated carousel effect */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3 }}
                 className="bg-gradient-to-br from-indigo-600 to-purple-600 backdrop-blur-2xl rounded-2xl shadow-md p-6 text-white flex flex-col gap-3 border border-white/30 relative overflow-hidden"
               >
                 {/* Decorative elements */}
                 <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10"></div>
                 <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5"></div>
                 
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="flex">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className="w-5 h-5 fill-amber-300 text-amber-300" />
                       ))}
                     </div>
                     <span className="font-bold">4.92/5</span>
                   </div>
                   
                   <p className="text-lg font-medium italic mb-4">
                     "KinsCare completely transformed my job search. I applied in the morning and had an interview by afternoon!"
                   </p>
                   
                   <div className="flex items-center gap-3">
                     <Avatar className="border-2 border-white">
                       <AvatarImage src="/placeholder-user.jpg" />
                       <AvatarFallback>JD</AvatarFallback>
                     </Avatar>
                     <div>
                       <p className="font-bold">Jamie D.</p>
                       <p className="text-indigo-200 text-sm">Certified Nurse Assistant</p>
                     </div>
                   </div>
                 </div>
               </motion.div>
               
               {/* Trust Signals
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
                 className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md p-6 border border-white/30"
               >
                 <h4 className="text-base font-bold text-gray-800 mb-4">Why Caregivers Trust Us</h4>
                 
                 <div className="space-y-4">
                   {[
                     { 
                       icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
                       text: "Verified employers & background checks"
                     },
                     { 
                       icon: <Lock className="w-5 h-5 text-indigo-500" />,
                       text: "Secure application process"
                     },
                     { 
                       icon: <Zap className="w-5 h-5 text-amber-500" />,
                       text: "90% response rate within 24 hours"
                     }
                   ].map((item, index) => (
                     <div key={index} className="flex items-center gap-3">
                       <div className="bg-gray-100 p-2 rounded-lg">
                         {item.icon}
                       </div>
                       <p className="text-gray-700">{item.text}</p>
                     </div>
                   ))}
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-gray-200">
                   <button className="w-full flex items-center justify-between group">
                     <span className="font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                       Need help with your application?
                     </span>
                     <ChevronRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
               </motion.div> */}
               
          
             </aside>
           </div>
         </div></>
  )
}

export default CaregiverApplyUI
// Mock Lock icon component
const Lock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );