
// // const AI_MODEL_SERVICE =
// // "https://excel-health-101882100979.us-central1.run.app/";
// // let cardDataLocal: any[] = [];
// // console.log(program, "this is the prgram sent to the server");
// // if (program === "AlliedHealthcare" || career_path !== "known") {
// // const response_alliance = await fetch(
// //   `${AI_MODEL_SERVICE}find_alliance_healthcare/`,
// //   {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({
// //       category: program || "AlliedHealthcare",
// //       top_k: 3,
// //     }),
// //   }
// // );
// // const result_alliance = await response_alliance.json();
// // console.log(
// //   result_alliance,
// //   "this is the result sent from the server"
// // );
// // cardDataLocal = result_alliance.results;
// // window.cardData = cardDataLocal;
// // }
// // if (career_path !== "known") {
// // console.log(cardDataLocal);
// // window.global_element.innerHTML = `
// // <div class="carousel-container" style="position: relative; display: flex; align-items: center; 
// //                                         justify-content: center; width: 100%; background-color: #f9f9f9; 
// //                                         border-radius: 10px; overflow: scroll;">
// //   <button id="prev" style="
// //     position: absolute;
// //     left: 1px;
// //     background: white;
// //     border: 0px solid #ccc;
// //     border-radius: 50%;
// //     width: 25px;
// //     height: 25px;
// //     display: flex;
// //     align-items: center;
// //     justify-content: center;
// //     font-size: 1.5rem;
// //     cursor: pointer;
// //     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
// //   ">‹</button>
// //   <div class="carousel" style="text-align: center;">
// //     ${cardDataLocal
// //       .map(
// //         (card) => `
// //           <div class="carousel-item" style="width: 250px; border: 0px solid #ccc; border-radius: 10px; 
// //                                             padding: 8px; background-color: transparent; display: none;">
// //             <div style="border-radius: 12px; background-color:white; width: 200px; margin-left:8%; 
// //                         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); padding: 10px;">
// //               <h3 style=" font-size: 18px; margin:0%; text-align: left; color:#1e6bd8;">${
// //                 card.name
// //               }</h3>
// //               <br/>
// //               <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
// //                 <strong style="color: #434343;"> Requirements: </strong> ${
// //                   card.course_prerequisites?.substring(0, 90) ||
// //                   ""
// //                 }
// //               </p>
              
// //               <div style="text-align:right;">
// //                 <button class="learn-more" 
// //                   onclick="renderProgramDetails('${
// //                     card.institution
// //                   }','${card.name}','${
// //           card.application_contact?.name
// //         } ${card.application_contact?.email}')"
// //                   style="
// //                     background: linear-gradient(to right, #2e6ee1, #2e7ff1);
// //                     color: white;
// //                     border: none;
// //                     padding: 8px;
// //                     font-size: 0.75rem;
// //                     border-radius: 6px;
// //                     cursor: pointer;
// //                     margin-top: 8px;
// //                   ">
// //                   Learn More
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         `
// //       )
// //       .join("")}
// //   </div>
// //   <button id="next" style="
// //     position: absolute;
// //     right: 1px;
// //     background: white;
// //     border: 0px solid #ccc;
// //     border-radius: 50%;
// //     width: 25px;
// //     height: 25px;
// //     display: flex;
// //     align-items: center;
// //     justify-content: center;
// //     font-size: 1.5rem;
// //     cursor: pointer;
// //     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
// //   ">›</button>
// // </div>
// // `;
// // const items = window.global_element.querySelectorAll(
// //   ".carousel-item"
// // ) as NodeListOf<HTMLElement>;
// // let currentIndex = 0;
// // const showItem = (index: number) => {
// //   items.forEach((item, i) => {
// //     item.style.display = i === index ? "block" : "none";
// //   });
// // };
// // if (items.length > 0) showItem(currentIndex);
// // const prevBtn = window.global_element.querySelector(
// //   "#prev"
// // ) as HTMLButtonElement;
// // const nextBtn = window.global_element.querySelector(
// //   "#next"
// // ) as HTMLButtonElement;
// // if (prevBtn) {
// //   prevBtn.addEventListener("click", () => {
// //     currentIndex =
// //       (currentIndex - 1 + items.length) % items.length;
// //     showItem(currentIndex);
// //   });
// // }
// // if (nextBtn) {
// //   nextBtn.addEventListener("click", () => {
// //     currentIndex = (currentIndex + 1) % items.length;
// //     showItem(currentIndex);
// //   });
// // }
// // }
// // if (career_path === "known") {
// // console.log(program);
// // const response = await fetch(`${AI_MODEL_SERVICE}find_nursing/`, {
// //   method: "POST",
// //   headers: { "Content-Type": "application/json" },
// //   body: JSON.stringify({ category: program, top_k: 3 }),
// // });
// // const result = await response.json();
// // console.log(result);
// // setDialog(true)
// // window.renderComparisonWidget!(
// //   result.results[1],
// //   window.global_element,
// //   result
// // );
// // }





// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import React, { useEffect, createContext, useContext, useState } from "react";
// import { useAuthContext } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import { cn, fetchUserData } from "@/lib/utils";
// import { useApiClient } from "@/lib/useApiClient";
// import { ToastAction } from "@/components/ui/toast";
// import { toast } from "@/components/ui/use-toast";
// import * as Realm from "realm-web";

// // ---- Voiceflow Widget Hide/Show Utility ----
// function closeVoiceflowWidget() {
//   // Try Voiceflow chat API if present (not always available)
//   if (
//     window.voiceflow &&
//     window.voiceflow.chat &&
//     typeof window.voiceflow.chat.close === "function"
//   ) {
//     window.voiceflow.chat.close();
//   }
//   // Fallback: Hide the widget iframe visually
//   const vfIframe = document.querySelector('iframe[src*="voiceflow.com"]');
//   if (vfIframe) vfIframe.style.display = "none";
// }

// function showVoiceflowWidget() {
//   const vfIframe = document.querySelector('iframe[src*="voiceflow.com"]');
//   if (vfIframe) vfIframe.style.display = "block";
// }

// // ---- Context Setup ----
// const VoiceFlowContext = createContext(null);

// export const useVoiceFlow = () => useContext(VoiceFlowContext);

// const VoiceFlowProvider = ({ children }) => {
//   const {
//     app,
//     client,
//     user,
//     userData,
//     setUser,
//     setUserData,
//     setAuthenticated,
//     loadingAuth,
//     authenticated,
//   } = useAuthContext();

//   const userID = userData?.userID;
//   const { push } = useRouter();

//   // State to control dialog and closing permissions
//   const [dialog, setDialog] = useState(false);
//   const [canClose, setCanClose] = useState(false); // <-- controls close button

//   // Utility to handle errors via toast
//   const handleError = (error) => {
//     console.error("An error occurred:", error);
//     toast({
//       variant: "destructive",
//       className: cn(
//         "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
//       ),
//       description: error?.message || "An error occurred. Please try again.",
//       action: <ToastAction altText="Try again">Try again</ToastAction>,
//     });
//   };

//   // (You can keep your user registration logic here as needed)

//   // --------- Load Voiceflow Widget and Hook into Extensions ---------
//   useEffect(() => {
//     if (userData && userData.role === "provider") {
//       // do nothing
//     } else {
//       (function (d, t) {
//         const v = d.createElement(t);
//         const s = d.getElementsByTagName(t)[0];
//         v.onload = function () {
//           window.global_element = null;
//           window.selectedPrograms = [];
//           window.cardData = [];
//           const myUserID = userID || 121;

//           window.renderCarousel = async function (payload) {
//             // ...existing logic...
//             const { program, recommendation, career_path } = payload;
//             if (program === "AlliedHealthcare" || career_path !== "known") {
//               // Save to localStorage
//               const { data: collegeRecommendation } = await privateApi.post(
//                 `/api/v1/ai/college-recommendation/`,
//                 { program: recommendation }
//               );

