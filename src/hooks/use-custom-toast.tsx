import { toast } from "sonner";

export const useCustomToast = () => {
  const loginToast = () => {
    toast.error("Login required", {
      description: "You need to logged in to be able to create a discussion",
      action: {
        label: "Login",
        onClick: () => {
          window.location.href = "/signin";
        },
      },
    });
  };
  return loginToast;
};
