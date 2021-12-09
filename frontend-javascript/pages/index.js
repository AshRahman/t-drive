import useUser from '../lib/useUser';

export default function Home() {
  useUser({ redirectTo: '/login', redirectIfFound:false})
  useUser({ redirectTo: '/myFiles', redirectIfFound:true })
 
  return (
    <div>Loading</div>
  )
}
