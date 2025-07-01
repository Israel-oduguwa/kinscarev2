import React from 'react';
import PostJobPage from '@/CrowdPost/Jobs/PostJobPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Post your job",
  description:
    "Access your saved caregivers list. Quickly find and connect with the caregivers you've marked as favorites.",
  openGraph: {
    title: "Saved Caregivers - Your Favorites List",
    description:
      "Access your saved caregivers list. Quickly find and connect with the caregivers you've marked as favorites.",
    url: "https://kinscare.org/caregivers/favorites",
    type: "website",
    images: [
      {
        url: "https://kinscare.org/images/saved-caregivers-og-image.jpg", // Replace with your image URL
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
      "https://kinscare.org/images/saved-caregivers-twitter-image.jpg",
    ], // Replace with your image URL
  },
};
function page() {
  
  return (
    <div className='bg-gray-100'>
        <PostJobPage/>
    </div>
  )
}

export default page