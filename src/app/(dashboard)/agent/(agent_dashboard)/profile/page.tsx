import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Profile | Agent Dashboard",
  description: "View and manage your agent profile settings.",
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return (
    <div>page</div>
  );
}

export default page;
