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
import {
  CheckCheck,
  PlusIcon,
  TrashIcon,
  X,
  Briefcase,
  Building2,
  Calendar,
  Mail,
  Phone,
  Save,
} from "lucide-react";
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

// Yup schema for validation (UNCHANGED)
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

  // STATE (UNCHANGED)
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);

  // React Hook Form setup (UNCHANGED)
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

  useEffect(() => {
    if (userData?.careerProfile?.experience) {
      // console.log(userData.careerProfile.experience.workExperiences);
      reset({
        workExperiences: userData.careerProfile.experience.workExperiences || [],
      });
      setTotalPoints(userData.careerProfile.experience.points || 0);
      setIsCompleted(userData.careerProfile.experience.hasCompleted || false);
    }
  }, [userData, reset]);

  // Dynamic list (UNCHANGED)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperiences",
  });

  // Points calc (UNCHANGED)
  const calculatePoints = (experiences: any[]) => {
    let points = 0;
    if (experiences.length >= 1) points += 25;
    if (experiences.length >= 2) points += 10;
    if (experiences.length === 3) points += 5;
    setTotalPoints(points);
    return points;
  };

  // DB update (UNCHANGED)
  const updateDatabase = async (plan: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: {
        $set: plan,
      },
      options: { upsert: true },
    };
    try {
      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.email
      );
      setUserData(fetchedData.result);
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

  // Submit (UNCHANGED)
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

  // Add / Delete (UNCHANGED)
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

  const deleteExperience = async (index: number) => {
    remove(index);
    const updatedExperiences: any = getValues("workExperiences");
    const newPoints = calculatePoints(updatedExperiences);
    if (updatedExperiences.length === 0) {
      setHasStarted(false);
    }
    try {
      await updateDatabase({
        "careerProfile.experience.workExperiences": updatedExperiences,
        "careerProfile.experience.points": newPoints,
        "careerProfile.experience.draft": true,
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

  // Summary row (UNCHANGED)
  const getSummary = (experience: any) => {
    return (
      <div className="flex items-center justify-between gap-4 p-3 w-full">
        <div className="min-w-0">
          <p className="text-gray-900 text-sm font-medium truncate">
            {experience?.organization || "Company Name"}
          </p>
          <p className="text-gray-600 text-xs truncate">
            {experience?.role || "Role"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500">
            {experience?.startDate || "Start Date"} — {experience?.endDate || "End Date"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <ToastProvider>
      {userData && (
        <div className="w-full">
          <div className="mx-auto w-full max-w-4xl">
            {/* Outer shell with internal scroll to play nice inside shadcn Dialog */}
            <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Gradient header */}
              <div className="relative shrink-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
                <div className="flex items-start md:items-center justify-between px-5 md:px-6 py-4">
                  <div className="pr-10">
                    <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight">
                      Add your volunteer/work experience(s)
                    </h2>
                    <p className="text-indigo-100 text-xs md:text-[13px]">
                      Professional experience that demonstrates direct patient care and commitment.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50/90 px-3 py-1 text-xs font-medium text-green-700 shadow-sm">
                        <CheckCheck className="h-4 w-4" /> Completed
                      </span>
                    )}
                    <button
                      onClick={closeDialog}
                      className="rounded-full z-50 p-2 text-white/90 hover:text-white hover:bg-white/10 transition"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-gray-50/60">
                {/* Progress / Points */}
                <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 rounded-2xl border border-indigo-100 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Experience Summary</p>
                          <p className="text-sm font-medium text-gray-900">
                            {fields.length || 0} of 3 entries
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-lg font-semibold text-gray-900">{totalPoints}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{
                          width: `${Math.min(100, (fields.length / 3) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-600 mb-2">Quick Action</p>
                    <div className="flex gap-2">
                      {fields.length < 3 && (
                        <Button
                          variant="outline"
                          onClick={addNewExperience}
                          className="w-full justify-center"
                        >
                          <PlusIcon className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className="w-full rounded-2xl border border-gray-100 bg-white p-3 md:p-6 shadow-sm">
                  <p className="text-sm text-gray-600 mb-4">
                    Care provided to family or a friend doesn’t qualify as relevant care experience.
                    Direct patient care experience shows seriousness and passion for the field.
                  </p>

                  {/* Accordion list */}
                  <Accordion
                    type="single"
                    className="flex flex-col gap-3"
                    value={
                      openAccordionIndex !== null ? String(openAccordionIndex) : undefined
                    }
                    onValueChange={(value: any) => {
                      const index = Number(value);
                      setOpenAccordionIndex(openAccordionIndex === index ? null : index);
                    }}
                    collapsible
                  >
                    {fields.map((field, index) => (
                      <div
                        className="rounded-2xl border border-gray-100 bg-white shadow-sm"
                        key={field.id}
                      >
                        <AccordionItem value={String(index)}>
                          <AccordionTrigger className="px-2 md:px-3 py-2 hover:no-underline">
                            {getSummary(experience?.[index])}
                          </AccordionTrigger>

                          {openAccordionIndex === index && (
                            <>
                              <Separator className="border border-gray-200" />
                              <AccordionContent>
                                <div className="space-y-5 p-4 md:p-5 rounded-b-2xl">
                                  {/* Organization */}
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                      Name of the employer or organization
                                    </label>
                                    <div className="relative">
                                      <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                                        <Building2 className="h-4 w-4" />
                                      </span>
                                      <input
                                        type="text"
                                        {...register(`workExperiences.${index}.organization`)}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                        placeholder="Enter company name"
                                        onBlur={(e) =>
                                          handleFieldUpdate(e.target.name, e.target.value)
                                        }
                                      />
                                    </div>
                                    {errors?.workExperiences?.[index]?.organization && (
                                      <p className="mt-1 text-sm text-red-400">
                                        {errors.workExperiences[index]?.organization?.message as any}
                                      </p>
                                    )}
                                  </div>

                                  {/* Role & Supervisor */}
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                      <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Your role
                                      </label>
                                      <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                                          <Briefcase className="h-4 w-4" />
                                        </span>
                                        <input
                                          type="text"
                                          {...register(`workExperiences.${index}.role`)}
                                          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                          placeholder="Enter your role"
                                          onBlur={(e) =>
                                            handleFieldUpdate(e.target.name, e.target.value)
                                          }
                                        />
                                      </div>
                                      {errors?.workExperiences?.[index]?.role && (
                                        <p className="mt-1 text-sm text-red-400">
                                          {errors.workExperiences[index]?.role?.message as any}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Supervisor&apos;s name
                                      </label>
                                      <input
                                        type="text"
                                        {...register(`workExperiences.${index}.name`)}
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                        placeholder="Enter supervisor's name"
                                        onBlur={(e) =>
                                          handleFieldUpdate(e.target.name, e.target.value)
                                        }
                                      />
                                      {errors?.workExperiences?.[index]?.name && (
                                        <p className="mt-1 text-sm text-red-400">
                                          {errors.workExperiences[index]?.name?.message as any}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Phone & Email */}
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                      <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Phone number
                                      </label>
                                      <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                                          <Phone className="h-4 w-4" />
                                        </span>
                                        <input
                                          type="text"
                                          {...register(`workExperiences.${index}.tel`)}
                                          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                          placeholder="Enter phone number"
                                          onBlur={(e) =>
                                            handleFieldUpdate(e.target.name, e.target.value)
                                          }
                                        />
                                      </div>
                                      {errors?.workExperiences?.[index]?.tel && (
                                        <p className="mt-1 text-sm text-red-400">
                                          {errors.workExperiences[index]?.tel?.message as any}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Email
                                      </label>
                                        <div className="relative">
                                          <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                                            <Mail className="h-4 w-4" />
                                          </span>
                                          <input
                                            type="email"
                                            {...register(`workExperiences.${index}.email`)}
                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                            placeholder="Enter email address"
                                            onBlur={(e) =>
                                              handleFieldUpdate(e.target.name, e.target.value)
                                            }
                                          />
                                        </div>
                                      {errors?.workExperiences?.[index]?.email && (
                                        <p className="mt-1 text-sm text-red-400">
                                          {errors.workExperiences[index]?.email?.message as any}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                      <label className="mb-2 block text-sm font-medium text-gray-900">
                                        Start date
                                      </label>
                                      <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                                          <Calendar className="h-4 w-4" />
                                        </span>
                                        <input
                                          type="date"
                                          {...register(`workExperiences.${index}.startDate`)}
                                          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                          onBlur={(e) =>
                                            handleFieldUpdate(e.target.name, e.target.value)
                                          }
                                        />
                                      </div>
                                      {errors?.workExperiences?.[index]?.startDate && (
                                        <p className="mt-1 text-sm text-red-400">
                                          {errors.workExperiences[index]?.startDate?.message as any}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <label className="mb-2 block text-sm font-medium text-gray-900">
                                        End date
                                      </label>
                                      <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                                          <Calendar className="h-4 w-4" />
                                        </span>
                                        <input
                                          type="date"
                                          {...register(`workExperiences.${index}.endDate`)}
                                          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus-visible:outline-blue-500"
                                          onBlur={(e) =>
                                            handleFieldUpdate(e.target.name, e.target.value)
                                          }
                                        />
                                      </div>
                                      {errors?.workExperiences?.[index]?.endDate && (
                                        <p className="mt-1 text-sm text-red-400">
                                          {errors.workExperiences[index]?.endDate?.message as any}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Supervisor referral */}
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-900">
                                      Can your supervisor be contacted for a referral?
                                    </label>
                                    <RadioGroup
                                      defaultValue="yes"
                                      className="flex items-center gap-4"
                                      {...register(
                                        `workExperiences.${index}.supervisorReferral`
                                      )}
                                      onBlur={(e: any) =>
                                        handleFieldUpdate(e.target.name, e.target.value)
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <RadioGroupItem value="yes" id={`yes${index}`} />
                                        <label
                                          htmlFor={`yes${index}`}
                                          className="text-sm font-medium text-gray-900 leading-none"
                                        >
                                          Yes
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <RadioGroupItem value="no" id={`no${index}`} />
                                        <label
                                          htmlFor={`no${index}`}
                                          className="text-sm font-medium text-gray-900 leading-none"
                                        >
                                          No
                                        </label>
                                      </div>
                                    </RadioGroup>
                                    {errors?.workExperiences?.[index]?.supervisorReferral && (
                                      <p className="mt-1 text-sm text-red-400">
                                        {
                                          errors.workExperiences[index]?.supervisorReferral
                                            ?.message as any
                                        }
                                      </p>
                                    )}
                                  </div>

                                  {/* Delete entry */}
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => deleteExperience(index)}
                                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete this experience
                                    </button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </>
                          )}
                        </AccordionItem>
                      </div>
                    ))}
                  </Accordion>

                  {/* Actions */}
                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {fields.length < 3 && (
                        <Button variant="outline" onClick={addNewExperience}>
                          <PlusIcon className="mr-2 w-4 h-4" /> Add Experience
                        </Button>
                      )}
                    </div>

                    <Button
                      disabled={isSubmitting}
                      onClick={handleSubmit(onSubmit)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Submitting" : "Save Work Experience"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToastProvider>
  );
}

export default AddWorkExperience;
