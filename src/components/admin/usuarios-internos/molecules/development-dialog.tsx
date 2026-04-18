'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DevelopmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevelopmentDialog({ open, onOpenChange }: DevelopmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Em desenvolvimento</DialogTitle>
          <DialogDescription>
            Esta funcionalidade ainda está em desenvolvimento e estará disponível em breve.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
