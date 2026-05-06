"use client";

/**
 * HeaderSearchResultItem
 * ---------------------------------------------------------------------------
 * Molecule that renders a single result row inside the admin Topbar's client
 * search dropdown. Pure presentational component: zero local state, zero
 * data fetching — it merely visualises a `ClientListItem` and emits
 * selection/hover events.
 *
 * UX notes:
 * - Uses `onMouseDown` (with `preventDefault`) instead of `onClick` so the
 *   surrounding input does not lose focus before the selection registers.
 *   This is the standard combobox pattern documented by WAI-ARIA.
 * - ARIA attributes (`role="option"`, `aria-selected`, `id`) are required by
 *   the parent organism (task 4.0) to drive `aria-activedescendant`.
 *
 * LGPD: receives already-masked CPF/phone (`cpfMasked`/`phoneMasked`); the
 * raw values never reach this layer.
 */

import type { MouseEvent, ReactElement } from "react";
import type { ClientListItem } from "@/lib/types/client";

export interface HeaderSearchResultItemProps {
  /** Search hit to render. CPF/phone are pre-masked by the backend. */
  client: ClientListItem;
  /** Whether this row is the currently keyboard-highlighted option. */
  isHighlighted: boolean;
  /** Called when the user picks this row (mouse or keyboard via parent). */
  onSelect: () => void;
  /** Called when the pointer enters the row (parent syncs highlight index). */
  onMouseEnter: () => void;
  /** DOM id used by `aria-activedescendant` on the combobox input. */
  id: string;
}

export function HeaderSearchResultItem({
  client,
  isHighlighted,
  onSelect,
  onMouseEnter,
  id,
}: HeaderSearchResultItemProps): ReactElement {
  function handleMouseDown(event: MouseEvent<HTMLLIElement>): void {
    // Keep the input focused so the parent's keyboard handlers stay attached
    // and the user can keep typing right after picking a result.
    event.preventDefault();
    onSelect();
  }

  const rowClassName = [
    "cursor-pointer px-3 py-2 transition-colors",
    isHighlighted ? "bg-[#E8F1ED]" : "bg-white hover:bg-[#F4F1EE]",
  ].join(" ");

  const nameClassName = isHighlighted
    ? "text-sm font-medium text-[#4E8C75]"
    : "text-sm font-medium text-[#2C2C2E]";

  return (
    <li
      id={id}
      role="option"
      aria-selected={isHighlighted}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
      className={rowClassName}
    >
      <p className={nameClassName}>{client.name}</p>
      <p className="text-xs text-[#6B6B6E]">
        {client.cpfMasked} · {client.phoneMasked}
      </p>
    </li>
  );
}
