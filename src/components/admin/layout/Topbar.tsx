"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const units = [
  { id: 1, name: "Unidade Camboriú" },
  { id: 2, name: "Unidade Florianópolis" },
  { id: 3, name: "Unidade Itajaí" },
];

const notifications = [
  { id: 1, text: "Novo plano cadastrado para Rex", time: "5 min atrás" },
  { id: 2, text: "Pagamento confirmado - Tutor João Silva", time: "15 min atrás" },
  { id: 3, text: "Carência finalizada - Pet Luna", time: "1h atrás" },
];

export function Topbar() {
  const [selectedUnit, setSelectedUnit] = useState(units[0]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Search Bar */}
      <div className="hidden max-w-lg flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B6B6E]" />
          <input
            type="text"
            placeholder="Buscar por CPF, nome ou telefone..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-[#2C2C2E] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4E8C75]"
          />
        </div>
      </div>

      {/* Mobile Search Button */}
      <button className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden">
        <Search className="h-5 w-5 text-[#6B6B6E]" />
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-[#6B6B6E]" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#C94040]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-200 p-4">
                <h3 className="font-semibold text-[#2C2C2E]">Notificações</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="cursor-pointer border-b border-gray-100 p-4 last:border-b-0 hover:bg-gray-50"
                  >
                    <p className="text-sm text-[#2C2C2E]">{notif.text}</p>
                    <p className="mt-1 text-xs text-[#6B6B6E]">{notif.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Unit Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 outline-none transition-colors hover:bg-gray-100">
            <span className="hidden text-sm text-[#2C2C2E] lg:inline">
              {selectedUnit.name}
            </span>
            <span className="text-sm text-[#2C2C2E] lg:hidden">
              {selectedUnit.name.split(" ")[1]}
            </span>
            <ChevronDown className="h-4 w-4 text-[#6B6B6E]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {units.map((unit) => (
              <DropdownMenuItem
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={unit.id === selectedUnit.id ? "bg-[#EAF4F0]" : ""}
              >
                {unit.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#4E8C75] text-white">A</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-[#2C2C2E] sm:inline">Admin</span>
        </div>
      </div>
    </header>
  );
}
