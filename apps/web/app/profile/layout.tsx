/**
 * Profile is a top-level section (not under dashboard).
 * No sidebar; only root layout (Header + Footer) wraps this.
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-screenriot-bg">
      <div className="mx-auto max-w-4xl px-6 py-8 text-gray-100">
        {children}
      </div>
    </div>
  );
}
