// app/agent/page.tsx

import AgentQueue from "@/HiringAgent/AgentQueue";

export const metadata = {
  title: "Caregiver Interview Management | Jumpstart Application",
  description:
    "View and manage caregiver interviews for this Jumpstart Hiring application. Agents can track interview progress, review candidates, and update statuses for each provider order.",
};



export default function AgentHome() {
  return (
    <main className="max-w-5xl mx-auto py-2 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Jumpstart Hiring Queue
      </h1>
      <AgentQueue />
    </main>
  );
}
