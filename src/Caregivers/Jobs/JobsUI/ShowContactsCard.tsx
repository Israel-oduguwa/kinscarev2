"use client"
import React from 'react';
import { useContext } from 'react';
import { useAuthContext } from '@/context/AuthContext';

function ShowContactsCard({job}:any) {
    const authData:any  = useAuthContext();
    const {userData} = authData
    console.log(userData)
  if(userData){
    return (
        <div className="py-10">
            <div className="shadow-sm">
                Show the user contacts and popup 
            </div>
        </div>
      )
  }
  else return ""
}

export default ShowContactsCard