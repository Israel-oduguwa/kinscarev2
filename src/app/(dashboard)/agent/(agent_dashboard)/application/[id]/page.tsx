// app/agent/matched-caregivers/[applicationId]/page.tsx
import MatchedCaregivers from "@/HiringAgent/MatchedCaregivers";

export const metadata = {
  title: "Caregiver Interview Management | Jumpstart Application",
  description:
    "View and manage caregiver interviews for this Jumpstart Hiring application. Agents can track interview progress, review candidates, and update statuses for each provider order.",
};

export default function Page({ params }: { params: { id: string } }) {
  return <MatchedCaregivers applicationId={params.id} />;
}
