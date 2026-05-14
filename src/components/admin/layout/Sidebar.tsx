"use client";

import {
  Home,
  Shield,
  Clipboard,
  DollarSign,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Bell,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "admin" | "atendente";

type LeafItem = {
  kind: "leaf";
  path: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

type ParentItem = {
  kind: "parent";
  label: string;
  icon: LucideIcon;
  roles: Role[];
  children: LeafItem[];
};

type MenuItem = LeafItem | ParentItem;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userRole: Role;
}

const menuItems: MenuItem[] = [
  { kind: "leaf", path: "/admin/home", label: "Dashboard", icon: Home, roles: ["admin", "atendente"] },
  { kind: "leaf", path: "/admin/clientes", label: "Clientes", icon: Users, roles: ["admin", "atendente"] },
  { kind: "leaf", path: "/admin/planos", label: "Planos", icon: Shield, roles: ["admin", "atendente"] },
  { kind: "leaf", path: "/admin/uso-beneficio", label: "Uso do Benefício", icon: Clipboard, roles: ["admin"] },
  { kind: "leaf", path: "/admin/pagamentos", label: "Pagamentos", icon: DollarSign, roles: ["admin"] },
  { kind: "leaf", path: "/admin/usuarios-internos", label: "Usuários Internos", icon: Users, roles: ["admin"] },
  {
    kind: "parent",
    label: "Configurações",
    icon: Settings,
    roles: ["admin"],
    children: [
      {
        kind: "leaf",
        path: "/admin/configuracoes",
        label: "Gerais",
        icon: SlidersHorizontal,
        roles: ["admin"],
      },
      {
        kind: "leaf",
        path: "/admin/configuracoes/planos-assinatura",
        label: "Planos de Assinatura",
        icon: CreditCard,
        roles: ["admin"],
      },
      {
        kind: "leaf",
        path: "/admin/configuracoes/notificacoes",
        label: "Notificações",
        icon: Bell,
        roles: ["admin"],
      },
      {
        kind: "leaf",
        path: "/admin/configuracoes/buffer-notificacoes",
        label: "Buffer de Notificações",
        icon: Inbox,
        roles: ["admin"],
      },
    ],
  },
];

const SUBMENU_STORAGE_KEY = "latemia.admin.sidebar.openParents";

function findActiveLeafPath(pathname: string, leafPaths: string[]): string | null {
  let best: string | null = null;
  for (const p of leafPaths) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      if (!best || p.length > best.length) best = p;
    }
  }
  return best;
}

export function Sidebar({ collapsed, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredMenu = useMemo<MenuItem[]>(() => {
    return menuItems
      .filter((item) => item.roles.includes(userRole))
      .map((item) =>
        item.kind === "parent"
          ? {
              ...item,
              children: item.children.filter((c) => c.roles.includes(userRole)),
            }
          : item,
      )
      .filter((item) => item.kind === "leaf" || item.children.length > 0);
  }, [userRole]);

  const allLeafPaths = useMemo(() => {
    const paths: string[] = [];
    for (const item of filteredMenu) {
      if (item.kind === "leaf") paths.push(item.path);
      else for (const c of item.children) paths.push(c.path);
    }
    return paths;
  }, [filteredMenu]);

  const activeLeafPath = useMemo(
    () => findActiveLeafPath(pathname, allLeafPaths),
    [pathname, allLeafPaths],
  );

  const [openParents, setOpenParents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SUBMENU_STORAGE_KEY);
      if (raw) setOpenParents(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Auto-open the parent that contains the active route, so the user always
  // sees where they are. Persisted state still wins for siblings.
  useEffect(() => {
    if (!activeLeafPath) return;
    const parent = filteredMenu.find(
      (i) => i.kind === "parent" && i.children.some((c) => c.path === activeLeafPath),
    );
    if (parent && parent.kind === "parent" && !openParents[parent.label]) {
      setOpenParents((prev) => ({ ...prev, [parent.label]: true }));
    }
  }, [activeLeafPath, filteredMenu, openParents]);

  function toggleParent(label: string) {
    setOpenParents((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        window.localStorage.setItem(SUBMENU_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota/serialization errors
      }
      return next;
    });
  }

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
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4E8C75]">
                <span className="text-sm font-bold text-white">DC</span>
              </div>
              <span className="font-semibold text-[#2C2C2E]">Dr. Cleitinho</span>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#4E8C75]">
              <span className="text-sm font-bold text-white">DC</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {filteredMenu.map((item) => {
              if (item.kind === "leaf") {
                return (
                  <li key={item.path}>
                    <SidebarLeafLink
                      item={item}
                      isActive={item.path === activeLeafPath}
                      collapsed={collapsed}
                    />
                  </li>
                );
              }

              const hasActiveChild = item.children.some((c) => c.path === activeLeafPath);
              const isOpen = !!openParents[item.label] || hasActiveChild;

              return (
                <li key={item.label}>
                  <SidebarParentItem
                    item={item}
                    collapsed={collapsed}
                    isOpen={isOpen}
                    hasActiveChild={hasActiveChild}
                    activeLeafPath={activeLeafPath}
                    onToggle={() => toggleParent(item.label)}
                    onNavigateToFirstChild={() => router.push(item.children[0].path)}
                  />
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

function SidebarLeafLink({
  item,
  isActive,
  collapsed,
}: {
  item: LeafItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const link = (
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

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarParentItem({
  item,
  collapsed,
  isOpen,
  hasActiveChild,
  activeLeafPath,
  onToggle,
  onNavigateToFirstChild,
}: {
  item: ParentItem;
  collapsed: boolean;
  isOpen: boolean;
  hasActiveChild: boolean;
  activeLeafPath: string | null;
  onToggle: () => void;
  onNavigateToFirstChild: () => void;
}) {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={item.label}
                className={cn(
                  "relative flex w-full items-center justify-center rounded-lg px-3 py-2.5 transition-colors",
                  hasActiveChild
                    ? "bg-[#EAF4F0] text-[#4E8C75]"
                    : "text-[#6B6B6E] hover:bg-[#EAF4F0]/50 hover:text-[#4E8C75]",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="min-w-56">
          <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const isActive = child.path === activeLeafPath;
            return (
              <DropdownMenuItem key={child.path} asChild>
                <Link
                  href={child.path}
                  className={cn(
                    "flex w-full items-center gap-2",
                    isActive && "bg-[#EAF4F0] text-[#4E8C75]",
                  )}
                >
                  <ChildIcon className="h-4 w-4" />
                  <span>{child.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        onDoubleClick={onNavigateToFirstChild}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
          hasActiveChild
            ? "text-[#4E8C75]"
            : "text-[#6B6B6E] hover:bg-[#EAF4F0]/50 hover:text-[#4E8C75]",
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform",
            isOpen ? "rotate-0" : "-rotate-90",
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1 pl-4">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const isActive = child.path === activeLeafPath;
            return (
              <li key={child.path}>
                <Link
                  href={child.path}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-[#EAF4F0] text-[#4E8C75]"
                      : "text-[#6B6B6E] hover:bg-[#EAF4F0]/50 hover:text-[#4E8C75]",
                  )}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-[#4E8C75]" />
                  )}
                  <ChildIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
