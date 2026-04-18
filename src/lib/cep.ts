/**
 * ViaCEP lookup utility.
 *
 * Calls the public ViaCEP API to fill in address fields automatically.
 * Returns null silently on any failure — callers must handle the null case
 * by leaving address fields editable for manual input.
 *
 * No personal data is included in the request; only the CEP (postal code)
 * digits are sent.
 */

export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Looks up Brazilian postal code (CEP) data via the public ViaCEP API.
 *
 * @param cep - CEP string in any format (e.g. "01310-100" or "01310100")
 * @returns Address data or null if the CEP is invalid, not found, or the
 *          request fails for any reason.
 */
export async function lookupCep(cep: string): Promise<CepResult | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    if (data.erro) return null;
    return {
      street: String(data.logradouro ?? ""),
      neighborhood: String(data.bairro ?? ""),
      city: String(data.localidade ?? ""),
      state: String(data.uf ?? ""),
    };
  } catch {
    // Network failure or JSON parse error — fail silently.
    return null;
  }
}
