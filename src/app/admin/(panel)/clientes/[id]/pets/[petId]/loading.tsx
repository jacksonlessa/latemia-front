export default function PetDetailLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
