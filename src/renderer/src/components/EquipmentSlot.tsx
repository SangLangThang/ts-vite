// Helper to get item image path
const getItemImagePath = (itemId: number): string => {
  // Use public directory path - electron-vite copies these to output
  return `/items/item_${itemId}.png`;
};

interface EquipmentSlotProps {
  itemId: number;
  slotName: string;
  doben?: number;
}

export function EquipmentSlot({ itemId, slotName, doben }: EquipmentSlotProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative border-2 rounded-md w-10 h-10 flex items-center justify-center ${
          itemId > 0 ? 'border-blue-400  from-blue-50 to-blue-100' : 'border-gray-300 bg-gray-100'
        }`}
        title={itemId > 0 ? `ID: ${itemId}${doben ? `\nĐộ bền: ${doben}` : ''}` : ''}
      >
        {itemId > 0 ? (
          <>
            <img
              src={getItemImagePath(itemId)}
              alt={`Item ${itemId}`}
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'block';
                }
              }}
            />
            <div className="hidden text-xs text-gray-500 font-semibold">{itemId}</div>
          </>
        ) : null}
      </div>
      <span className="text-xs text-gray-600 font-medium">{slotName}</span>
    </div>
  );
}
