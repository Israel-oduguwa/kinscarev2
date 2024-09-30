"use client";
import EmblaCarousel from "@/components/Carousel/CarouselContents";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";

const NurseRN: any = ({ openDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "Optometrist",
      slug: "optometrist",
    },
  ];
  return (
    <div className="rounded-xl  border bg-white border-gray-100 shadow-lg p-10 ">
      <h2 className="text-2xl font-bold mb-4 antialiased text-gray-900">
        Nurse RN
      </h2>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $44 - $50
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            // onClick={() => openProgramModal(localPrograms[idx])}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Length of Training:</strong> 2 years
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Degree Type:</strong> Associate Degree
      </p>
      <Button
        onClick={() => openDialog("nurse-rn")}
        variant="default"
        size="sm"
      >
        Learn More
      </Button>
    </div>
  );
};
const Optometrist: any = ({ openDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "Optometrist",
      slug: "optometrist",
    },
  ];
  return (
    <div className="rounded-xl  border bg-white border-gray-100 shadow-lg p-10 ">
      <h2 className="text-2xl font-bold mb-4 antialiased text-gray-900">
        Optometrist
      </h2>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $48 - $58
      </p>

      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            // onClick={() => openProgramModal(localPrograms[idx])}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Length of Training:</strong> 4 years
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Degree Type:</strong> Bachelor of science
      </p>
      <Button
        onClick={() => openDialog("optometrist")}
        variant="default"
        size="sm"
      >
        Learn More
      </Button>
    </div>
  );
};
const RespiratoryTech: any = ({ openDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "Optometrist",
      slug: "optometrist",
    },
  ];
  return (
    <div className="rounded-xl  border bg-white border-gray-100 shadow-lg p-10 ">
      <h2 className="text-2xl font-bold mb-4 antialiased text-gray-900">
        Respiratory Technician
      </h2>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $38 - $44
      </p>

      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            // onClick={() => openProgramModal(localPrograms[idx])}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Length of Training:</strong> 1 year
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Degree Type:</strong> Associate Degree
      </p>
      <Button
        onClick={() => openDialog("respiratory-technician")}
        variant="default"
        size="sm"
      >
        Learn More
      </Button>
    </div>
  );
};
const SurgicalTech: any = ({ openDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "Optometrist",
      slug: "optometrist",
    },
  ];
  return (
    <div className="rounded-xl  border bg-white border-gray-100 shadow-lg p-10 ">
      <h2 className="text-2xl font-bold mb-4 antialiased text-gray-900">
        Surgical Technician
      </h2>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $48 - $58
      </p>

      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            // onClick={() => openProgramModal(localPrograms[idx])}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Length of Training:</strong> 4 years
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Degree Type:</strong> Bachelor of Science
      </p>
      <Button
        onClick={() => openDialog("surgical-technician")}
        variant="default"
        size="sm"
      >
        Learn More
      </Button>
    </div>
  );
};

