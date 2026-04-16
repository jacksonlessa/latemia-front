"use client";

import {
  Home,
  User,
  Shield,
  Clipboard,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userRole: "admin" | "atendente";
}

const menuItems = [
  { path: "/admin/home", label: "Dashboard", icon: Home, roles: ["admin", "atendente"] },
  { path: "/admin/clientes", label: "Clientes", icon: User, roles: ["admin", "atendente"] },
  { path: "/admin/planos", label: "Planos", icon: Shield, roles: ["admin", "atendente"] },
  { path: "/admin/uso-beneficio", label: "Uso do Benefício", icon: Clipboard, roles: ["admin", "atendente"] },
  { path: "/admin/pagamentos", label: "Pagamentos", icon: DollarSign, roles: ["admin", "atendente"] },
  { path: "/admin/usuarios-internos", label: "Usuários Internos", icon: Users, roles: ["admin"] },
];

export function Sidebar({ collapsed, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-gray-200 bg-[#F4F9F7] transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4E8C75]">
                <span className="text-sm font-bold text-white">L&M</span>
              </div>
              <span className="font-semibold text-[#2C2C2E]">Late &amp; Mia</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#4E8C75]">
              <span className="text-sm font-bold text-white">L&M</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              const linkContent = (
                <Link
                  href={item.path}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-[#EAF4F0] text-[#4E8C75]"
                      : "text-[#6B6B6E] hover:bg-[#EAF4F0]/50 hover:text-[#4E8C75]",
                    collapsed && "justify-center",
                  )}
                >
                  {isActive && !collapsed && (
                    <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-[#4E8C75]" />
                  )}
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );

              return (
                <li key={item.path}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[#6B6B6E] transition-colors hover:bg-[#EAF4F0] hover:text-[#4E8C75]"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
