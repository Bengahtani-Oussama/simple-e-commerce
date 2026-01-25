// FILE PATH: admin-panel/src/components/sections/DraggableProduct.tsx
// ACTION: Create this NEW file

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { GripVertical, Pin, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// DnD Item Type
const ITEM_TYPE = 'SECTION_PRODUCT';

interface DraggableProductProps {
  productId: string;
  index: number;
  product: {
    name: { en: string; ar: string; fr: string };
    images: string[];
    basePrice: number;
  };
  isPinned: boolean;
  isFeatured: boolean;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onTogglePin: (productId: string) => void;
  onToggleFeature: (productId: string) => void;
  onRemove: (productId: string) => void;
  disabled?: boolean;
}

interface DragItem {
  type: typeof ITEM_TYPE;
  id: string;
  index: number;
}

export const DraggableProduct = ({
  productId,
  index,
  product,
  isPinned,
  isFeatured,
  onMove,
  onTogglePin,
  onToggleFeature,
  onRemove,
  disabled = false,
}: DraggableProductProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // ===================================
  // DRAG SETUP
  // ===================================
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: (): DragItem => ({ type: ITEM_TYPE, id: productId, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled,
  });

  // ===================================
  // DROP SETUP
  // ===================================
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ITEM_TYPE,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for performance
      item.index = hoverIndex;
    },
  });

  // Connect drag and drop refs
  drag(drop(ref));

  // ===================================
  // RENDER
  // ===================================
  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={cn(
        'group flex items-center gap-4 p-4 bg-white border rounded-lg transition-all',
        isDragging && 'opacity-50 scale-95',
        !isDragging && 'hover:shadow-md hover:border-primary/50',
        isPinned && 'border-blue-500 bg-blue-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Drag Handle */}
      <div
        className={cn(
          'cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors',
          disabled && 'cursor-not-allowed'
        )}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Product Image */}
      <img
        src={product.images[0] || '/placeholder.png'}
        alt={product.name.en}
        className="h-16 w-16 rounded-md object-cover"
      />

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{product.name.en}</h4>
          {isPinned && (
            <Badge variant="default" className="text-xs">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Position: {index + 1} • ${product.basePrice}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTogglePin(productId)}
          disabled={disabled}
          className={cn(isPinned && 'text-blue-600')}
          title={isPinned ? 'Unpin' : 'Pin to top'}
        >
          <Pin className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFeature(productId)}
          disabled={disabled}
          className={cn(isFeatured && 'text-yellow-600')}
          title={isFeatured ? 'Unfeature' : 'Mark as featured'}
        >
          <Star className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(productId)}
          disabled={disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Remove from section"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};