export function ErrorAlert({ error }: { error: string }) {
  return (
    <div
      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded-lg"
      role="alert"
    >
      <p className="font-semibold">Es ist ein Fehler aufgetreten:</p>
      <p>{error}</p>
    </div>
  );
}
