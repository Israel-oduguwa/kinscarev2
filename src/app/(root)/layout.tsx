import Footer from "@/WebPages/Footer";
import JumpstartBannerTop from "@/WebPages/HomePage/JumpstartBanner";
import Navbar from "@/WebPages/Navbar";

export default function RootPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
      
        <div>
          {/* We place the Navbar*/}
          <Navbar />
        </div>
        {/* Place children where you want to render a page or nested layout */}
        <main>{children} </main>
        <Footer />
      </body>
    </html>
  );
}
