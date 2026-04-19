'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CpfInput } from '@/components/ui/cpf-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { CepInput } from '@/components/ui/cep-input';
import type { RegisterClientInput, AddressData } from '@/lib/types/client';
import type { CepResult } from '@/lib/cep';

export interface StepCadastroProps {
  data: Partial<RegisterClientInput>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onAddressLookup: (result: CepResult | null) => void;
  onNext: () => void;
}

export function StepCadastro({
  data,
  errors,
  onChange,
  onAddressLookup,
  onNext,
}: StepCadastroProps) {
  const address: Partial<AddressData> = data.address ?? {};

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: '#4E8C75' }}>
        Dados do titular
      </h2>

      <div className="space-y-4">
        {/* Nome completo */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={data.name ?? ''}
            onChange={(e) => onChange('name', e.target.value)}
            aria-describedby={errors['name'] ? 'name-error' : undefined}
            aria-invalid={!!errors['name']}
            placeholder="Seu nome completo"
          />
          {errors['name'] && (
            <p id="name-error" className="text-sm text-red-600" role="alert">
              {errors['name']}
            </p>
          )}
        </div>

        {/* CPF */}
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <CpfInput
            id="cpf"
            name="cpf"
            autoComplete="off"
            defaultValue={data.cpf ?? ''}
            key="cpf"
            onChange={(maskedValue) => onChange('cpf', maskedValue)}
            aria-describedby={errors['cpf'] ? 'cpf-error' : undefined}
            aria-invalid={!!errors['cpf']}
          />
          {errors['cpf'] && (
            <p id="cpf-error" className="text-sm text-red-600" role="alert">
              {errors['cpf']}
            </p>
          )}
        </div>

        {/* E-mail */}
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={data.email ?? ''}
            onChange={(e) => onChange('email', e.target.value)}
            aria-describedby={errors['email'] ? 'email-error' : undefined}
            aria-invalid={!!errors['email']}
            placeholder="seu@email.com"
          />
          {errors['email'] && (
            <p id="email-error" className="text-sm text-red-600" role="alert">
              {errors['email']}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <PhoneInput
            id="phone"
            name="phone"
            autoComplete="tel"
            defaultValue={data.phone ?? ''}
            key="phone"
            onChange={(maskedValue) => onChange('phone', maskedValue)}
            aria-describedby={errors['phone'] ? 'phone-error' : undefined}
            aria-invalid={!!errors['phone']}
          />
          {errors['phone'] && (
            <p id="phone-error" className="text-sm text-red-600" role="alert">
              {errors['phone']}
            </p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold" style={{ color: '#4E8C75' }}>
        Endereço
      </h2>

      <div className="space-y-4">
        {/* CEP */}
        <div className="space-y-1.5">
          <Label htmlFor="address.cep">CEP</Label>
          <CepInput
            id="address.cep"
            name="address.cep"
            autoComplete="postal-code"
            defaultValue={address.cep ?? ''}
            key="cep"
            onLookup={onAddressLookup}
            onChange={(maskedValue) => onChange('address.cep', maskedValue)}
            aria-describedby={errors['address.cep'] ? 'address-cep-error' : undefined}
            aria-invalid={!!errors['address.cep']}
          />
          {errors['address.cep'] && (
            <p id="address-cep-error" className="text-sm text-red-600" role="alert">
              {errors['address.cep']}
            </p>
          )}
        </div>

        {/* Rua */}
        <div className="space-y-1.5">
          <Label htmlFor="address.street">Rua</Label>
          <Input
            id="address.street"
            name="address.street"
            type="text"
            autoComplete="street-address"
            value={address.street ?? ''}
            onChange={(e) => onChange('address.street', e.target.value)}
            aria-describedby={errors['address.street'] ? 'address-street-error' : undefined}
            aria-invalid={!!errors['address.street']}
            placeholder="Nome da rua"
          />
          {errors['address.street'] && (
            <p id="address-street-error" className="text-sm text-red-600" role="alert">
              {errors['address.street']}
            </p>
          )}
        </div>

        {/* Número */}
        <div className="space-y-1.5">
          <Label htmlFor="address.number">Número</Label>
          <Input
            id="address.number"
            name="address.number"
            type="text"
            autoComplete="off"
            value={address.number ?? ''}
            onChange={(e) => onChange('address.number', e.target.value)}
            aria-describedby={errors['address.number'] ? 'address-number-error' : undefined}
            aria-invalid={!!errors['address.number']}
            placeholder="123"
          />
          {errors['address.number'] && (
            <p id="address-number-error" className="text-sm text-red-600" role="alert">
              {errors['address.number']}
            </p>
          )}
        </div>

        {/* Bairro */}
        <div className="space-y-1.5">
          <Label htmlFor="address.neighborhood">Bairro</Label>
          <Input
            id="address.neighborhood"
            name="address.neighborhood"
            type="text"
            autoComplete="off"
            value={address.neighborhood ?? ''}
            onChange={(e) => onChange('address.neighborhood', e.target.value)}
            aria-describedby={
              errors['address.neighborhood'] ? 'address-neighborhood-error' : undefined
            }
            aria-invalid={!!errors['address.neighborhood']}
            placeholder="Bairro"
          />
          {errors['address.neighborhood'] && (
            <p id="address-neighborhood-error" className="text-sm text-red-600" role="alert">
              {errors['address.neighborhood']}
            </p>
          )}
        </div>

        {/* Cidade */}
        <div className="space-y-1.5">
          <Label htmlFor="address.city">Cidade</Label>
          <Input
            id="address.city"
            name="address.city"
            type="text"
            autoComplete="address-level2"
            value={address.city ?? ''}
            onChange={(e) => onChange('address.city', e.target.value)}
            aria-describedby={errors['address.city'] ? 'address-city-error' : undefined}
            aria-invalid={!!errors['address.city']}
            placeholder="Cidade"
          />
          {errors['address.city'] && (
            <p id="address-city-error" className="text-sm text-red-600" role="alert">
              {errors['address.city']}
            </p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <Label htmlFor="address.state">Estado (UF)</Label>
          <Input
            id="address.state"
            name="address.state"
            type="text"
            autoComplete="address-level1"
            value={address.state ?? ''}
            onChange={(e) => onChange('address.state', e.target.value.toUpperCase().slice(0, 2))}
            aria-describedby={errors['address.state'] ? 'address-state-error' : undefined}
            aria-invalid={!!errors['address.state']}
            placeholder="SP"
            maxLength={2}
            className="max-w-[6rem]"
          />
          {errors['address.state'] && (
            <p id="address-state-error" className="text-sm text-red-600" role="alert">
              {errors['address.state']}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onNext}
          style={{ backgroundColor: '#4E8C75', color: '#fff' }}
          className="hover:opacity-90"
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
