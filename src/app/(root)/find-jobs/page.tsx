import JobOpenings from '@/WebPages/Jobs/JobOpenings'
import Navbar from '@/WebPages/Navbar'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Job openings | KinsCare',
  description: '...',
}
function FindJobs() {
  return (
   <div>
    <Navbar/>
    <JobOpenings/>
   </div>
  )
}

export default FindJobs