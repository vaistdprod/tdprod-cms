import type { Metadata } from "next"
import { Poppins, Open_Sans } from "next/font/google"
import "@/app/globals.css"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Dr. Sarah's Pediatric Practice",
  description: "Providing compassionate pediatric care for your children in a warm, welcoming environment.",
  keywords: "pediatrician, children's health, family doctor, pediatric care, child healthcare",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={cn(
        "min-h-screen bg-site1-background font-body antialiased",
        poppins.variable,
        openSans.variable
      )}>
        {children}
      </body>
    </html>
  )
}
