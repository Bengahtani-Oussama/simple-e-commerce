// admin-panel/src/components/sections/BulkActionsDialog.tsx
// Optional: For future bulk operations enhancement

import { useState } from 'react';
import { Pin, Star, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BulkActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: string[];
  onBulkUpdate: (updates: any[]) => Promise<void>;
}

export const BulkActionsDialog = ({
  open,
  onOpenChange,
  selectedProducts,
  onBulkUpdate,
}: BulkActionsDialogProps) => {
  const [action, setAction] = useState<'pin' | 'feature' | 'remove'>('pin');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const updates = selectedProducts.map((productId) => ({
        productId,
        ...(action === 'pin' && { isPinned: true }),
        ...(action === 'feature' && { isFeatured: true }),
      }));

      await onBulkUpdate(updates);
      onOpenChange(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to apply bulk action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Apply action to {selectedProducts.length} selected products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="pin"
              checked={action === 'pin'}
              onCheckedChange={() => setAction('pin')}
            />
            <Label htmlFor="pin" className="flex items-center gap-2 cursor-pointer">
              <Pin className="h-4 w-4" />
              Pin to top
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="feature"
              checked={action === 'feature'}
              onCheckedChange={() => setAction('feature')}
            />
            <Label htmlFor="feature" className="flex items-center gap-2 cursor-pointer">
              <Star className="h-4 w-4" />
              Mark as featured
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="remove"
              checked={action === 'remove'}
              onCheckedChange={() => setAction('remove')}
            />
            <Label htmlFor="remove" className="flex items-center gap-2 cursor-pointer text-red-600">
              <Trash2 className="h-4 w-4" />
              Remove from section
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={loading}>
            {loading ? 'Applying...' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};