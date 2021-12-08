import useUser from '../lib/useUser'
import Router from "next/router";

export default function Home() {
  useUser({ redirectTo: '/login',redirectIfFound = false})
  useUser({ redirectTo: '/myFiles',redirectIfFound = true })
 
  return (
    <div>Loading</div>
  )
}
