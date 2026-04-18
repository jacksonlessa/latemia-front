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
      age_years: 2,
      age_months: 3,
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
    it('should return the same object when loading after saving (round-trip)', () => {
      const draft = makeDraft();
      saveDraft(draft);
      const loaded = loadDraft();
      expect(loaded).toEqual(draft);
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
