import PostedJobs from '@/Providers/Jobs/PostedJobs';
import React from 'react';
import { Metadata } from 'next';

// Define metadata
export const metadata: Metadata = {
  title: 'Posted Jobs - Kinscare',
  description: 'Explore all the jobs posted by you on our platform. Manage and update your job postings seamlessly.',
  openGraph: {
    title: 'Posted Jobs - KinsCare',
    description: 'Explore and manage all the jobs you’ve posted on our platform.',
    url: 'https://kinscare.org/posted-jobs', // Replace with your actual page URL
    type: 'website',
    images: [
      {
        url: 'https://kinscare.org/assets/images/og-image.jpg', // Replace with an appropriate image URL
        width: 1200,
        height: 630,
        alt: 'Posted Jobs Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Posted Jobs - KinsCare',
    description: 'Explore and manage all the jobs you’ve posted on our platform.',
    images: ['https://kinscare.org/assets/images/twitter-image.jpg'], // Replace with a Twitter-optimized image URL
  },
};

function Page() {
  return (
    <div>
      <PostedJobs />
    </div>
  );
}

export default Page;
