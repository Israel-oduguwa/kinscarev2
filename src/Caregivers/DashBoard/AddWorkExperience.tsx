"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCheck, PlusIcon, TrashIcon, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToastProvider } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import RoundProgress from "./Charts/RoundProgress";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";

// Yup schema for validation
const workExperienceSchema = yup.object().shape({
  workExperiences: yup.array().of(
    yup.object().shape({
      name: yup.string().required("Supervisor name is required"),
      role: yup.string().required("Role is required"),
      organization: yup.string().required("Organization name is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      tel: yup.string().required("Phone number is required"),
      // url: yup.string().url("Invalid URL").required("Company URL is required"),
      startDate: yup.string().required("Start date is required"),
      endDate: yup.string().required("End date is required"),
      supervisorReferral: yup.string().required("Referral option is required"),
      addMoreExperience: yup.string().optional(),
      summary: yup.string().optional(),
    })
  ),
});

function AddWorkExperience() {
  const mongo: any = useContext(MongoContext);
  const { userData, setUserData } = mongo;
  const { closeDialog } = useDialog();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(
    0
  );

  // React Hook Form setup
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    trigger,
  } = useForm({
    resolver: yupResolver(workExperienceSchema),
    defaultValues: {
      workExperiences: userData?.careerProfile?.experience?.workExperiences,
    },
  });
  // cons
  useEffect(() => {
    if (userData?.careerProfile?.experience) {
      console.log(userData.careerProfile.experience.workExperiences);
      reset({
        workExperiences:
          userData.careerProfile.experience.workExperiences || [],
      });
      setTotalPoints(userData.careerProfile.experience.points || 0);
      setIsCompleted(userData.careerProfile.experience.hasCompleted || false);
    }
  }, [userData, reset]);
  // useFieldArray to handle dynamic list of work experiences
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperiences",
  });

  const calculatePoints = (experiences: any[]) => {
    let points = 0;
    if (experiences.length >= 1) points += 25; // First experience
    if (experiences.length >= 2) points += 10; // Second experience
    if (experiences.length === 3) points += 5; // Third experience
    setTotalPoints(points);
    return points;
  };
  // Update database
  const updateDatabase = async (plan: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: {
        $set: plan,
      },
      options: {
        upsert: true,
      },
    };
    try {
      const addPlan = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.email
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);
      // console.log(addPlan);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFieldUpdate = (name: any, value: any) => {
    setValue(name, value);
    const formData = getValues();
    updateDatabase({
      "careerProfile.experience.workExperiences": formData.workExperiences,
      "careerProfile.experience.draft": true,
    });
  };

  // Handle Submission
  const onSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      const points = calculatePoints(formData.workExperiences);
      setIsCompleted(formData.workExperiences.length === 3);

      await updateDatabase({
        "careerProfile.experience.workExperiences": formData.workExperiences,
        "careerProfile.experience.points": points,
        "careerProfile.experience.hasCompleted":
          formData.workExperiences.length === 3,
      });

      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.email
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);

      toast({ description: "Work experiences saved successfully!" });
    } catch (error) {
      console.error("Error submitting data:", error);
      toast({
        variant: "destructive",
        description: "Failed to save work experiences.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add new work experience entry
  const addNewExperience = () => {
    if (fields.length >= 3) return;
    append({
      name: "",
      organization: "",
      tel: "",
      email: "",
      role: "",
      // url: "",
      supervisorReferral: "",
      addMoreExperience: "",
      startDate: "",
      endDate: "",
      summary: "",
    });
    setOpenAccordionIndex(fields.length);
  };

  // Delete work experience entry
  const deleteExperience = async (index: number) => {
    remove(index); // Remove the specific work experience entry

    const updatedExperiences: any = getValues("workExperiences");
    const newPoints = calculatePoints(updatedExperiences); // Recalculate points after removal

    // If no experiences are left, reset "hasStarted"
    if (updatedExperiences.length === 0) {
      setHasStarted(false);
    }

    try {
      // Update database with new data
      await updateDatabase({
        "careerProfile.experience.workExperiences": updatedExperiences,
        "careerProfile.experience.points": newPoints,
        "careerProfile.experience.draft": true, // Mark as draft after deletion
      });
      toast({ description: "Work experience deleted successfully!" });
    } catch (error) {
      console.error("Failed to delete work experience:", error);
      toast({
        variant: "destructive",
        description: "Failed to update the database after deletion.",
      });
    }
  };
  const experience: any = watch("workExperiences");
  // useEffect(() => {
  //   if (experience) {
  //     let points = 0;
  //     if (experience.length >= 1) points += 25;
  //     if (experience.length >= 2) points += 10;
  //     if (experience.length === 3) points += 5;
  //     console.log(points);
  //     setTotalPoints(points);
  //     if (userData) {
  //       updateDatabase({
  //         "careerProfile.experience.points": points,
  //       });
  //     }
  //     if (experience.length < 3) {
  //       setIsCompleted(false);
  //     }
  //   }
  // }, [experience, userData]);

  // Generate the summary for the collapsed accordion view
  const getSummary = (experience: any) => {
    return (
      <div className="flex space-x-3 justify-between hover:no-underline items-center p-4 bg-white w-full">
        <div>
          <p className="text-gray-800 max-w-20 text-left md:max-w-80 truncate font-medium">
            {experience?.organization || "Company Name"}
          </p>
          <p className="text-justify antialiased text-gray-600 text-sm">
            {experience?.role || "Role"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm truncate antialiased text-gray-500">
            {experience?.startDate || "Start Date"} -{" "}
            {experience?.endDate || "End Date"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <ToastProvider>
      {/* <RoundProgress /> */}
      {userData && (
        <div className="bg-gray-100 max-h-[80vh] overflow-y-auto">
          <button
            className="right-4 p-2 top-4 absolute z-20 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={closeDialog}
          >
            <X size={20} />
          </button>
          <div className="max-w-4xl mx-auto px-0 md:px-4 py-4">
            <div className="w-full border relative rounded-xl border-gray-50 shadow-sm bg-white p-1 md:p-8">
              <div className="flex flex-col space-y-3 mb-6">
                <div className="p-4 md:p-0">
                  <div className="flex w-full mb-2 items-center justify-between">
                    <h2 className="text-xl font-semibold antialiased hover:subpixel-antialiased text-gray-800 ">
                      Add your volunteer/work experiences(s).
                    </h2>
                    {isCompleted && (
                      <span className="bg-green-50 absolute right-10 top-4 shadow-sm shadow-green-50 rounded p-2">
                        <CheckCheck color="#008a35" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm antialiased text-gray-500">
                    Care provided to family or friend doesn’t qualify as
                    relevant care experience. Direct patient care experience
                    shows you are serious and passionate about the field of your
                    study.
                  </p>
                </div>
                <Accordion
                  type="single"
                  className="flex flex-col space-y-3"
                  value={
                    openAccordionIndex !== null
                      ? String(openAccordionIndex)
                      : undefined
                  }
                  onValueChange={(value: any) => {
                    const index = Number(value);
                    setOpenAccordionIndex(
                      openAccordionIndex === index ? null : index
                    );
                  }}
                  collapsible
                >
                  {fields.map((field, index) => (
                    <div
                      className="shadow-sm border border-gray-100 rounded-2xl"
                      key={field.id}
                    >
                      <AccordionItem value={String(index)}>
                        <AccordionTrigger className="p-2 hover:no-underline">
                          {getSummary(experience[index])}
                        </AccordionTrigger>
                        {openAccordionIndex === index && (
                          <>
                            <Separator className="border border-gray-200" />
                            <AccordionContent>
                              <div className="space-y-4 p-4 rounded-lg">
                                {/* Title and Company (Grid) */}
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Name of the employer or organization
                                    </label>
                                    <input
                                      type="text"
                                      {...register(
                                        `workExperiences.${index}.organization`
                                      )}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                      placeholder="Enter company name"
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                    />
                                    {errors?.workExperiences?.[index]
                                      ?.organization && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]
                                            ?.organization?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* URL and Supervisor */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Your role
                                    </label>
                                    <input
                                      type="text"
                                      {...register(
                                        `workExperiences.${index}.role`
                                      )}
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                      placeholder="Enter your role"
                                    />
                                    {errors?.workExperiences?.[index]?.role && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]?.role
                                            ?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Supervisor's name
                                    </label>
                                    <input
                                      type="text"
                                      {...register(
                                        `workExperiences.${index}.name`
                                      )}
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                      placeholder="Enter supervisor's name"
                                    />
                                    {errors?.workExperiences?.[index]?.name && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]?.name
                                            ?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Phone and Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Phone number
                                    </label>
                                    <input
                                      type="text"
                                      {...register(
                                        `workExperiences.${index}.tel`
                                      )}
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                      placeholder="Enter phone number"
                                    />
                                    {errors?.workExperiences?.[index]?.tel && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]?.tel
                                            ?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      {...register(
                                        `workExperiences.${index}.email`
                                      )}
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                      placeholder="Enter email address"
                                    />
                                    {errors?.workExperiences?.[index]
                                      ?.email && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]?.email
                                            ?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Start and End Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Start date
                                    </label>
                                    <input
                                      type="date"
                                      {...register(
                                        `workExperiences.${index}.startDate`
                                      )}
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                    {errors?.workExperiences?.[index]
                                      ?.startDate && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]
                                            ?.startDate?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      End date
                                    </label>
                                    <input
                                      type="date"
                                      {...register(
                                        `workExperiences.${index}.endDate`
                                      )}
                                      onBlur={(e) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                    {errors?.workExperiences?.[index]
                                      ?.endDate && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]?.endDate
                                            ?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Supervisor Referral and Add More Experience */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-2 antialiased text-sm font-medium text-gray-900">
                                      Can your supervisor be contacted for a
                                      referral?
                                    </label>
                                    <RadioGroup
                                      defaultValue="yes"
                                      className="flex space-x-2"
                                      {...register(
                                        `workExperiences.${index}.supervisorReferral`
                                      )}
                                      onBlur={(e: any) => {
                                        handleFieldUpdate(
                                          e.target.name,
                                          e.target.value
                                        );
                                      }}
                                    >
                                      <RadioGroupItem
                                        value="yes"
                                        id={`yes${index}`}
                                      />
                                      <label
                                        htmlFor={`yes${index}`}
                                        className="text-sm font-medium text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        Yes
                                      </label>
                                      <RadioGroupItem
                                        value="no"
                                        id={`no${index}`}
                                      />
                                      <label
                                        htmlFor={`no${index}`}
                                        className="text-sm font-medium text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        No
                                      </label>
                                    </RadioGroup>
                                    {errors?.workExperiences?.[index]
                                      ?.supervisorReferral && (
                                      <p className="text-red-400 text-sm">
                                        {
                                          errors.workExperiences[index]
                                            ?.supervisorReferral?.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteExperience(index)}
                                  className="bg-red-100 text-red-500 rounded-lg hover:bg-red-200 p-2"
                                >
                                  <TrashIcon className="w-4 h-4 inline-block " />{" "}
                                </button>
                              </div>
                            </AccordionContent>
                          </>
                        )}
                      </AccordionItem>
                    </div>
                  ))}
                </Accordion>
                <div className="mt-4">
                  {fields.length < 3 && (
                    <Button variant="outline" onClick={addNewExperience}>
                      <PlusIcon className="mr-2 w-4 h-4" /> Add Experience
                    </Button>
                  )}
                </div>

                <Button
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="bg-blue-500 text-white"
                >
                  {isSubmitting ? "Submitting" : "Save Work Experience"}
                </Button>
              </div>
              <p className="text-sm text-right">
                Score <span className="font-semibold">{totalPoints}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </ToastProvider>
  );
}

export default AddWorkExperience;
