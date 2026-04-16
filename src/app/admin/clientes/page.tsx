export default function ClientesPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Clientes
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Gestão de clientes e tutores
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF4F0]">
          <span className="text-3xl">👥</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[#2C2C2E]">
          Em desenvolvimento
        </h3>
        <p className="max-w-md text-center text-[#6B6B6E]">
          A funcionalidade de gestão de clientes estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
