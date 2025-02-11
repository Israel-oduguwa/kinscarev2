import Navbar from "@/WebPages/Navbar";
import Footer from "@/WebPages/Footer";

export default function Layout({ children }: any) {
  return (
    <>
      <Navbar />
      <main className="mt-10">{children}</main>
      <Footer />
    </>
  );
}
