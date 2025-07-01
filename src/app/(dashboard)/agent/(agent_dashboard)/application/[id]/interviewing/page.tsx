import InterveiwingPage from '@/HiringAgent/InterveiwingPage'
import React from 'react'

export const metadata = {
  title: "Caregiver Interview Management | Jumpstart Application",
  description:
    "View and manage caregiver interviews for this Jumpstart Hiring application. Agents can track interview progress, review candidates, and update statuses for each provider order.",
};


export default function page({ params }: { params: { id: string } }) {
  return (
   <InterveiwingPage applicationId={params.id}/>
  )
}
