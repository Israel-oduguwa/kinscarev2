import React from 'react';
import CreateJobUI from '@/Providers/Jobs/CreateJobUI';
import CrowdPostPage from '@/Caregivers/Jobs/CrowdPostPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Post your job",
  description:
    "Access your saved caregivers list. Quickly find and connect with the caregivers you've marked as favorites.",
  openGraph: {
    title: "Saved Caregivers - Your Favorites List",
    description:
      "Access your saved caregivers list. Quickly find and connect with the caregivers you've marked as favorites.",
    url: "http://yourwebsite.com/caregivers/favorites",
    type: "website",
    images: [
      {
        url: "http://yourwebsite.com/images/saved-caregivers-og-image.jpg", // Replace with your image URL
        width: 1200,
        height: 630,
        alt: "Saved Caregivers - Favorites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Caregivers - Your Favorites List",
    description:
      "Quickly find and connect with the caregivers you've marked as favorites.",
    images: [
      "http://yourwebsite.com/images/saved-caregivers-twitter-image.jpg",
    ], // Replace with your image URL
  },
};
function page() {
  
  return (
    <div className='bg-gray-100'>
        <CrowdPostPage/>
    </div>
  )
}

export default page