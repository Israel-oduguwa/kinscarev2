"use client";

import React, { useEffect, createContext, useContext } from "react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import { cn, fetchUserData } from "@/lib/utils";
import axios from "axios";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import * as Realm from "realm-web";

declare global {
  interface Window {
    voiceflow: {
      chat: {
        load: (config: any) => void;
        interact: (payload: any) => void;
        global_element:any
      };
    };
    renderProgramDetails?: (
      institution: string,
      programName: string,
      contact_person: string,
      userID: string
    ) => void;
    createPlan?: (
      institution: string,
      programName: string,
      userID: string
    ) => void;
    saveProgram?: (
      institution: string,
      programName: string,
      userID: string
    ) => void;
    renderComparisonWidget?: (
      card: any,
      global_elementParam: HTMLElement,
      result: any
    ) => void;
    renderTabContent?: (data: any, result: any) => string;
    renderCarousel?: (program: string, career_path: string) => Promise<void>;
    global_element?: HTMLElement | null;
    selectedPrograms?: any[];
    cardData?: any[];
    handleSignUpClick?: (
      institution: string,
      programName: string,
      userID: string
    ) => Promise<void>;
  }
}

const VoiceFlowContext = createContext<any>(null);

export const useVoiceFlow = () => useContext(VoiceFlowContext);

const VoiceFlowProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    app,
    client,
    user,
    userData,
    setUser,
    setUserData,
    setAuthenticated,
    loadingAuth,
    authenticated,
  }: any = useContext(MongoContext);

  const userID = userData?.userID;
  const { push } = useRouter();

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast({
      variant: "destructive",
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
      ),
      description: error?.message || "An error occurred. Please try again.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  const createUserDuringRegistration = async (payload: object) => {
    try {
      const response = await axios.get("/api/ip");
      if (response.data) {
        const {
          ip,
          city,
          latitude,
          longitude,
          country_code,
          region_name,
          zip,
        } = response.data;
        Object.assign(payload, {
          route: "Regular",
          userIp: ip,
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
        });
        const createUser = await axios.post(
          "https://api.kinscare.org/api/v1/auth/create_user",
          payload
        );
        console.log(createUser);
        setAuthenticated(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (userData && userData.role === "provider") {
      console.log(`You are a an employer find good caregivers`);
    } else {
      (function (d: Document, t: string) {
        const v = d.createElement(t) as HTMLScriptElement;
        const s = d.getElementsByTagName(t)[0] as HTMLScriptElement;
        v.onload = function () {
          window.global_element = null;
          window.selectedPrograms = [];
          window.cardData = [];
          const myUserID: number | string = userID || 121;

          window.renderProgramDetails = function (
            institution: string,
            programName: string,
            contact_person: string,
            userID: string
          ) {
            const programDetails = {
              name: institution,
              details: `
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Next session:</strong> November 23, 2024
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Application period:</strong> Dec 14, 2024 - Jan 04, 2025
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Prerequisite courses:</strong> 8
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Intakes per year:</strong> 3
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Acceptance rate:</strong> 8%
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Costs:</strong> $4321 per quarter
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Length of training:</strong> 6 quarters
              </p>
              <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                <strong style="color: #434343;">Contact information:</strong>
                ${contact_person}
              </p>
            `,
            };
            if (!window.global_element) return;
            window.global_element.innerHTML = `
            <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
              <h2 style="text-align: center; margin-bottom: 20px;">${programDetails.name}</h2>
              <h4>${programName}</h4>
              <div>${programDetails.details}</div>
              <button onclick="createPlan('${programDetails.name}','${programName}','${userID}')" 
                      style="padding: 10px 20px; background: #1e6bd8; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                Create Plan
              </button>
            </div>
          `;
          };

          window.createPlan = function (
            institution: string,
            programName: string,
            userID: string
          ) {
            if (!window.global_element) return;
            window.global_element.innerHTML = `
            <div style="background-color: #007bff; color: white; text-align: center; padding: 20px; font-size: 14px;">
              Course Plan for ${institution}
            </div>
            <div style="margin: 20px auto; max-width: 600px; background-color: white; border-radius: 8px; 
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px;">
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 6px;">
                <h3 style="margin: 0 0 10px; font-size: 18px; color: #333;">Quarter 1</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="font-size: 16px; margin-bottom: 5px;">Biology</li>
                  <li style="font-size: 16px; margin-bottom: 5px;">Statistics</li>
                  <li style="font-size: 16px; margin-bottom: 5px;">Anatomy &amp; Physiology II</li>
                </ul>
              </div>
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 6px;">
                <h3 style="margin: 0 0 10px; font-size: 18px; color: #333;">Quarter 2</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="font-size: 16px; margin-bottom: 5px;">Anatomy &amp; Physiology I</li>
                  <li style="font-size: 16px; margin-bottom: 5px;">Microbiology</li>
                  <li style="font-size: 16px; margin-bottom: 5px;">Anatomy &amp; Physiology II</li>
                </ul>
              </div>
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 6px;">
                <h3 style="margin: 0 0 10px; font-size: 18px; color: #333;">Quarter 3</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="font-size: 16px; margin-bottom: 5px;">Chemistry</li>
                  <li style="font-size: 16px; margin-bottom: 5px;">Anatomy &amp; Physiology I</li>
                  <li style="font-size: 16px; margin-bottom: 5px;">Anatomy &amp; Physiology II</li>
                </ul>
              </div>
              <div style="text-align:center;">
                <button onclick="saveProgram('${institution}','${programName}','${userID}')" 
                        style="padding: 10px 20px; background: #1e6bd8; color: white; border: none; 
                               border-radius: 5px; cursor: pointer; margin-top: 20px;">
                  Save Program
                </button>
              </div>
            </div>
          `;
          };

          window.saveProgram = function (
            institution: string,
            programName: string,
            userID: string
          ) {
            if (!window.global_element) return;
            window.global_element.innerHTML += `
              <div style="background-color: white; padding: 20px; border-radius: 10px; 
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); width: 100%; max-width: 300px; margin: auto; font-family: Arial, sans-serif;">
      <h4 style="margin: 0 0 20px; text-align: center; color: #333; font-size: 18px;">Sign Up to Continue</h4>
      <div id="error-message" style="color: red; margin-bottom: 10px; font-size: 14px; display: none; text-align: center;"></div>
      <label for="firstName" style="font-size: 12px; color: #888;">First Name</label>
      <input 
        id="firstName"
        type="text" 
        name="fname" 
        placeholder="Enter your first name" 
        required
        style="width: 100%; border: none; border-bottom: 1px solid #ccc; background: transparent; margin: 5px 0; padding: 8px 0; font-size: 14px; box-sizing: border-box; outline: none;"
      />
      <label for="lastName" style="font-size: 12px; color: #888;">Last Name</label>
      <input 
        id="lastName"
        type="text" 
        name="lname" 
        placeholder="Enter your last name" 
        required
        style="width: 100%; border: none; border-bottom: 1px solid #ccc; background: transparent; margin: 5px 0; padding: 8px 0; font-size: 14px; box-sizing: border-box; outline: none;"
      />
      <label for="phoneInput" style="font-size: 12px; color: #888;">Phone Number</label>
      <input 
        id="phoneInput"
        type="tel" 
        name="phone" 
        placeholder="Enter your phone number" 
        required
        style="width: 100%; border: none; border-bottom: 1px solid #ccc; background: transparent; margin: 5px 0; padding: 8px 0; font-size: 14px; box-sizing: border-box; outline: none;"
      />
      <label for="emailInput" style="font-size: 12px; color: #888;">Email</label>
      <input 
        id="emailInput"
        type="email" 
        name="another" 
        placeholder="Enter your email" 
        required
        style="width: 100%; border: none; border-bottom: 1px solid #ccc; background: transparent; margin: 5px 0; padding: 8px 0; font-size: 14px; box-sizing: border-box; outline: none;"
      />
      <label for="passwordInput" style="font-size: 12px; color: #888;">Password</label>
      <input 
        id="passwordInput"
        type="password" 
        name="password" 
        placeholder="Enter your password" 
        required
        style="width: 100%; border: none; border-bottom: 1px solid #ccc; background: transparent; margin: 5px 0; padding: 8px 0; font-size: 14px; box-sizing: border-box; outline: none;"
      />
      <label for="confirmPasswordInput" style="font-size: 12px; color: #888;">Confirm Password</label>
      <input 
        id="confirmPasswordInput"
        type="password" 
        name="password" 
        placeholder="Confirm your password" 
        required
        style="width: 100%; border: none; border-bottom: 1px solid #ccc; background: transparent; margin: 5px 0; padding: 8px 0; font-size: 14px; box-sizing: border-box; outline: none;"
      />
      <div id="loading-spinner" style="display: none; text-align: center; margin: 20px 0;">
        <div style="width: 24px; height: 24px; border: 4px solid #ccc; border-top: 4px solid #0a73fa; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      </div>
      <button 
        id="continueButton"
        type="button" 
        onclick="handleSignUpClick('${institution}','${programName}', '${userID}')"
        style="width: 100%; background: linear-gradient(to right, #2e6ee1, #2e7ff1); color: white; padding: 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; box-sizing: border-box; margin-top: 10px;"
      >
        Continue
      </button>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      input:focus {
        outline: none;
        border-bottom-color: #0a73fa;
        box-shadow: 0 1px 0 rgba(10, 115, 250, 0.5);
      }
      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    </style>
            `;

            const firstNameInput = window.global_element.querySelector(
              "#firstName"
            ) as HTMLInputElement;
            const lastNameInput = window.global_element.querySelector(
              "#lastName"
            ) as HTMLInputElement;
            const phoneInput = window.global_element.querySelector(
              "#phoneInput"
            ) as HTMLInputElement;
            const emailInput = window.global_element.querySelector(
              "#emailInput"
            ) as HTMLInputElement;
            const passwordInput = window.global_element.querySelector(
              "#passwordInput"
            ) as HTMLInputElement;
            const confirmPasswordInput = window.global_element.querySelector(
              "#confirmPasswordInput"
            ) as HTMLInputElement;
            const continueButton = window.global_element.querySelector(
              "#continueButton"
            ) as HTMLButtonElement;

            const showError = (message: string) => {
              const errorMessage = window.global_element.querySelector(
                "#error-message"
              ) as HTMLElement;
              if (errorMessage) {
                errorMessage.innerText = message;
                errorMessage.style.display = "block";
              }
            };

            const showLoading = (show: boolean) => {
              const spinner = window.global_element.querySelector(
                "#loading-spinner"
              ) as HTMLElement;
              if (spinner) spinner.style.display = show ? "block" : "none";
              if (continueButton) continueButton.disabled = show;
            };

            (window as any).handleSignUpClick = async function (
              institution: string,
              programName: string,
              userID: string
            ) {
              try {
                const phone = phoneInput.value.trim();
                const lname = lastNameInput.value.trim();
                const fname = firstNameInput.value.trim();
                const email = emailInput.value.trim().toLowerCase();
                const password = passwordInput.value.trim();
                const confirmPassword = confirmPasswordInput.value.trim();

                if (password !== confirmPassword) {
                  showError("Passwords do not match.");
                  return;
                }

                showLoading(true);
                await app.emailPasswordAuth.registerUser({ email, password });
                const credentials = Realm.Credentials.emailPassword(
                  email,
                  password
                );
                const userObj = await app.logIn(credentials);

                const existingUser = await client
                  ?.db("kinshealth")
                  .collection("contacts")
                  .findOne({
                    userID: userObj.id,
                    email: userObj.profile.email,
                  });

                if (!existingUser) {
                  if (app.currentUser) {
                    const payload = {
                      tel: phone,
                      role: "caregiver",
                      fname: fname,
                      lname: lname,
                      userID: app.currentUser.id,
                      email,
                      auth_mode: "local-userpass",
                    };
                    await createUserDuringRegistration(payload);
                    const userID = app.currentUser.id;
                    const emails = app.currentUser.email;
                    const savePayload = {
                      userID: userID,
                      recommendation: [{ title: programName, institution }],
                    };
                    const response = await fetch(
                      "https://api.kinscare.org/api/v1/caregivers/save-recommendation",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(savePayload),
                      }
                    );
                    const result = await response.json();
                    console.log(result);
                    const user_data: any = await fetchUserData(userID, emails);
                    if (user_data) {
                      setUserData(user_data.result);
                      app.currentUser.refreshCustomData();
                      push("/vitae/career-plan");
                    }
                  }
                } else {
                  const user_data: any = await fetchUserData(
                    userObj.id,
                    userObj.profile.email
                  );
                  if (user_data) {
                    setUserData(user_data.result);
                    setAuthenticated(true);
                    app.currentUser.refreshCustomData();
                    push("/vitae/career-plan");
                  }
                }

                if (window.global_element) {
                  window.global_element.innerHTML += `
                  <div style="margin-top: 16px; padding: 12px; background: #d4edda; color: #155724; border-radius: 4px;">
                    🎉 Your plan has been saved successfully!
                  </div>
                `;
                }
              } catch (error: any) {
                handleError(error);
                if (window.global_element) {
                  window.global_element.innerHTML += `
                  <div style="margin-top: 16px; padding: 12px; background: #f8d7da; color: #721c24; border-radius: 4px;">
                    ❌ Failed to save your plan: ${
                      error?.message || "Unknown error"
                    }.
                  </div>
                `;
                }
              } finally {
                showLoading(false);
              }
            };
          };

          window.renderTabContent = function (data: any, result: any): string {
            if (!data) return "";
            return `
            <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
              <strong style="color: #434343;">Median Salary:</strong> ${
                data.starting_salary ?? "N/A"
              }
            </p>
            <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
              <strong style="color: #434343;">Description:</strong> ${
                data.program_name ?? ""
              }
            </p>
            <p onclick="renderProgramDetails('${data.institution}','${
              data.program_name
            }','${data.contact_person}')"
               style="font-size: 12px; width: 100%; padding: 4px; background: #D9D9D9; color: black; border: none; 
                      border-radius: 2px; cursor: pointer;">
              <strong>View local programs:</strong> ${data.institution ?? ""}
            </p>
          `;
          };

          window.renderComparisonWidget = function (
            card: any,
            global_elementParam: HTMLElement,
            result: any
          ) {
            window.selectedPrograms![0] = card;
            if (!global_elementParam) return;
            const data = result.results || [];
            global_elementParam.innerHTML = `
            <div style="padding: 20px; background: #fff; border-radius: 8px;">
              <h4 style="font-size: 13px; margin-bottom: 20px;">Profession Comparison</h4>
              <div style="display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px;">
                <button id="tab1" style="border-radius: 2px; flex: 1; padding: 10px; background: #2e6ee1; 
                        color: white; border: none; cursor: pointer; font-size: 12px; font-weight: bold;">
                  ${data[0]?.program_name || "Option 1"}
                </button>
                <button id="tab2" style="flex: 1; padding: 10px; background: #f9f9f9; color: #333; border: none; 
                        cursor: pointer; font-size: 12px;">
                  ${data[1]?.program_name || "Option 2"}
                </button>
              </div>
              <div id="tab-content" style="padding: 10px;">
                ${window.renderTabContent!(data[0], data)}
              </div>
            </div>
          `;
            const tab1 = global_elementParam.querySelector(
              "#tab1"
            ) as HTMLButtonElement;
            const tab2 = global_elementParam.querySelector(
              "#tab2"
            ) as HTMLButtonElement;
            const tabContent = global_elementParam.querySelector(
              "#tab-content"
            ) as HTMLElement;
            if (tab1 && tab2 && tabContent) {
              tab1.addEventListener("click", () => {
                tab1.style.background = "#2e6ee1";
                tab1.style.color = "white";
                tab2.style.background = "#f9f9f9";
                tab2.style.color = "#333";
                tabContent.innerHTML = window.renderTabContent!(data[0], data);
              });
              tab2.addEventListener("click", () => {
                tab2.style.background = "#2e6ee1";
                tab2.style.color = "white";
                tab1.style.background = "#f9f9f9";
                tab1.style.color = "#333";
                tabContent.innerHTML = window.renderTabContent!(data[1], data);
              });
            }
          };

          window.renderCarousel = async function (
            program: string,
            career_path: string
          ) {
            if (!window.global_element) return;
            const AI_MODEL_SERVICE =
              "https://excel-health-101882100979.us-central1.run.app/";
            let cardDataLocal: any[] = [];
            if (program === "AlliedHealthcare" || career_path !== "known") {
              const response_alliance = await fetch(
                `${AI_MODEL_SERVICE}find_alliance_healthcare/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    category: program || "AlliedHealthcare",
                    top_k: 3,
                  }),
                }
              );
              const result_alliance = await response_alliance.json();
              console.log(result_alliance);
              cardDataLocal = result_alliance.results;
              window.cardData = cardDataLocal;
            }
            if (career_path !== "known") {
              window.global_element.innerHTML = `
              <div class="carousel-container" style="position: relative; display: flex; align-items: center; 
                                                      justify-content: center; width: 100%; background-color: #f9f9f9; 
                                                      border-radius: 10px; overflow: scroll;">
                <button id="prev" style="
                  position: absolute;
                  left: 1px;
                  background: white;
                  border: 0px solid #ccc;
                  border-radius: 50%;
                  width: 25px;
                  height: 25px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 1.5rem;
                  cursor: pointer;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                ">‹</button>
                <div class="carousel" style="text-align: center;">
                  ${cardDataLocal
                    .map(
                      (card) => `
                        <div class="carousel-item" style="width: 250px; border: 0px solid #ccc; border-radius: 10px; 
                                                          padding: 8px; background-color: transparent; display: none;">
                          <div style="border-radius: 12px; background-color:white; width: 200px; margin-left:8%; 
                                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); padding: 10px;">
                            <h3 style=" font-size: 18px; margin:0%; text-align: left; color:#1e6bd8;">${
                              card.name
                            }</h3>
                            <br/>
                            <p style=" font-size: 12px; color: grey; margin:0%; text-align: left;">
                              <strong style="color: #434343;"> Requirements: </strong> ${
                                card.course_prerequisites?.substring(0, 90) ||
                                ""
                              }
                            </p>
                            
                            <div style="text-align:right;">
                              <button class="learn-more" 
                                onclick="renderProgramDetails('${
                                  card.institution
                                }','${card.name}','${
                        card.application_contact?.name
                      } ${card.application_contact?.email}')"
                                style="
                                  background: linear-gradient(to right, #2e6ee1, #2e7ff1);
                                  color: white;
                                  border: none;
                                  padding: 8px;
                                  font-size: 0.75rem;
                                  border-radius: 6px;
                                  cursor: pointer;
                                  margin-top: 8px;
                                ">
                                Learn More
                              </button>
                            </div>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
                <button id="next" style="
                  position: absolute;
                  right: 1px;
                  background: white;
                  border: 0px solid #ccc;
                  border-radius: 50%;
                  width: 25px;
                  height: 25px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 1.5rem;
                  cursor: pointer;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                ">›</button>
              </div>
            `;
              const items = window.global_element.querySelectorAll(
                ".carousel-item"
              ) as NodeListOf<HTMLElement>;
              let currentIndex = 0;
              const showItem = (index: number) => {
                items.forEach((item, i) => {
                  item.style.display = i === index ? "block" : "none";
                });
              };
              if (items.length > 0) showItem(currentIndex);
              const prevBtn = window.global_element.querySelector(
                "#prev"
              ) as HTMLButtonElement;
              const nextBtn = window.global_element.querySelector(
                "#next"
              ) as HTMLButtonElement;
              if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                  currentIndex =
                    (currentIndex - 1 + items.length) % items.length;
                  showItem(currentIndex);
                });
              }
              if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                  currentIndex = (currentIndex + 1) % items.length;
                  showItem(currentIndex);
                });
              }
            }
            if (career_path === "known") {
              const response = await fetch(`${AI_MODEL_SERVICE}find_nursing/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: program, top_k: 3 }),
              });
              const result = await response.json();
              console.log(result);
              window.renderComparisonWidget!(
                result.results[1],
                window.global_element,
                result
              );
            }
          };

          const FormExtension = {
            name: "Forms",
            type: "response",
            match: ({ trace }: any) =>
              trace.type === "Custom_Form" ||
              trace.payload.name === "Custom_Form",
            render: ({ trace, element }: any) => {
              window.global_element = element;
              const { program, career_path } = trace.payload || {};
              window.renderCarousel!(program, career_path);
              window.voiceflow.chat.interact({
                type: "complete",
                payload: {
                  college_selected: program,
                },
              });
            },
          };

          window.voiceflow.chat.load({
            verify: {
              projectID: "6717a6c73a30d3122f94d79e",
            },
            url: "https://general-runtime.voiceflow.com",
            versionID: "production",
            assistant: {
              extensions: [FormExtension],
            },
          });
        };
        v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
        v.type = "text/javascript";
        s.parentNode?.insertBefore(v, s);
      })(document, "script");
    }
  }, [userID]);

  return (
    <VoiceFlowContext.Provider value={{}}>{children}</VoiceFlowContext.Provider>
  );
};

export default VoiceFlowProvider;
