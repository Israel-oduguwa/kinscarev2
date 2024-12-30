"use client";

import MongoContext from "@/app/MongoContext";
import React, { createContext, useContext, useEffect, useState } from "react";

declare global {
  interface Window {
    voiceflow: any;
  }
}


let global_element: HTMLElement | null = null;
let selectedPrograms: any[] = [];
const AI_MODEL_SERVICE = "https://excel-health-101882100979.us-central1.run.app/";

// Create a context to access the functions globally
const VoiceFlowContext = createContext<any>(null);

export const useVoiceFlow = () => useContext(VoiceFlowContext);

const VoiceFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData }: any = useContext(MongoContext); // Access user data from MongoContext
  const userID = userData?.userID;

  useEffect(() => {
    // Inject Voiceflow widget script
    (function (d, t) {
      const v = d.createElement(t) as HTMLScriptElement,
        s = d.getElementsByTagName(t)[0] as any;
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
                  trace.type === "Custom_Form" || trace.payload.name === "Custom_Form",
                render: ({ trace, element }: any) => {
                  global_element = element;
                  const { program, career_path } = trace.payload;
                  console.log("Custom Form Trace:", trace.payload);
                  renderCarousel(program, career_path, userID);
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
  }, [userID]); // Depend on `userID` to ensure it’s available

  // Function to render the program carousel
  const renderCarousel = async (program: string, career_path: string, userID: string) => {
    if (!global_element) return;

    const response = await fetch(`${AI_MODEL_SERVICE}find_alliance_healthcare/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: program || "AlliedHealthcare", top_k: 3 }),
    });
    const result = await response.json();

    global_element.innerHTML = `
      <div style="padding: 16px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="font-size: 18px; color: #333; margin-bottom: 16px;">Recommended Programs</h2>
        <div style="display: flex; overflow-x: auto; gap: 12px; padding: 8px;">
          ${result.results
            .map(
              (card: any, index: number) => `
            <div style="min-width: 240px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 16px;">
              <h3 style="font-size: 16px; color: #1e6bd8; margin-bottom: 8px;">${card.name}ss</h3>
              
              <button class="learn-more-button" 
                style="width: 100%; background: #1e6bd8; color: white; padding: 8px; border: none; border-radius: 4px; cursor: pointer;">
                Learn More
              </button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Add event listeners for "Learn More" buttons
    const items = global_element.querySelectorAll(".learn-more-button");
    items.forEach((button, index) => {
      button.addEventListener("click", () => {
        const card = result.results[index];
        renderProgramDetails(card.institution, card.name, card.application_contact.email, userID);
      });
    });
  };

  // Function to render program details
  const renderProgramDetails = (
    institution: string,
    programName: string,
    contact_person: string,
    userID: string
  ) => {
    if (!global_element) return;

    global_element.innerHTML = `
      <div style="padding: 16px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="font-size: 18px; color: #333; margin-bottom: 16px;">${institution}</h2>
        <h3 style="font-size: 16px; color: #1e6bd8; margin-bottom: 8px;">${programName}</h3>
        <p style="font-size: 14px; color: #555; margin-bottom: 16px;">
          <strong>Contact:</strong> ${contact_person}
        </p>
        <button id="create-plan-button" 
          style="width: 100%; background: #1e6bd8; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer;">
          Create Plan
        </button>
      </div>
    `;

    // Add event listener for "Create Plan" button
    const button = global_element.querySelector("#create-plan-button");
    button?.addEventListener("click", () => createPlan(institution, programName, userID));
  };

  // Function to create a plan
  const createPlan = (institution: string, programName: string, userID: string) => {
    if (!global_element) return;

    global_element.innerHTML = `
      <div style="padding: 16px; background: #f1f5f9; border-radius: 8px;">
        <h2 style="text-align: center; font-size: 18px; color: #007bff;">Course Plan for ${institution}</h2>
        <div style="margin-top: 16px;">
          <h3 style="font-size: 16px; color: #333;">Quarter 1</h3>
          <ul style="padding-left: 20px;">
            <li>Biology</li>
            <li>Statistics</li>
            <li>Anatomy & Physiology II</li>
          </ul>
        </div>
        <div style="margin-top: 16px;">
          <h3 style="font-size: 16px; color: #333;">Quarter 2</h3>
          <ul style="padding-left: 20px;">
            <li>Anatomy & Physiology I</li>
            <li>Microbiology</li>
            <li>Anatomy & Physiology II</li>
          </ul>
        </div>
        <div style="margin-top: 16px;">
          <h3 style="font-size: 16px; color: #333;">Quarter 3</h3>
          <ul style="padding-left: 20px;">
            <li>Chemistry</li>
            <li>Anatomy & Physiology I</li>
            <li>Anatomy & Physiology II</li>
          </ul>
        </div>
        <button id="save-program-button" 
          style="margin-top: 16px; width: 100%; background: #1e6bd8; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer;">
          Save Program
        </button>
      </div>
    `;

    const button = global_element.querySelector("#save-program-button");
    button?.addEventListener("click", () => saveProgram(institution, programName, userID));
  };

  // Function to save a program
  const saveProgram = async (institution: string, programName: string, userID: string) => {
    try {
      const payload = {
        userID: userID,
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
      console.log(result);

      // Show success message in the chat window
      if (global_element) {
        global_element.innerHTML += `
          <div style="margin-top: 16px; padding: 12px; background: #d4edda; color: #155724; border-radius: 4px;">
            🎉 Your plan has been saved successfully!
          </div>
        `;
      }
    } catch (error) {
      console.error("Error saving program:", error);

      // Show error message
      if (global_element) {
        global_element.innerHTML += `
          <div style="margin-top: 16px; padding: 12px; background: #f8d7da; color: #721c24; border-radius: 4px;">
            ❌ Failed to save your plan. Please try again.
          </div>
        `;
      }
    }
  };

  return (
    <VoiceFlowContext.Provider value={{ renderCarousel, renderProgramDetails, createPlan, saveProgram }}>
      {children}
    </VoiceFlowContext.Provider>
  );
};

export default VoiceFlowProvider;
