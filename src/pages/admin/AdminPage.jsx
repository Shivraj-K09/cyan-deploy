import MobileNavigation from "@/components/mobileNaivgation";

export default function AdminPage() {
  return (
    <>
      <div>
        <div className="p-4">
          <h2 className="text-xl font-semibold">관리자 패널</h2>
        </div>
        <MobileNavigation />
      </div>
    </>
  );
}
