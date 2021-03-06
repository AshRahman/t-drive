import { useEffect } from "react";
import {useRouter} from 'next/router';
import useSWR from "swr";

export default function useUser({redirectTo = false,redirectIfFound = false} = {}) {
  const router = useRouter();

    const fetcher = (url) => fetch(url,{
        mode: 'cors',  
        credentials: 'include',
        withCredentials: true,
    }).then(res => res.json()) ;

  const { data: user, mutate: mutateUser } = useSWR("http://localhost:3000/profile",fetcher,{
      refreshInterval:5000
  });

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);

  return { user, mutateUser };
}