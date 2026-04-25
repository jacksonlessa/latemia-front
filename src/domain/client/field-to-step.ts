/**
 * Mapa de campo de formulário para índice de passo do stepper.
 *
 * Utilizado para navegação automática ao passo correto quando o backend
 * retorna erros de validação mapeados a campos específicos.
 *
 * Extensível: tasks do Passo B adicionarão entradas para campos de pets
 * e contrato (steps 1, 2, 3).
 */
export const FIELD_TO_STEP: Readonly<Record<string, 0 | 1 | 2 | 3>> = {
  name: 0,
  cpf: 0,
  email: 0,
  phone: 0,
  'address.cep': 0,
  'address.street': 0,
  'address.number': 0,
  'address.complement': 0,
  'address.neighborhood': 0,
  'address.city': 0,
  'address.state': 0,
};

/**
 * Dado um mapa de erros de campo e uma função de navegação, navega para o
 * menor índice de passo entre os campos com erro.
 *
 * - Ignora a chave especial `_form` (erros gerais, não associados a passo).
 * - Ignora campos não presentes em `FIELD_TO_STEP`.
 * - Se nenhum campo mapeável tiver erro, não chama `setStep`.
 *
 * @param fieldErrors - Mapa de campo → mensagem de erro (ex.: `{ phone: 'Inválido' }`).
 * @param setStep - Callback do stepper para alterar o passo atual.
 */
export function navigateToFieldStep(
  fieldErrors: Record<string, string>,
  setStep: (s: 0 | 1 | 2 | 3) => void,
): void {
  const steps = Object.keys(fieldErrors)
    .filter((k) => k !== '_form' && k in FIELD_TO_STEP)
    .map((k) => FIELD_TO_STEP[k]);

  if (steps.length === 0) return;

  setStep(Math.min(...steps) as 0 | 1 | 2 | 3);
}
