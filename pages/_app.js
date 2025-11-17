import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";
import "leaflet/dist/leaflet.css";

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider 
      {...pageProps}
      appearance={{
        variables: {
          colorPrimary: '#4f46e5', // indigo to match your buttons
        }
      }}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}