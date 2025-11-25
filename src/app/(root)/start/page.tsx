import StartCaregiver from '@/Authentication/StartCaregiver';
import Navbar from '@/WebPages/Navbar';
import React from 'react'

function page() {
  return (
    <main>
        <Navbar/>
       <div className="mt-10">
       <StartCaregiver/>
       </div>
    </main>
  )
}

export default page