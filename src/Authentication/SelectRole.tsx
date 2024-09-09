import React, { useContext, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
  const { user } = mongoContext;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const submit: SubmitHandler<IFormInputs> = async (data) => {
    try {
      setLoading(true);
      const payload = {
        userID: user.customData.userID,
        email: user.customData.email,
        role: data.role,
        tel: data.tel,
        hash: user?.customData?.hash,
      };
    //   console.log(payload);
      // Example of calling a function with payload
      const results = await user.callFunction("web_add_tel_role", payload);
      closeSelectModal();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={selectRoleModal}>
      <DialogContent className="md:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Select Role</DialogTitle>
          <DialogDescription>
            Add phone number and select your role, either caregiver or provider.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)}>
          <div className="mb-6">
            <div className="mb-4">
              <Label htmlFor="tel" className="text-right mb-10">
                Phone Number
              </Label>
              <Controller
                name="tel"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="tel"
                    placeholder="+123-456-7890"
                    className={errors.tel ? "border-red-500" : "mt-1"}
                  />
                )}
              />
              {errors.tel && (
                <p className="text-red-500 text-sm col-span-4 text-right">
                  {errors.tel.message}
                </p>
              )}
            </div>
            <div className="">
              <Label htmlFor="role" className="text-right mb-1">
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
                <p className="text-red-500 text-sm col-span-4 text-right">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SelectRole;
