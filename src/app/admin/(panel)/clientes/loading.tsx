export default function ClientesLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-64 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
