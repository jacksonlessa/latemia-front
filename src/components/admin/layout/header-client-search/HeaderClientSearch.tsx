"use client";

/**
 * HeaderClientSearch
 * ---------------------------------------------------------------------------
 * Organism that wires the admin Topbar's client lookup: a controlled input,
 * a popover with the result list and the WAI-ARIA combobox semantics that
 * keep keyboard + screen-reader UX correct.
 *
 * State machine — `Status`:
 *   idle    → input < 2 chars OR no query in flight; popover closed.
 *   loading → debounced term ≥ 2 chars; fetch in flight; popover open with
 *             "Buscando…".
 *   results → fetch resolved with ≥ 1 hit; popover open with the list +
 *             "Ver todos os resultados" footer.
 *   empty   → fetch resolved with 0 hits; popover open with empty message.
 *   error   → fetch rejected (non-abort); popover open with error message.
 *             No retry button — the next keystroke retries automatically.
 *
 * Race-condition prevention: every new debounced term aborts the previous
 * fetch via a single `AbortController`. Errors with `name === "AbortError"`
 * are intentionally ignored — they are cancellations, not real failures.
 *
 * Closure rules:
 *   - clicking outside the wrapper (`mousedown` listener on `document`).
 *   - pressing `Escape` (popover closes; term in input is preserved).
 *   - pressing `Tab` (no navigation; popover closes).
 *   - the component unmounting (route change in App Router triggers
 *     unmount when the layout slot changes; the regular `useEffect`
 *     cleanup is enough — no custom router event listener needed).
 *
 * LGPD: the term may contain PII (CPF, phone, email). It is held only in
 * component state and forwarded to the internal Route Handler via query
 * string. Nothing is logged here. The displayed CPF/phone are already
 * masked by the backend (`cpfMasked`/`phoneMasked`).
 *
 * Reuses:
 *   - `searchClientsForHeader` (task 2.0) — fetcher with `AbortSignal`.
 *   - `HeaderSearchResultItem`  (task 3.0) — single-row presentation.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import {
  searchClientsForHeader as defaultSearchClientsForHeader,
  type ClientListItem,
} from "@/lib/api-client";

import { HeaderSearchResultItem } from "./HeaderSearchResultItem";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Status = "idle" | "loading" | "results" | "empty" | "error";

/** Contract used by stories/tests to inject a mock fetcher. */
export type ClientSearchFetcher = (
  term: string,
  signal: AbortSignal,
) => Promise<ClientListItem[]>;

