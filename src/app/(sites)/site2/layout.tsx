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
  title: "Professional Pediatric Clinic",
  description: "Expert pediatric care with a focus on your child's health and well-being.",
  keywords: "pediatric clinic, children's healthcare, pediatrician, medical care, child development",
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
        "min-h-screen bg-site2-background font-body antialiased",
        poppins.variable,
        openSans.variable
      )}>
        {children}
      </body>
    </html>
  )
}
