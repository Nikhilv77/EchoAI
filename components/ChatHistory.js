import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { IoArrowBackOutline } from 'react-icons/io5';
import { FaEdit } from "react-icons/fa"
import { Sidebar } from "./sidebar";


export const ChatHistory = ({id,routeToChatHistory,routeToNewChat})=>{
  const router = useRouter();
  const[historyList,setHistoryList] = useState([])
  useEffect(()=>{
    async function getChats(){
      const chats = await fetch('/api/Question/getQuestions',{
        method:'POST',
        headers :{
          'Content-Type' : 'application/json'
        }
      });
      const response = await chats.json();
      if(response){
        setHistoryList(response.chats)
      }else{
        setHistoryList([])
      }
    
    }
    getChats();
  },[id])

return(
  <>
 <Sidebar id={id} routeToChatHistory = {routeToChatHistory} routeToNewChat = {routeToNewChat}/>
  <div className="chat-history">
<svg  fill="skyblue" className="close" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="33" height="33" viewBox="0 0 50 50">
<path d="M 9.15625 6.3125 L 6.3125 9.15625 L 22.15625 25 L 6.21875 40.96875 L 9.03125 43.78125 L 25 27.84375 L 40.9375 43.78125 L 43.78125 40.9375 L 27.84375 25 L 43.6875 9.15625 L 40.84375 6.3125 L 25 22.15625 Z"></path>
</svg>
   <div className="new-chat">
  <div title="Click here to open new chat window" onClick={routeToNewChat} >
   <span style={{textDecoration : 'none', color : 'aliceblue', fontSize : '1.2rem', paddingLeft :'3rem', fontWeight : 'bold'}}>New chat</span>
   <FaEdit cursor={"pointer"} size={20} color="aliceblue"/>
   </div> 
    
   </div>
   <div title="Your old history" className="old-chats-history">
    
    <svg xmlns="http://www.w3.org/2000/svg" height="33" width="33" viewBox="0 0 32 32" id="history" ><path fill="white" d="M30,16A13,13,0,0,1,6.54,23.72l1.61-1.19a11,11,0,1,0-1.67-9.71l1-.65,1.12,1.66-3,2A1,1,0,0,1,5,16a1,1,0,0,1-.83-.44l-2-3,1.66-1.12.68,1A13,13,0,0,1,30,16ZM16,9v7a1,1,0,0,0,.29.71l3,3,1.42-1.42L18,15.59V9Z" data-name="03  History, Recent"></path></svg> 
      </div>
  <div className="old-chats">
    
    {historyList.length<=0 && 
    <div title="No history found!" className="nothing-here"><img className="nothing-here-image" src="/Nothing.webp"></img></div>}
    {historyList.map((history)=>{
      return(
        <div  key={history._id} onClick={()=>{routeToChatHistory(history._id)}}  className={`old-chats-content ${history._id === id?'active-history-link' : ""}`}>
          <div title="Your chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" className="bi bi-chat-square-text-fill" viewBox="0 0 16 16" id="IconChangeColor"> <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5a1 1 0 0 0-.8.4l-1.9 2.533a1 1 0 0 1-1.6 0L5.3 12.4a1 1 0 0 0-.8-.4H2a2 2 0 0 1-2-2V2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z" id="mainIconPathAttribute"></path> </svg> 
        <span className="question-span-title"> <Link style={{textDecoration : 'none', color : "aliceblue"}} key={history._id} href={`/chat/${history._id}`}>{history.title}</Link></span>
        </div>
        </div>

      )
    })}
   
  </div>
<div title="Click here to Signout" onClick={()=>{
  router.push('/api/auth/logout')
}} className="logout">
  <div>

<Link style={{textDecoration : 'none', color : 'aliceblue', fontSize : '1.2rem', paddingLeft :'3rem',fontWeight : 'bold'}} href="/api/auth/logout">
 Logout
  </Link>
 
  <svg fill = "aliceblue" width="24" height="24" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="icon">
  <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 0 1-112.7-75.9 353.28 353.28 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6z"/>
</svg>
</div>
</div>
  </div>
  </>
)
}