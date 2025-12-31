// app/agent/page.tsx

import AgentQueue from "@/HiringAgent/AgentQueue";

export const metadata = {
  title: "Caregiver Interview Management | Jumpstart Application",
  description:
    "View and manage caregiver interviews for this Jumpstart Hiring application. Agents can track interview progress, review candidates, and update statuses for each provider order.",
};



export default function AgentHome() {
  return (
    <section>
      <AgentQueue />
    </section>
  );
}
