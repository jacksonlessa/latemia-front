// Centralised content for /sobre-a-clinica — pure data, no React.
// TODO(site-dr-cleitinho): preencher address, mapsUrl e institutionalUrl com o cliente.

export interface ClinicaContent {
  name: string;
  city: string;
  /** Endereço completo — a preencher */
  address: string;
  /** URL do Google Maps — a preencher (ver mapsUrl em content/landing.ts) */
  mapsUrl: string;
  /** Site institucional externo da clínica — a preencher */
  institutionalUrl: string;
  services: string[];
}

export const clinicaContent: ClinicaContent = {
  name: 'Clínica Veterinária Dr. Cleitinho',
  city: 'Camboriú/SC',
  address: '',
  mapsUrl: '',
  institutionalUrl: '',
  services: [
    'Consultas clínicas',
    'Exames laboratoriais',
    'Cirurgias',
    'Emergências',
    'Microchipagem',
  ],
} as const;
