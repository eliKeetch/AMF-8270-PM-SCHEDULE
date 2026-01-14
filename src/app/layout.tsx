import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MachineProvider } from "@/hooks/MachineContext";
import { ScheduleProvider } from "@/hooks/ScheduleContext";
import { MaintenanceProvider } from "@/hooks/MaintenanceContext";
import { IssueProvider } from "@/hooks/IssueContext";
import { UserProvider } from "@/hooks/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMF 82-70 Maintenance Pro",
  description: "Preventative maintenance schedule for bowling pinsetters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <UserProvider>
          <MachineProvider>
            <IssueProvider>
              <MaintenanceProvider>
                <ScheduleProvider>
                  {children}
                </ScheduleProvider>
              </MaintenanceProvider>
            </IssueProvider>
          </MachineProvider>
        </UserProvider>
      </body>
    </html>
  );
}