//               const aiRecommendation = {
//                 ai_recommendation: recommendation,
//                 recommendations: collegeRecommendation,
//                 saved_at: new Date().toISOString(),
//               };
//               localStorage.setItem(
//                 "ai_recommendation",
//                 JSON.stringify(aiRecommendation)
//               );

//               // 1. Hide/close Voiceflow
//               closeVoiceflowWidget();
//               // 2. Open dialog (can't close)
//               setDialog(true);
//               setCanClose(false);
//             }
//           };

//           const FormExtension = {
//             name: "Forms",
//             type: "response",
//             match: ({ trace }) =>
//               trace.type === "Custom_Form" ||
//               trace.payload.name === "Custom_Form",
//             render: ({ trace, element }) => {
//               window.global_element = element;
//               const payload = trace.payload || {};
//               window.renderCarousel(payload);
//               window.voiceflow.chat.interact({
//                 type: "complete",
//                 payload: {
//                   college_selected: payload.program,
//                 },
//               });
//             },
//           };

//           window.voiceflow.chat.load({
//             verify: {
//               projectID: "6717a6c73a30d3122f94d79e",
//             },
//             url: "https://general-runtime.voiceflow.com",
//             versionID: "production",
//             assistant: {
//               extensions: [FormExtension],
//             },
//           });
//         };
//         v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
//         v.type = "text/javascript";
//         s.parentNode?.insertBefore(v, s);
//       })(document, "script");
//     }
//   }, [userID]);

//   // ---- Handler for successful signup (allow dialog close and restore chat) ----
//   const handleSignupSuccess = () => {
//     setCanClose(true); // User can now close dialog
//     setDialog(false); // Optionally auto-close dialog
//     setTimeout(() => showVoiceflowWidget(), 300); // Restore widget after a short delay
//   };

//   // ---- UI: Dialog Modal ----
//   return (
//     <VoiceFlowContext.Provider value={{ handleSignupSuccess }}>
//       {/* Dialog Overlay */}
//       {dialog && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl">
//           {/* Non-clickable backdrop */}
//           <div
//             className="absolute inset-0"
//             style={{ pointerEvents: "none" }}
//             aria-label="Close dialog"
//           />
//           {/* Dialog Box */}
//           <div
//             className={`
//               relative z-10 min-w-[340px] max-w-md w-full
//               rounded-2xl p-8 shadow-2xl
//               bg-white/50 border border-white/40
//               backdrop-blur-2xl flex flex-col gap-4
//               transition-all duration-200
//               scale-95 opacity-0
//               ${dialog ? "opacity-100 scale-100" : ""}
//             `}
//             role="dialog"
//             aria-modal="true"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Close Button (only if allowed) */}
//             <button
//               className={`absolute top-4 right-4 text-gray-800/70 hover:text-gray-900/90 text-xl transition-opacity ${
//                 canClose ? "opacity-100" : "opacity-30 pointer-events-none"
//               }`}
//               aria-label="Close"
//               onClick={() => {
//                 if (canClose) {
//                   setDialog(false);
//                   showVoiceflowWidget();
//                 }
//               }}
//               disabled={!canClose}
//             >
//               ×
//             </button>
//             {/* Title */}
//             <h3 className="text-2xl font-semibold text-gray-900 mb-2 drop-shadow-sm">
//               Finish your sign up
//             </h3>
//             {/* Content (your signup form or whatever you want here) */}
//             <div>
//               {/* Place your signup form here! */}
//               {/* After successful signup, call handleSignupSuccess() */}
//               <button
//                 className="px-4 py-2 rounded bg-blue-600 text-white mt-4"
//                 onClick={handleSignupSuccess}
//               >
//                 Mock Signup Complete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {children}
//     </VoiceFlowContext.Provider>
//   );
// };

// export default VoiceFlowProvider;
