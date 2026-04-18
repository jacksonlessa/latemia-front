'use client';

import { MoreHorizontal, Pencil, UserX, UserCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { InternalUserRow } from '@/lib/types/internal-users';

interface UserRowActionsProps {
  user: InternalUserRow;
  isSelf?: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onResetPassword: () => void;
}

export function UserRowActions({
  user,
  isSelf = false,
  onEdit,
  onDeactivate,
  onReactivate,
  onResetPassword,
}: UserRowActionsProps) {
  const isActive = !user.deletedAt;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Ações para ${user.name}`}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu de ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isActive && (
          <DropdownMenuItem
            onClick={onEdit}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onResetPassword}
          className="cursor-pointer"
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Resetar senha
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isActive && !isSelf ? (
          <DropdownMenuItem
            onClick={onDeactivate}
            variant="destructive"
            className="cursor-pointer"
          >
            <UserX className="mr-2 h-4 w-4" />
            Desativar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={onReactivate}
            className="cursor-pointer"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Reativar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
