import React, { useContext, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MongoContext from "@/app/MongoContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useToast } from "@/components/ui/use-toast"; // Import Shadcn Toast hook
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fetchUserData } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/mixpanelUtils";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
interface IFormInputs {
  role: string;
  tel: string;
}

const schema = yup
  .object({
    role: yup.string().required("Role is required"),
    tel: yup.string().required("Phone number is required"),
  })
  .required();

function SelectRole({ selectRoleModal, closeSelectModal }: any) {
  const mongoContext: any = useContext(MongoContext);
  const { user, setUserData } = mongoContext;
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState<null | boolean>(null);
  const router = useRouter();
  const { toast } = useToast(); // Use Shadcn Toast

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });
  const role = watch("role");
  const validatePhoneNumber = async (phone: string | undefined) => {
    if (!phone) {
      toast({
        title: "Invalid Input",
        description: "Please enter a phone number with the country code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setValidating(true);
      const response = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/phone/validate",
        {
          phone: phone,
        }
      );
      setValidating(false);

      if (response.data.success) {
        setIsPhoneValid(true);
        toast({
          title: "Phone Validated",
          description: "Your phone number is valid.",
          variant: "default",
        });
      } else {
        setIsPhoneValid(false);
        toast({
          title: "Validation Failed",
          description: "Invalid phone number. Please check your input.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      setValidating(false);
      setIsPhoneValid(false);
      toast({
        title: "Validation Error",
        description: "Error validating phone number. Please try again.",
        variant: "destructive",
      });
      console.error("Error validating phone number:", error);
    }
  };

  const submit: SubmitHandler<IFormInputs> = async (data) => {
    try {
      setLoading(true);

      // Ensure phone number is valid before proceeding
      if (!isPhoneValid) {
        toast({
          title: "Validation Required",
          description: "Please validate your phone number first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      user.refreshCustomData();
      const payload = {
        userID: user.customData.userID,
        fname: user.customData.fname,
        lname: user.customData.lname,
        email: user.customData.email,
        role: data.role,
        tel: data.tel,
        hash: user?.customData?.hash,
      };
      // console.log(payload);
      const response = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/update-role-tel",
        payload
      );
      if (response.data.success) {
        toast({
          title: "Role and Phone Updated",
          description: "Your information has been successfully saved.",
        });
      }

      // After Role is updated
      const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
      const emailParams: CustomerSignupParams = {
        email: payload.email,
        name: fullName,
        role: payload.role,
      };
      // Fire & forget:
      await sendCustomerSignupEmail(emailParams);

      const mixpanelPayload = {
        userID: user.customData.userID,
        fname: user.customData.fname,
        lname: user.customData.lname,
        email: user.customData.email,
        role: data.role,
        tel: data.tel,
        hash: user?.customData?.hash,
        auth_mode: "oauth2-google",
        route: "Regular",
        created: new Date(),
      };
      //track the event in mixpanel for singing up
      trackEvent(user?.customData?.hash, "Sign Up", mixpanelPayload);
      // so we need to push the user to the right page but before then lets fetch the data
      const fetchedData: any = await fetchUserData(
        user.customData.userID,
        user.customData.email
      );
      // console.log(fetchedData);
      await setUserData(fetchedData.result);
      if (role === "provider") {
        router.push("/provider/candidates/all");
        closeSelectModal();
        setLoading(false);
      } else {
        router.push("/vitae/jobs/all");
        closeSelectModal();
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast({
        title: "Submission Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={selectRoleModal}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Select Role</DialogTitle>
          <DialogDescription>
            To enhance your experience, verify identity and ensure secure access
            we need your phone number and role. <br />
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)}>
          <div className="mb-6 space-y-4">
            <div>
              <Label
                htmlFor="tel"
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-300"
              >
                Phone Number
              </Label>
              <Controller
                name="tel"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <PhoneInput
                      {...field}
                      id="tel"
                      placeholder="Enter phone number"
                      defaultCountry="NG"
                      label
                      international
                      className={`pr-10 input input-bordered w-full ${
                        errors.tel ? "border-red-500" : "border-gray-300"
                      } ${
                        isPhoneValid
                          ? "border-green-500"
                          : isPhoneValid === false
                            ? "border-red-500"
                            : ""
                      }`}
                      onBlur={(e) => validatePhoneNumber(field.value)}
                    />
                    {validating && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin h-6 w-6 text-gray-500" />
                    )}
                    {isPhoneValid && !validating && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {isPhoneValid === false && !validating && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              />
              {errors.tel && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.tel.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-300"
              >
                Role
              </Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    className="mt-1"
                    disabled={!isPhoneValid}
                  >
                    <div className="flex items-center mb-2 space-x-2">
                      <RadioGroupItem value="caregiver" id="caregiver" />
                      <Label
                        htmlFor="caregiver"
                        className="text-sm font-normal text-gray-900 dark:text-white"
                      >
                        I AM A CAREGIVER LOOKING FOR A JOB
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="provider" id="provider" />
                      <Label
                        htmlFor="provider"
                        className="text-sm font-normal text-gray-900 dark:text-white"
                      >
                        I AM A PROVIDER SEARCHING FOR CAREGIVER(S)/NACs
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !isPhoneValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role === "provider"
                ? "Get perfect caregiver"
                : "Get the job you seek"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SelectRole;
