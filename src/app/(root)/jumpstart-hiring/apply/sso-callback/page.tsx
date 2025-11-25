import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function Page() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/jumpstart-hiring/apply"
      signUpForceRedirectUrl="/jumpstart-hiring/apply"
    />
  );
}
