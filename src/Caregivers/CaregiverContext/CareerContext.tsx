"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// Work experience interface
interface WorkExperience {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}

// Career state interface
interface CareerState {
  coursePlan: {
    hasStarted: boolean;
    isCompleted: boolean;
    totalPoints: number;
    steps: {
      addLicense: { completed: boolean; points: number };
      addPrerequisites: { completed: boolean; points: number };
      addRequirements: { completed: boolean; points: number };
      shareOnSocial: { completed: boolean; points: number };
      emailCounselor: { completed: boolean; points: number };
      giveFeedback: { completed: boolean; points: number };
    };
  };
  workExperience: {
    experiences: WorkExperience[];
    hasStarted: boolean;
    isCompleted: boolean;
    totalPoints: number;
  };
  inviteFriends: {
    hasStarted: boolean;
    isCompleted: boolean;
    totalPoints: number;
    steps: {
      firstInvite: { completed: boolean; points: number };
      secondInvite: { completed: boolean; points: number };
      thirdInvite: { completed: boolean; points: number };
      additionalInvites: { completed: boolean; points: number };
      shareOnSocial: { completed: boolean; points: number };
    };
  };
  referEmployer: {
    hasStarted: boolean;
    isCompleted: boolean;
    totalPoints: number;
    steps: {
      firstReferral: { completed: boolean; points: number };
      secondReferral: { completed: boolean; points: number };
      thirdReferral: { completed: boolean; points: number };
      additionalReferrals: { completed: boolean; points: number };
    };
  };
}

// Default career state
const defaultCareerState: CareerState = {
  coursePlan: {
    hasStarted: false,
    isCompleted: false,
    totalPoints: 0,
    steps: {
      addLicense: { completed: false, points: 15 },
      addPrerequisites: { completed: false, points: 35 },
      addRequirements: { completed: false, points: 15 },
      shareOnSocial: { completed: false, points: 5 },
      emailCounselor: { completed: false, points: 20 },
      giveFeedback: { completed: false, points: 10 },
    },
  },
  workExperience: {
    experiences: [],
    hasStarted: false,
    isCompleted: false,
    totalPoints: 0,
  },
  inviteFriends: {
    hasStarted: false,
    isCompleted: false,
    totalPoints: 0,
    steps: {
      firstInvite: { completed: false, points: 15 },
      secondInvite: { completed: false, points: 15 },
      thirdInvite: { completed: false, points: 15 },
      additionalInvites: { completed: false, points: 5 },
      shareOnSocial: { completed: false, points: 10 },
    },
  },
  referEmployer: {
    hasStarted: false,
    isCompleted: false,
    totalPoints: 0,
    steps: {
      firstReferral: { completed: false, points: 25 },
      secondReferral: { completed: false, points: 25 },
      thirdReferral: { completed: false, points: 25 },
      additionalReferrals: { completed: false, points: 5 },
    },
  },
};

// Create the Career context
const CareerContext = createContext<{
  careerState: CareerState;
  setCareerState: React.Dispatch<React.SetStateAction<CareerState>>;
  updateWorkExperience: (
    workExperienceData: CareerState["workExperience"]
  ) => void; // Function to update entire work experience
  updateCareerField: <K extends keyof CareerState>(
    key: K,
    value: CareerState[K]
  ) => void; // General method
} | null>(null);

// Custom hook to use Career context
export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error("useCareer must be used within a CareerProvider");
  }
  return context;
};

// Provider to manage career state
export const CareerProvider = ({ children }: { children: ReactNode }) => {
  const [careerState, setCareerState] =
    useState<CareerState>(defaultCareerState);

  // Update the entire work experience state at once
  const updateWorkExperience = (
    workExperienceData: CareerState["workExperience"]
  ) => {
    setCareerState((prevState) => ({
      ...prevState,
      workExperience: workExperienceData,
    }));
  };

  // General method to update any field in the career state
  const updateCareerField = <K extends keyof CareerState>(
    key: K,
    value: CareerState[K]
  ) => {
    setCareerState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <CareerContext.Provider
      value={{
        careerState,
        setCareerState,
        updateWorkExperience,
        updateCareerField,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};
