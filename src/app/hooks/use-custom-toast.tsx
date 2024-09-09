import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "login required",
      description: "You need to logged in to be able to create a discussion",
      variant: "destructive",
      action: (
        <Link
          href="/signin"
          onClick={() => dismiss()}
          className={buttonVariants({ variant: "outline" })}
        >
          Login
        </Link>
      ),
    });
  };
  return loginToast;
};
