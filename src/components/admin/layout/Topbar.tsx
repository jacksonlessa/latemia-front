"use client";

import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/session";
import { HeaderClientSearch } from "./header-client-search/HeaderClientSearch";

interface TopbarProps {
  user: SessionUser;
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const initials = user.email.slice(0, 2).toUpperCase();
  const displayName = user.email.split("@")[0];
  const roleLabel = user.role === "admin" ? "Administrador" : "Atendente";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Search Bar */}
      <div className="hidden max-w-lg flex-1 md:block">
        <HeaderClientSearch />
      </div>

      {/* Mobile Search Button — out of scope; signaled as inert for a11y */}
      <button
        type="button"
        aria-disabled="true"
        tabIndex={-1}
        title="Em breve"
        className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
      >
        <Search className="h-5 w-5 text-[#6B6B6E]" />
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-gray-100"
            disabled={loggingOut}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#4E8C75] text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-sm text-[#2C2C2E]">{displayName}</span>
              <span className="text-xs text-[#6B6B6E]">{roleLabel}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-[#2C2C2E]">{displayName}</p>
              <p className="text-xs text-[#6B6B6E]">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-[#C94040] focus:text-[#C94040]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? "Saindo…" : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
