import Head from 'next/head';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import '../styles/globals.css';
import { ThemeProvider } from 'context/context';

function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <ThemeProvider>
      <Component {...pageProps} />
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
