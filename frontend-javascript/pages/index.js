import useUser from '../lib/useUser';

export default function Home() {
  useUser({ redirectTo: '/login', redirectIfFound:false})
  useUser({ redirectTo: '/myFiles', edirectIfFound:true })
 
  return (
    <div>Loading</div>
  )
}
