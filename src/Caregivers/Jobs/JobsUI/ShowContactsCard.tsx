"use client"
import React from 'react';
import { useContext } from 'react';
import MongoContext from '@/app/MongoContext';

function ShowContactsCard({job}:any) {
    const mongodb:any  = useContext(MongoContext);
    const {userData} = mongodb
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