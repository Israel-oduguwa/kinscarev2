import { auth } from '@clerk/nextjs/server'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await auth()

  return <>{children}</>
}
