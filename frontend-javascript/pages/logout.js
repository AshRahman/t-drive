import Head from 'next/head'
import Image from 'next/image'
import Router from 'next/router';
import styles from '../styles/Home.module.css'
import { useState } from 'react';

export default function LogOut() {
    const [logoutError,setLogoutError] = useState("");

    async function logout(){

        const url = 'http://localhost:3000/logout';
        const response = await fetch(url, {
            credentials: 'include',
            withCredentials: true,
           });
      
          const data = await response.json();
          console.log(data);
          if('error' in data){
            setLogoutError(data.error);
          }
          else{
            await Router.push('/');
          }
    }

    logout();
    
  return (
    <div>{logoutError} </div>
   
  )
}
