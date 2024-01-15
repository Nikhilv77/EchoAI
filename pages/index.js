import Head from "next/head";
import Link from "next/link";
import {useUser} from '@auth0/nextjs-auth0/client'
import { getSession } from "@auth0/nextjs-auth0";


export default function Home() {
  const{user,isLoading,error} = useUser();
  if(isLoading){
    return <div className="homepage-body">
          <video className="homepage-video" src="/Homepage-background-video.mp4" loop autoPlay muted></video>
    </div>
  }
  if(error){
   return<div>{error.message}</div>
  }

  return (
    <div className="homepage-body">
      <Head>
        
        <title>EchoAI-Signup or Login</title>
      </Head>
      <video className="homepage-video" src="/Homepage-background-video.mp4" loop autoPlay muted></video>
      <div className="homepage-content">
       <img src="/favicon.png" alt="" />
       <div className="homepage-container-info">
      <h1>Hello, I am EchoAI.</h1>
      <div><span id="typing-text">Your personal AI assistant.
      </span></div>
      <br />
      <div><span id="typing-text">Please log in to continue.</span></div>
      </div>
      <div className="homepage-container-links">
        <Link className="homepage-login" href="/api/auth/login">
        Login</Link>
         <Link className="homepage-signup" href="/api/auth/signup">
        Signup</Link>
     
      </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async(ctx)=>{
  const session = await getSession(ctx.req,ctx.res);
  if(session){
    return{
      redirect:{
        destination:'/chat'
      }
    }
  }return{
    props:{}
  }
}