import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/context/StoreProvider";
import { ModalProvider } from "@/context/ModalContext";
import TanStackQueryProvider from "@/providers/TanStackQueryProvider";
import "../../src/styles/globals.css";
import LayoutClientShell from "../components/layout/LayoutClientShell"; // Import the new client component
import { ToastContainer } from 'react-toastify';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Synxa Devops - Kanban Board",
  description: "Agile project management and DevOps platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}>
        <TanStackQueryProvider>
          <StoreProvider>
            <ModalProvider>
                
              <div className="flex flex-col overflow-hidden">
                <LayoutClientShell>{children}</LayoutClientShell>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </div>
            </ModalProvider>
          </StoreProvider>
        </TanStackQueryProvider>
      </body>
    </html>
  );
}
