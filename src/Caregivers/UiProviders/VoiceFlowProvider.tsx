"use client";

import MongoContext from "@/app/MongoContext";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create a context for global access
const VoiceFlowContext = createContext<any>(null);

export const useVoiceFlow = () => useContext(VoiceFlowContext);

const AI_MODEL_SERVICE =
  "https://excel-health-101882100979.us-central1.run.app/";

const VoiceFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [globalElement, setGlobalElement] = useState<HTMLElement | null>(null);
  const { userData }: any = useContext(MongoContext);
  const pathname = usePathname();
  useEffect(() => {
    // Inject Voiceflow Script
    (function (d, t) {
      const v = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
      v.onload = function () {
        window.voiceflow.chat.load({
          verify: { projectID: "6717a6c73a30d3122f94d79e" },
          url: "https://general-runtime.voiceflow.com",
          versionID: "production",
          assistant: {
            extensions: [
              {
                name: "Forms",
                type: "response",
                match: ({ trace }: any) =>
                  trace.type === "Custom_Form" ||
                  trace.payload.name === "Custom_Form",
                render: ({ trace, element }: any) => {
                  setGlobalElement(element);
                  const { program, career_path } = trace.payload;
                  console.log("Custom Form Trace:", trace.payload);
                  renderCarousel(program, career_path);
                },
              },
            ],
          },
        });
      };
      v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
      v.type = "text/javascript";
      s.parentNode.insertBefore(v, s);
    })(document, "script");
  }, []);

  // Render Carousel
  const renderCarousel = async (program: string, career_path: string) => {
    const response = await fetch(
      `${AI_MODEL_SERVICE}find_alliance_healthcare/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: program, top_k: 3 }),
      }
    );
    const result = await response.json();

    if (!globalElement) return;

    globalElement.innerHTML = `
      <div class="carousel" style="display: flex; overflow-x: scroll; padding: 20px;">
        ${result.results
          .map(
            (card: any) => `
          <div class="carousel-item" style="margin: 10px;">
            <h3>${card.name}</h3>
            <button onclick="renderProgramDetails('${card.institution}', '${card.name}', '${card.application_contact.email}')">
              Learn More
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  // Render Program Details
  const renderProgramDetails = (
    institution: string,
    programName: string,
    contactPerson: string
  ) => {
    if (!globalElement) return;

    globalElement.innerHTML = `
      <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="text-align: center; margin-bottom: 20px;">${institution}</h2>
        <h4>${programName}</h4>
        <div>
          <p style="font-size: 12px; color: grey; margin:0%; text-align: left;">
            <strong style="color: #434343;">Contact information:</strong> ${contactPerson}
          </p>
        </div>
        <button onclick="createPlan('${institution}', '${programName}')"
          style="padding: 10px 20px; background: #1e6bd8; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Create Plan
        </button>
      </div>
    `;
  };

  // Save Program
  const saveProgram = async (institution: string, programName: string) => {
    try {
      const payload = {
        userID: 121,
        recommendation: [{ title: programName, institution }],
      };

      const response = await fetch(
        "https://api.kinscare.org/api/v1/caregivers/save-recommendation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      console.log("Save Success:", result);
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  // Provider Value
  const value = {
    renderCarousel,
    renderProgramDetails,
    saveProgram,
  };

  return (
    <VoiceFlowContext.Provider value={value}>
      {children}
    </VoiceFlowContext.Provider>
  );
};

export default VoiceFlowProvider;
