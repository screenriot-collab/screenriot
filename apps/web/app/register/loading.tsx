export default function RegisterLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-screenriot-bg" aria-live="polite" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-screenriot-muted border-t-screenriot-accent" />
    </div>
  );
}
