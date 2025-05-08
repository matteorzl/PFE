import { NavbarProvider } from "@/context/NavbarContext";
import '../styles/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <NavbarProvider>
          {children}
        </NavbarProvider>
      </body>
    </html>
  )
}