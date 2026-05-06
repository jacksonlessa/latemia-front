import { Pencil, Phone, Mail, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClientDetail, AddressDetail } from '@/lib/types/client';

interface ClientHeaderCardProps {
  client: Pick<ClientDetail, 'name' | 'cpf' | 'phone' | 'email' | 'addresses'>;
  onEditClient?: () => void;
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatAddress(address: AddressDetail): string {
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.city,
    address.state,
    address.cep,
  ].filter(Boolean);
  return parts.join(', ');
}

/**
 * ClientHeaderCard — Server-friendly organism (no 'use client').
 *
 * Displays the client's name, CPF, phone, email and primary address.
 * The "Editar cliente" button calls `onEditClient` (passed down from a Client
 * Component parent). In a purely server render the button can be omitted by
 * not providing the prop.
 */
export function ClientHeaderCard({ client, onEditClient }: ClientHeaderCardProps) {
  const primaryAddress = client.addresses[0];

  return (
    <div className="rounded-lg border bg-card p-5">
      {/* Name row with edit action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <User className="size-5 text-[#4E8C75] shrink-0" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-foreground truncate">
            {client.name}
          </h1>
        </div>
        {onEditClient && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClient}
            className="shrink-0"
            aria-label="Editar dados do cliente"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar cliente
          </Button>
        )}
      </div>

      {/* Info grid */}
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3">
        {/* CPF */}
        <div>
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            CPF
          </dt>
          <dd className="mt-0.5 text-sm text-foreground tabular-nums">
            {formatCpf(client.cpf)}
          </dd>
        </div>

        {/* Telefone */}
        <div>
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Phone className="size-3" aria-hidden="true" />
            Telefone
          </dt>
          <dd className="mt-0.5 text-sm text-foreground">
            {formatPhone(client.phone)}
          </dd>
        </div>

        {/* E-mail */}
        <div>
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Mail className="size-3" aria-hidden="true" />
            E-mail
          </dt>
          <dd className="mt-0.5 text-sm text-foreground truncate">
            {client.email}
          </dd>
        </div>
      </dl>

      {/* Address */}
      {primaryAddress && (
        <div className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 mt-0.5 text-[#4E8C75]" aria-hidden="true" />
          <address className="not-italic">{formatAddress(primaryAddress)}</address>
        </div>
      )}
    </div>
  );
}