export interface HeaderClientSearchProps {
  /**
   * Optional dependency injection for the fetcher. Defaults to the real
   * `searchClientsForHeader` helper. Stories and unit tests pass a mock so
   * each visual variant renders deterministically without hitting the
   * network.
   */
  fetcher?: ClientSearchFetcher;
  /**
   * Optional initial term — used by stories like `KeyboardNavigation` to
   * pre-populate the input so the popover renders open with content.
   */
  initialTerm?: string;
  /**
   * Optional initial open flag — only respected when `initialTerm` is also
   * provided. Defaults to `false` (idle/closed).
   */
  initialOpen?: boolean;
  /**
   * Optional initial highlighted index — used by the `KeyboardNavigation`
   * story to demonstrate the active option visual.
   */
  initialHighlightedIndex?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 250;
const MIN_TERM_LENGTH = 2;
const MAX_VISIBLE_RESULTS = 8;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeaderClientSearch({
  fetcher = defaultSearchClientsForHeader,
  initialTerm = "",
  initialOpen = false,
  initialHighlightedIndex = -1,
}: HeaderClientSearchProps = {}): ReactElement {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Stable ARIA ids — `useId()` is SSR-safe.
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const optionId = useCallback(
    (index: number): string => `${reactId}-option-${index}`,
    [reactId],
  );

  const [term, setTerm] = useState<string>(initialTerm);
  const [debouncedTerm, setDebouncedTerm] = useState<string>(initialTerm);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<ClientListItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(
    initialHighlightedIndex,
  );
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  // -------------------------------------------------------------------------
  // 1. Debounce term → debouncedTerm.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedTerm(term);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
    };
  }, [term]);

  // -------------------------------------------------------------------------
  // 2. React to debouncedTerm: trigger fetch, abort previous, drive status.
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Below threshold → close popover, reset to idle, cancel any in-flight.
    if (debouncedTerm.trim().length < MIN_TERM_LENGTH) {
      abortRef.current?.abort();
      abortRef.current = null;
      setStatus("idle");
      setResults([]);
      setHighlightedIndex(-1);
      setIsOpen(false);
      return;
    }

    // Cancel previous request (if any) and start a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setIsOpen(true);
    setHighlightedIndex(-1);

    fetcher(debouncedTerm.trim(), controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        const limited = data.slice(0, MAX_VISIBLE_RESULTS);
        setResults(limited);
        setStatus(limited.length === 0 ? "empty" : "results");
      })
      .catch((error: unknown) => {
        // Ignore intentional cancellations — they are not real errors.
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setResults([]);
        setStatus("error");
      });

    return () => {
      controller.abort();
    };
  }, [debouncedTerm, fetcher]);

  // -------------------------------------------------------------------------
  // 3. Click-outside listener → close popover (preserve term).
  // -------------------------------------------------------------------------
  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent): void {
      const node = containerRef.current;
      if (!node) return;
      if (event.target instanceof Node && node.contains(event.target)) return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  // -------------------------------------------------------------------------
  // 4. Final teardown — abort any in-flight request when the component
  //    unmounts (covers route changes that swap the layout slot).
  // -------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  // -------------------------------------------------------------------------
  // Selection handler — closes the popover and navigates to the detail.
  // -------------------------------------------------------------------------
  const handleSelect = useCallback(
    (client: ClientListItem): void => {
      setIsOpen(false);
      router.push(`/admin/clientes/${client.id}`);
    },
    [router],
  );

  // -------------------------------------------------------------------------
  // Keyboard navigation on the input.
  // -------------------------------------------------------------------------
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // Tab always closes (no preventDefault — let focus move naturally).
    if (event.key === "Tab") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    // The remaining shortcuts only make sense while the popover shows
    // selectable rows.
    if (!isOpen || status !== "results" || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => {
        const next = current + 1;
        return next >= results.length ? 0 : next;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => {
        const next = current - 1;
        return next < 0 ? results.length - 1 : next;
      });
      return;
    }

    if (event.key === "Enter") {
      if (highlightedIndex < 0 || highlightedIndex >= results.length) return;
      event.preventDefault();
      const target = results[highlightedIndex];
      if (target) handleSelect(target);
    }
  }

  // -------------------------------------------------------------------------
  // Input handlers.
  // -------------------------------------------------------------------------
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setTerm(event.target.value);
  }

  function handleFocus(): void {
    // Re-open the popover on focus when there is already content/state to
    // show (user clicked back into the input after blurring without
    // clearing the term).
    if (status !== "idle") {
      setIsOpen(true);
    }
  }

  // -------------------------------------------------------------------------
  // Derived values for ARIA.
  // -------------------------------------------------------------------------
  const popoverIsVisible = isOpen && status !== "idle";
  const activeDescendant =
    popoverIsVisible &&
    status === "results" &&
    highlightedIndex >= 0 &&
    highlightedIndex < results.length
      ? optionId(highlightedIndex)
      : undefined;

  // -------------------------------------------------------------------------
  // Render.
  // -------------------------------------------------------------------------
  return (
    <div ref={containerRef} className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B6B6E]"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={term}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nome, CPF, e-mail ou telefone..."
        className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-[#2C2C2E] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4E8C75]"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={popoverIsVisible}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-label="Buscar clientes"
        autoComplete="off"
        spellCheck={false}
      />

      {popoverIsVisible ? (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          // The container itself is not a listbox; only the <ul> below is.
        >
          {status === "loading" ? (
            <div
              className="flex items-center gap-2 px-3 py-3 text-sm text-[#6B6B6E]"
              role="status"
              aria-live="polite"
            >
              <span
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#4E8C75] border-t-transparent"
                aria-hidden="true"
              />
              <span>Buscando…</span>
            </div>
          ) : null}

          {status === "empty" ? (
            <div
              className="px-3 py-3 text-sm text-[#6B6B6E]"
              role="status"
              aria-live="polite"
            >
              Nenhum cliente encontrado
            </div>
          ) : null}

          {status === "error" ? (
            <div
              className="px-3 py-3 text-sm text-[#C94040]"
              role="alert"
              aria-live="assertive"
            >
              Não foi possível buscar. Tente novamente.
            </div>
          ) : null}

          {status === "results" ? (
            <>
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Resultados da busca de clientes"
                className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto"
              >
                {results.map((client, index) => (
                  <HeaderSearchResultItem
                    key={client.id}
                    id={optionId(index)}
                    client={client}
                    isHighlighted={index === highlightedIndex}
                    onSelect={() => handleSelect(client)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  />
                ))}
              </ul>
              <div className="border-t border-gray-100 bg-[#FAFAF8] px-3 py-2 text-right">
                <Link
                  href={`/admin/clientes?search=${encodeURIComponent(term)}`}
                  className="text-sm font-medium text-[#4E8C75] hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Ver todos os resultados →
                </Link>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
