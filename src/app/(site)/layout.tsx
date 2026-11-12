import BackgroundMusic from "@/components/BackgroundMusic";
import BoxDrawer from "@/components/BoxDrawer";
import SetupNotice from "@/components/SetupNotice";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BoxDrawer />
      <SetupNotice />
      <BackgroundMusic />
    </>
  );
}
