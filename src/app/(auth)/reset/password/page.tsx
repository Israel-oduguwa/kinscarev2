import ConfirmPassword from '@/Authentication/ConfirmPassword'
import React from 'react'

export const metadata = {
  title: 'Reset Password',
  description: 'Reset your password here',
}       
function page() {
  return (
   <ConfirmPassword/>
  )
}

export default page