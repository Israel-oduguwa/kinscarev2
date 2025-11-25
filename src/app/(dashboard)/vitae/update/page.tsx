import UpdateResume from '@/Caregivers/Jobs/Settings/UpdateResume';

export const metadata = {
  title: "Update Your Resume | KinsCare Caregiver Profile",
  description:
    "Update your resume and showcase your skills for nursing and allied healthcare jobs. Make your KinsCare caregiver profile stand out to top employers and agencies.",
  openGraph: {
    title: "Update Your Resume | KinsCare Caregiver Profile",
    description:
      "Keep your resume up-to-date and boost your chances of landing great nursing and allied health positions. Highlight your skills and training on your KinsCare profile.",
    url: "https://www.kinscare.org/caregivers/jobs/update-resume",
    siteName: "KinsCare",
    images: [
      {
        url: "https://kinscare-storage.s3.us-east-1.amazonaws.com/KinsCare+Resume+Update+OpenGraph.png",
        width: 1200,
        height: 630,
        alt: "Update Your Resume | KinsCare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Update Your Resume | KinsCare Caregiver Profile",
    description:
      "Edit your resume and enhance your KinsCare caregiver profile to attract more nursing and healthcare job opportunities.",
    images: [
      "https://kinscare-storage.s3.us-east-1.amazonaws.com/KinsCare+Resume+Update+OpenGraph.png",
    ],
  },
};


function page() {
  return (
    <UpdateResume/>
  )
}

export default page