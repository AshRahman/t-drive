import {useRouter} from 'next/router';
import { useState } from 'react';

export default function LogOut() {
    const [logoutError,setLogoutError] = useState("");
    const router = useRouter();
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
            await router.push('/');
          }
    }

    logout();
    
  return (
    <div>{logoutError} </div>
   
  )
}