const SurgicalTechDialog: any = ({ openDialog, openProgramDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "X Ray Technician",
      slug: "x-ray-technician",
    },
  ];
  const localPrograms = [
    { name: "Bellevue College", slug: "bellevue-college" },
    { name: "Shoreline College", slug: "shoreline-college" },
    { name: "Renton Technical College", slug: "renton-technical-college" },
    { name: "Bates College", slug: "bates-college" },
  ];
  return (
    <div>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $48 - $58
      </p>

      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            onClick={() => openDialog(sim.slug)}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Length of Training:</strong> 4 years
      </p>
      <p className="text-gray-700 text-sm mb-4">
        <strong>Degree Type:</strong> Bachelor of Science
      </p>
      <p className="text-md sm:text-lg font-medium mb-3 text-gray-800">
        Explore Local Programs
      </p>
      <div className="flex flex-wrap gap-3">
        {localPrograms.map((program, idx) => (
          <button
            onClick={() => {
              openProgramDialog(program.slug);
            }}
            key={idx}
            className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
          >
            <Plus size={16} strokeWidth={2} /> {program.name}
          </button>
        ))}
      </div>
    </div>
  );
};
const NurseRNDialog: any = ({ openDialog, openProgramDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "X Ray Technician",
      slug: "x-ray-technician",
    },
  ];
  const localPrograms = [
    { name: "Bellevue College", slug: "bellevue-college" },
    { name: "Shoreline College", slug: "shoreline-college" },
    { name: "Renton Technical College", slug: "renton-technical-college" },
    { name: "Bates College", slug: "bates-college" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 antialiased text-gray-900">
        Nurse RN
      </h2>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $44 - $50
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            // onClick={() => openProgramModal(localPrograms[idx])}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Length of Training:</strong> 2 years
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Degree Type:</strong> Associate Degree
      </p>
      <p className="text-md sm:text-lg font-medium mb-3 text-gray-800">
        Explore Local Programs
      </p>
      <div className="flex flex-wrap gap-3">
        {localPrograms.map((program, idx) => (
          <button
            onClick={() => {
              openProgramDialog(program.slug);
            }}
            key={idx}
            className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
          >
            <Plus size={16} strokeWidth={2} /> {program.name}
          </button>
        ))}
      </div>
    </div>
  );
};
const RespiratoryTechDialog: any = ({ openDialog, openProgramDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "X Ray Technician",
      slug: "x-ray-technician",
    },
  ];
  const localPrograms = [
    { name: "Bellevue College", slug: "bellevue-college" },
    { name: "Shoreline College", slug: "shoreline-college" },
    { name: "Renton Technical College", slug: "renton-technical-college" },
    { name: "Bates College", slug: "bates-college" },
  ];
  return (
    <div>
    
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $38 - $44
      </p>

      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            // onClick={() => openProgramModal(localPrograms[idx])}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Length of Training:</strong> 1 year
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Degree Type:</strong> Associate Degree
      </p>
      <p className="text-md sm:text-lg font-medium mb-3 text-gray-800">
        Explore Local Programs
      </p>
      <div className="flex flex-wrap gap-3">
        {localPrograms.map((program, idx) => (
          <button
            onClick={() => {
              openProgramDialog(program.slug);
            }}
            key={idx}
            className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
          >
            <Plus size={16} strokeWidth={2} /> {program.name}
          </button>
        ))}
      </div>
    </div>
  );
};
const OptometristDialog: any = ({ openDialog, openProgramDialog }: any) => {
  const similarProfession = [
    {
      name: "Surgical Technician",
      slug: "surgical-technician",
    },
    {
      name: "Respiratory Technician",
      slug: "respiratory-technician",
    },
    {
      name: "X Ray Technician",
      slug: "x-ray-technician",
    },
  ];
  const localPrograms = [
    { name: "Bellevue College", slug: "bellevue-college" },
    { name: "Shoreline College", slug: "shoreline-college" },
    { name: "Renton Technical College", slug: "renton-technical-college" },
    { name: "Bates College", slug: "bates-college" },
  ];
  return (
    <div>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Median Salary</strong> $48 - $58
      </p>

      <p className="text-gray-700 text-sm mb-2">
        <strong>Description:</strong> Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Architecto, nemo.
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Similar Professions:</strong>{" "}
        {similarProfession.map((sim, idx) => (
          <span
            key={idx}
            onClick={() => openDialog(sim.slug)}
            className="text-blue-500 underline cursor-pointer px-1 hover:text-blue-700"
          >
            {sim.name}
          </span>
        ))}
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Local Training Programs:</strong> Highline college, Belleuve
        college, Renton College
      </p>
      <p className="text-gray-700 text-sm mb-2">
        <strong>Length of Training:</strong> 4 years
      </p>
      <p className="text-gray-700 text-sm mb-4">
        <strong>Degree Type:</strong> Bachelor of Science
      </p>
      <p className="text-md sm:text-lg font-medium mb-3 text-gray-800">
        Explore Local Programs
      </p>
      <div className="flex flex-wrap gap-3">
        {localPrograms.map((program, idx) => (
          <button
            onClick={() => {
              openProgramDialog(program.slug);
            }}
            key={idx}
            className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
          >
            <Plus size={16} strokeWidth={2} /> {program.name}
          </button>
        ))}
      </div>
    </div>
  );
};
function ReferralCarousel() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [activeProgramSlug, setActiveProgramSlug] = useState<string | null>(
    null
  );
  const [programsAdded, setProgramsAdded] = useState<string[]>([]);
  const MAX_PROGRAMS = 3;

  const AddProgram = (program: string) => {
    // Check if the program is already added or if we already have 3 programs
    if (programsAdded.length >= 3) {
      alert("You can only add up to 3 programs.");
      return;
    }

    if (!programsAdded.includes(program)) {
      // Add the new program to the array
      setProgramsAdded([...programsAdded, program]);
      setActiveProgramSlug(null);
    } else {
      alert(`${program} is already added.`);
    }
  };

  // Function to remove a program
  const removeProgram = (program: string) => {
    setProgramsAdded(programsAdded.filter((p) => p !== program));
  };

  const openProgramDialog = (slug: string) => {
    setActiveProgramSlug(slug);
  };

  // Function to close the dialog
  const closeProgramDialog = () => {
    setActiveProgramSlug(null);
  };

  const openDialog = (slug: string) => {
    setActiveDialog(slug);
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  const dialogData = [
    { name: "Surgical Technician", slug: "surgical-technician" },
    { name: "Respiratory Technician", slug: "respiratory-technician" },
    { name: "X Ray Technician", slug: "x-ray-technician" },
  ];
  const cardSlides = [
    <NurseRN openDialog={openDialog} />,
    <RespiratoryTech openDialog={openDialog} />,
    <SurgicalTech openDialog={openDialog} />,
    <Optometrist openDialog={openDialog} />,
  ];
  const similarPrograms = [
    { name: "Highline College", slug: "highline-college" },
    { name: "Bellevue College", slug: "bellevue-college" },
    { name: "Shoreline College", slug: "shoreline-college" },
    { name: "Tacoma College", slug: "tacoma-college" },
  ];
  const suggestedPrograms = similarPrograms.filter(
    (program) => !programsAdded.includes(program.slug)
  );
  return (
    <div className="px-2 py-10">
      <EmblaCarousel options={{ align: "start" }} slides={cardSlides} />

      {/* The dialog boxes would be here  controlled by the state */}
      <Dialog open={!!activeDialog} onOpenChange={closeDialog}>
        <DialogContent>
          {activeDialog === "surgical-technician" && (
            <>
              <DialogHeader>
                <DialogTitle>Surgical Technician</DialogTitle>
               
                <div>
                  <SurgicalTechDialog
                    openProgramDialog={openProgramDialog}
                    openDialog={openDialog}
                  />
                </div>
              </DialogHeader>
            </>
          )}
          {activeDialog === "nurse-rn" && (
            <>
              <DialogHeader>
                <DialogTitle>Nurse RN</DialogTitle>
                <DialogDescription>
                <div>
                  <NurseRNDialog
                    openProgramDialog={openProgramDialog}
                    openDialog={openDialog}
                  />
                </div>
                </DialogDescription>
              </DialogHeader>
            </>
          )}
          {activeDialog === "respiratory-technician" && (
            <>
              <DialogHeader>
                <DialogTitle>Respiratory Technician</DialogTitle>
                <DialogDescription>
                <div>
                  <RespiratoryTechDialog
                    openProgramDialog={openProgramDialog}
                    openDialog={openDialog}
                  />
                </div>
                </DialogDescription>
              </DialogHeader>
            </>
          )}
          {activeDialog === "optometrist" && (
            <>
              <DialogHeader>
                <DialogTitle>Optometrist</DialogTitle>
                <DialogDescription>
                <div>
                  <OptometristDialog
                    openProgramDialog={openProgramDialog}
                    openDialog={openDialog}
                  />
                </div>
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!activeProgramSlug} onOpenChange={closeProgramDialog}>
        <DialogContent>
          <DialogHeader>
            {/* Bellevue College Dialog */}
            {activeProgramSlug === "highline-college" && (
              <>
                <DialogTitle>Highline College Nursing Program</DialogTitle>
                <DialogDescription>
                  <strong>Next information session:</strong> November 23, 2024
                  <br />
                  <strong>Application period:</strong> Dec 14, 2024 - Jan 04,
                  2025
                  <br />
                  <strong>Prerequisite courses:</strong> 8<br />
                  <strong>Intakes per year:</strong> 3<br />
                  <strong>Acceptance rate:</strong> 8%
                  <br />
                  <strong>Costs:</strong> $4321 per quarter
                  <br />
                  <strong>Length of training:</strong> 6 quarters
                  <br />
                  <strong>Contact:</strong> Cheryl Miller, 1020 Pacific Hwy,
                  Seattle WA 91118, Tel: 206 555 5505, email:
                  rn_inquiries@highline.edu
                  <br />
                  <div>
                    <p className="text-sm"> Similar Programs </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {similarPrograms.map((program, idx) => (
                        <button
                          onClick={() => {
                            openProgramDialog(program.slug);
                          }}
                          key={idx}
                          className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                        >
                          <Plus size={16} strokeWidth={2} /> {program.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => AddProgram("highline-college")}
                    variant="default"
                    size="sm"
                  >
                    Create Plan
                  </Button>
                </DialogDescription>
              </>
            )}
            {/* Bellevue College Dialog */}
            {activeProgramSlug === "bellevue-college" && (
              <>
                <DialogTitle>Bellevue College Nursing Program</DialogTitle>
                <DialogDescription>
                  <strong>NCLEX Pass Rate:</strong> 96% for first-time test
                  takers
                  <br />
                  <strong>Program Type:</strong> Associate Degree in Nursing
                  (ADN)
                  <br />
                  <strong>Duration:</strong> 6 quarters (full-time), 10 quarters
                  (part-time)
                  <br />
                  <strong>Costs:</strong> Approximately $4,057 per quarter for
                  in-state students&#8203;:contentReference[oaicite:0]
                  &#8203;:contentReference[oaicite:1]
                  <br />
                  <strong>Accreditation:</strong> NLN
                  CNEA&#8203;:contentReference[oaicite:2]
                  <br />
                  <strong>More Info:</strong> Visit{" "}
                  <a href="https://www.bellevuecollege.edu/nursing">
                    Bellevue College Nursing
                  </a>
                  <div>
                    <p className="text-sm"> Similar Programs </p>
                    <div className="flex flex-wrap gap-2 mb-2"> 
                      {similarPrograms.map((program, idx) => (
                        <button
                          onClick={() => {
                            openProgramDialog(program.slug);
                          }}
                          key={idx}
                          className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                        >
                          <Plus size={16} strokeWidth={2} /> {program.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => AddProgram("bellevue-college")}
                    variant="default"
                    size="sm"
                  >
                    Create Plan
                  </Button>
                </DialogDescription>
              </>
            )}
            {/* Shoreline College Dialog */}
            {activeProgramSlug === "shoreline-college" && (
              <>
                <DialogTitle>Shoreline College Nursing Program</DialogTitle>
                <DialogDescription>
                  <strong>NCLEX Pass Rate:</strong> 95%
                  <br />
                  <strong>Program Type:</strong> ADN with hands-on clinical
                  experience&#8203;:contentReference[oaicite:3]
                  <br />
                  <strong>Costs:</strong> Approximately $4,000 per
                  quarter&#8203;:contentReference[oaicite:4]
                  <br />
                  <strong>Duration:</strong> 6 quarters full-time
                  <br />
                  <strong>Accreditation:</strong> NLN Commission for Nursing
                  Education Accreditation (CNEA)
                  <br />
                  <strong>More Info:</strong> Visit{" "}
                  <a href="https://www.shoreline.edu">
                    Shoreline College Nursing
                  </a>
                  <div>
                    <p className="text-sm"> Similar Programs </p>
                    <div className="flex flex-wrap gap-2 mb-2 mb-2">
                      {similarPrograms.map((program, idx) => (
                        <button
                          onClick={() => {
                            openProgramDialog(program.slug);
                          }}
                          key={idx}
                          className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                        >
                          <Plus size={16} strokeWidth={2} /> {program.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => AddProgram("shoreline-college")}
                    variant="default"
                    size="sm"
                  >
                    Create Plan
                  </Button>
                </DialogDescription>
              </>
            )}
            {/* Tacoma College Dialog */}
            {activeProgramSlug === "tacoma-college" && (
              <>
                <DialogTitle>Tacoma College Nursing Program</DialogTitle>
                <DialogDescription>
                  <strong>Program Type:</strong> ADN with a focus on community
                  health nursing
                  <br />
                  <strong>NCLEX Pass Rate:</strong> 90%
                  <br />
                  <strong>Costs:</strong> Around $4,200 per
                  quarter&#8203;:contentReference[oaicite:5]
                  <br />
                  <strong>Application Period:</strong> Fall intake with rolling
                  admissions
                  <br />
                  <strong>More Info:</strong> Visit{" "}
                  <a href="https://www.tacomacollege.edu/nursing">
                    Tacoma College Nursing
                  </a>
                  <div>
                    <p className="text-sm"> Similar Programs </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {similarPrograms.map((program, idx) => (
                        <button
                          onClick={() => {
                            openProgramDialog(program.slug);
                          }}
                          key={idx}
                          className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                        >
                          <Plus size={16} strokeWidth={2} /> {program.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => AddProgram("tacoma-college")}
                    variant="default"
                    size="sm"
                  >
                    Create Plan
                  </Button>
                </DialogDescription>
              </>
            )}
            {/* Renton Technical College Dialog */}
            {activeProgramSlug === "renton-technical-college" && (
              <>
                <DialogTitle>Renton Technical College</DialogTitle>
                <DialogDescription>
                  <strong>Program Type:</strong> ADN with a focus on community
                  health nursing
                  <br />
                  <strong>NCLEX Pass Rate:</strong> 90%
                  <br />
                  <strong>Costs:</strong> Around $4,200 per
                  quarter&#8203;:contentReference[oaicite:5]
                  <br />
                  <strong>Application Period:</strong> Fall intake with rolling
                  admissions
                  <br />
                  <strong>More Info:</strong> Visit{" "}
                  <a href="https://www.tacomacollege.edu/nursing">
                    Renton College
                  </a>
                  <div>
                    <p className="text-sm"> Similar Programs </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {similarPrograms.map((program, idx) => (
                        <button
                          onClick={() => {
                            openProgramDialog(program.slug);
                          }}
                          key={idx}
                          className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                        >
                          <Plus size={16} strokeWidth={2} /> {program.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => AddProgram("renton-technical-college")}
                    variant="default"
                    size="sm"
                  >
                    Create Plan
                  </Button>
                </DialogDescription>
              </>
            )}

            {/* Bates College Dialog */}
            {activeProgramSlug === "bates-college" && (
              <>
                <DialogTitle>Bates College</DialogTitle>
                <DialogDescription>
                  <strong>Program Type:</strong> ADN with a focus on community
                  health nursing
                  <br />
                  <strong>NCLEX Pass Rate:</strong> 90%
                  <br />
                  <strong>Costs:</strong> Around $4,200 per
                  quarter&#8203;:contentReference[oaicite:5]
                  <br />
                  <strong>Application Period:</strong> Fall intake with rolling
                  admissions
                  <br />
                  <strong>More Info:</strong> Visit{" "}
                  <a href="https://www.tacomacollege.edu/nursing">
                    Bates College
                  </a>
                  <div >
                    <p className="text-sm"> Similar Programs </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {similarPrograms.map((program, idx) => (
                        <button
                          onClick={() => {
                            openProgramDialog(program.slug);
                          }}
                          key={idx}
                          className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                        >
                          <Plus size={16} strokeWidth={2} /> {program.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => AddProgram("bates-college")}
                    variant="default"
                    size="sm"
                  >
                    Create Plan
                  </Button>
                </DialogDescription>
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {programsAdded.length > 0 && (
        <div className="max-w-[80rem] mx-auto px-4 py-2 shadow-md rounded-r-md  bg-white">
          <div className="mb-3">
            <h2 className="text-sm mb-3 font-semibold antialiased">
              Selected Programs
            </h2>
            <div className="selected-programs flex mb-4 flex-wrap gap-2">
              {programsAdded.map((slug) => (
                <button
                  onClick={() => removeProgram(slug)}
                  className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                >
                  <X size={16} strokeWidth={2} />{" "}
                  {similarPrograms.find((p) => p.slug === slug)?.name}
                </button>
              ))}
            </div>

            {/* Show suggested programs if fewer than 3 are selected */}
            {programsAdded.length < MAX_PROGRAMS && (
              <>
                <h3 className="text-sm mb-3 font-semibold antialiased">
                  Suggested Programs
                </h3>
                <div className="suggested-programs  mb-4 flex flex-wrap gap-2">
                  {similarPrograms.map((program) => (
                    <button
                      key={program.slug}
                      onClick={() => openProgramDialog(program.slug)}
                      className="bg-gray-200 text-xs flex items-center gap-2 text-gray-700 px-3 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out"
                    >
                      <Plus size={16} strokeWidth={2} /> {program.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Continue Button */}
          {programsAdded.length > 0 && (
            <Button variant="default" size="sm">
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferralCarousel;
