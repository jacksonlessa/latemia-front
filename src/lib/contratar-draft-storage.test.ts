import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDraft,
  saveDraft,
  clearDraft,
  type ContratarDraft,
} from '@/lib/contratar-draft-storage';

const STORAGE_KEY = 'latemia:contratar:draft:v1';

const makeDraft = (overrides: Partial<ContratarDraft> = {}): ContratarDraft => ({
  step: 0,
  client: {
    name: 'Test User',
    cpf: '000.000.001-91',
    phone: '(11) 99999-0001',
    email: 'test@example.com',
  },
  pets: [
    {
      _id: 'pet-uuid-1',
      name: 'Rex',
      species: 'canino',
      breed: 'Labrador',
      birthDate: new Date('2020-01-15T00:00:00.000Z'),
      sex: 'male',
      weight: 25,
      castrated: false,
    },
  ],
  contractAccepted: false,
  contractAcceptedAt: null,
  ...overrides,
});

describe('contratar-draft-storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('saveDraft / loadDraft', () => {
    it('should round-trip a draft and rehydrate birthDate to a Date', () => {
      const draft = makeDraft();
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded).not.toBeNull();
      expect(loaded?.pets[0].birthDate).toBeInstanceOf(Date);
      expect(loaded?.pets[0].birthDate.toISOString()).toBe(
        draft.pets[0].birthDate.toISOString(),
      );
      expect(loaded?.pets[0].sex).toBe('male');
      expect(loaded?.client.name).toBe('Test User');
    });

    it('should persist step value correctly when saving and loading', () => {
      const draft = makeDraft({ step: 2, contractAccepted: true });
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded?.step).toBe(2);
      expect(loaded?.contractAccepted).toBe(true);
    });

    it('should persist contractAcceptedAt timestamp when saving and loading', () => {
      const timestamp = '2026-04-18T12:00:00.000Z';
      const draft = makeDraft({ contractAcceptedAt: timestamp });
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded?.contractAcceptedAt).toBe(timestamp);
    });

    it('should overwrite previous draft when saving a new one', () => {
      saveDraft(makeDraft({ step: 0 }));
      saveDraft(makeDraft({ step: 3 }));
      const loaded = loadDraft();
      expect(loaded?.step).toBe(3);
    });

    it('should serialize birthDate as ISO 8601 string in sessionStorage', () => {
      const draft = makeDraft();
      saveDraft(draft);
      const raw = sessionStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.version).toBe(2);
      expect(typeof parsed.pets[0].birthDate).toBe('string');
      expect(parsed.pets[0].birthDate).toBe(
        draft.pets[0].birthDate.toISOString(),
      );
    });

    it('should preserve pets as an empty array when none have been added', () => {
      const draft = makeDraft({ pets: [] });
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded?.pets).toEqual([]);
    });
  });

  describe('loadDraft', () => {
    it('should return null when no draft has been saved', () => {
      expect(loadDraft()).toBeNull();
    });

    it('should return null when JSON in sessionStorage is corrupted', () => {
      sessionStorage.setItem(STORAGE_KEY, 'INVALID_JSON{{{{');
      expect(loadDraft()).toBeNull();
    });

    it('should return null when sessionStorage value is an empty string', () => {
      sessionStorage.setItem(STORAGE_KEY, '');
      expect(loadDraft()).toBeNull();
    });

    it('should silently discard a draft persisted under an older version', () => {
      // Simulates a v1 draft (no `version` field, legacy pet shape with age_*).
      const legacy = {
        step: 1,
        client: { name: 'Legacy User' },
        pets: [
          {
            _id: 'legacy-pet-1',
            name: 'Old Rex',
            species: 'canino',
            breed: 'SRD',
            age_years: 2,
            age_months: 0,
            weight: 10,
            castrated: false,
          },
        ],
        contractAccepted: false,
        contractAcceptedAt: null,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      expect(loadDraft()).toBeNull();
    });
  });

  describe('OTP fields (Task 10.0)', () => {
    it('should persist contractAttemptId when present in the draft', () => {
      const draft = makeDraft({
        contractAttemptId: '11111111-2222-3333-4444-555555555555',
      });
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded?.contractAttemptId).toBe(
        '11111111-2222-3333-4444-555555555555',
      );
    });

    it('should persist otpVerificationToken when present in the draft', () => {
      const draft = makeDraft({ otpVerificationToken: 'tok_opaque_xyz' });
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded?.otpVerificationToken).toBe('tok_opaque_xyz');
    });

    it('should round-trip both OTP fields together', () => {
      const draft = makeDraft({
        contractAttemptId: '11111111-2222-3333-4444-555555555555',
        otpVerificationToken: 'tok_opaque_xyz',
      });
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded?.contractAttemptId).toBe(
        '11111111-2222-3333-4444-555555555555',
      );
      expect(loaded?.otpVerificationToken).toBe('tok_opaque_xyz');
    });

    it('should tolerate legacy drafts (v2 without OTP fields) as undefined', () => {
      // Simulate a draft saved before Task 10.0 — no OTP fields present.
      const legacy: Record<string, unknown> = {
        version: 2,
        step: 2,
        client: { name: 'Legacy User' },
        pets: [],
        contractAccepted: true,
        contractAcceptedAt: '2026-04-18T12:00:00.000Z',
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      const loaded = loadDraft();
      expect(loaded).not.toBeNull();
      expect(loaded?.contractAttemptId).toBeUndefined();
      expect(loaded?.otpVerificationToken).toBeUndefined();
    });

    it('should not include OTP fields in serialized payload when not provided', () => {
      const draft = makeDraft();
      saveDraft(draft);
      const raw = sessionStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!) as Record<string, unknown>;
      // The JSON.stringify call drops `undefined` keys — so the serialized
      // form does NOT carry the OTP keys at all.
      expect('contractAttemptId' in parsed).toBe(false);
      expect('otpVerificationToken' in parsed).toBe(false);
    });
  });

  describe('clearDraft', () => {
    it('should remove the draft key from sessionStorage when called after saving', () => {
      saveDraft(makeDraft());
      expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
      clearDraft();
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should return null from loadDraft when called after clearing', () => {
      saveDraft(makeDraft());
      clearDraft();
      expect(loadDraft()).toBeNull();
    });

    it('should not throw when clearing a non-existent draft', () => {
      expect(() => clearDraft()).not.toThrow();
    });
  });
});
