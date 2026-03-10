import { Outfit } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Presence Track - University Attendance Management",
  description:
    "Modern, secure, Wi-Fi based attendance management system for universities",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.className} min-h-screen bg-background antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
