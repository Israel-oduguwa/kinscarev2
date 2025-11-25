import React from 'react';
// import CreateJobUI from '@/Providers/Jobs/CreateJobUI';
import PostJobPage from '@/Providers/Jobs/PostJobPage';

function page() {
  return (
    <div className='bg-gray-100 mt-10'>
        <PostJobPage type="repost"/>
    </div>
  )
}

export default page