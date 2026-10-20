 interface AuthLayoutProps {
    children: React.ReactNode
 }

 export default function Layout({children} : AuthLayoutProps) {
  return (
    <>
      <main>
        { children }
      </main>
    </>
  )
}