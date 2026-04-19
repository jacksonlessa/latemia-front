type Props = { env: string | undefined };

export function HomologBanner({ env }: Props) {
  if (env !== 'homolog') return null;

  return (
    <div
      role="status"
      aria-label="Ambiente de homologação"
      className="w-full bg-yellow-400 text-yellow-900 text-center text-sm font-semibold py-1.5 px-4 sticky top-0 z-50"
    >
      ⚠ Ambiente de Homologação — o que você fizer aqui não tem efeito real
    </div>
  );
}
