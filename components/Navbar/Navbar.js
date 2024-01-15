
import { useUser } from '@auth0/nextjs-auth0/client'
import { ThemeContext } from 'context/context';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import {FaTrash} from 'react-icons/fa'
export const Navbar = ({questionId,onDeleteChat})=>{
  const {theme,toggleDark,toggleLight} = useContext(ThemeContext);
  const router = useRouter();
 const {user} = useUser();
 const[mouseHovered,setMouseHovered] = useState(false)
 const handleMouseEnter = ()=>{
  setMouseHovered(true)
 }
 const handleMouseLeave = ()=>{
  setMouseHovered(false)
 }
 const iconColor = (theme === 'dark') ? 'aliceblue'  : '#484848';

const sidebarHandler = ()=>{
  const sidebar = document.getElementsByClassName('sidebar-chat-history')[0];
  sidebar.style.display = 'grid'
   document.getElementsByClassName('sidebar-backdrop')[0].style.display = 'grid'
}
 
  return(
    <div className="navbar">
    <div className="version">
  <svg  style={{ WebkitTapHighlightColor: 'transparent'}} onClick={sidebarHandler} className='menu' fill={theme==='dark'?'aliceblue':'#484848'} height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg"><path class="heroicon-ui" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/></svg>
   <div>
   {questionId && <FaTrash
    style = {{
      transition : 'color 0.3s ease',
      WebkitTapHighlightColor:'transparent'
    }}size={24} color={mouseHovered?'#ED2939':iconColor} title='Delete this chat'
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}

    onClick={onDeleteChat}
    />}
</div>
   
    <div onClick={theme === 'dark'? toggleLight : toggleDark}  title='Toggle Mode' className="theme-changer">
   
     {theme === 'light' ? <svg style={{marginBottom:'6px',WebkitTapHighlightColor:'transparent'}} className="bi bi-moon-stars-fill" fill="#333" height="35" viewBox="0 0 16 16" width="35" xmlns="http://www.w3.org/2000/svg"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/></svg> :
    <svg  xmlns="http://www.w3.org/2000/svg" fill='aliceblue' x="0px" y="0px" width="47" height="47" viewBox="0 0 50 50">
<path d="M 24.984375 3.9863281 A 1.0001 1.0001 0 0 0 24 5 L 24 11 A 1.0001 1.0001 0 1 0 26 11 L 26 5 A 1.0001 1.0001 0 0 0 24.984375 3.9863281 z M 10.888672 9.890625 A 1.0001 1.0001 0 0 0 10.193359 11.607422 L 14.392578 15.806641 A 1.0001 1.0001 0 1 0 15.806641 14.392578 L 11.607422 10.193359 A 1.0001 1.0001 0 0 0 10.888672 9.890625 z M 39.080078 9.890625 A 1.0001 1.0001 0 0 0 38.392578 10.193359 L 34.193359 14.392578 A 1.0001 1.0001 0 1 0 35.607422 15.806641 L 39.806641 11.607422 A 1.0001 1.0001 0 0 0 39.080078 9.890625 z M 25 15 A 1.0001 1.0001 0 0 0 24.900391 15.003906 A 1.0001 1.0001 0 0 0 24.800781 15.017578 A 1.0001 1.0001 0 0 0 24.591797 15.082031 C 21.997611 15.191772 19.639402 16.21216 17.925781 17.925781 C 16.117449 19.734126 15 22.233333 15 25 C 15 30.533333 19.466667 35 25 35 C 29.15 35 32.699219 32.487109 34.214844 28.896484 C 34.720052 27.699609 35 26.383333 35 25 C 35 20.85 32.487109 17.300781 28.896484 15.785156 C 27.82556 15.333112 26.634837 15.134077 25.410156 15.082031 A 1.0001 1.0001 0 0 0 25.363281 15.0625 A 1.0001 1.0001 0 0 0 25.169922 15.011719 A 1.0001 1.0001 0 0 0 25.070312 15.001953 A 1.0001 1.0001 0 0 0 25 15 z M 5 24 A 1.0001 1.0001 0 1 0 5 26 L 11 26 A 1.0001 1.0001 0 1 0 11 24 L 5 24 z M 39 24 A 1.0001 1.0001 0 1 0 39 26 L 45 26 A 1.0001 1.0001 0 1 0 45 24 L 39 24 z M 15.080078 33.890625 A 1.0001 1.0001 0 0 0 14.392578 34.193359 L 10.193359 38.392578 A 1.0001 1.0001 0 1 0 11.607422 39.806641 L 15.806641 35.607422 A 1.0001 1.0001 0 0 0 15.080078 33.890625 z M 34.888672 33.890625 A 1.0001 1.0001 0 0 0 34.193359 35.607422 L 38.392578 39.806641 A 1.0001 1.0001 0 1 0 39.806641 38.392578 L 35.607422 34.193359 A 1.0001 1.0001 0 0 0 34.888672 33.890625 z M 24.984375 37.986328 A 1.0001 1.0001 0 0 0 24 39 L 24 45 A 1.0001 1.0001 0 1 0 26 45 L 26 39 A 1.0001 1.0001 0 0 0 24.984375 37.986328 z"></path>
</svg>}
    </div>

    </div>
    </div>
  )
}