import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { getVerification } from "@/lib/profile-api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  let isVerified = false;
  if (session.user?.role === 'filmmaker') {
    try {
      const v = await getVerification(session.accessToken);
      isVerified = v.status === 'verified';
    } catch {
      isVerified = false;
    }
  }

  return (
    <div className="flex min-h-screen bg-screenriot-bg">
      <aside
        className="w-56 shrink-0 border-l border-white/10 bg-screenriot-bg-card p-4"
        aria-label="Dashboard navigation"
      >
        <DashboardNav userRole={session.user?.role} isVerified={isVerified} />
      </aside>
      <main className="min-w-0 flex-1 p-6 text-gray-100">{children}</main>
    </div>
  );
}
