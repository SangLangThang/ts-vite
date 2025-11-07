import { useEffect, useState } from 'react';
import { Luulang, Tuideo, Tuido } from 'src/types';

interface BagComponentProps {
  selectedPlayerId: number | null;
}

// Helper to get item image path
const getItemImagePath = (itemId: number): string => {
  // Use public directory path - electron-vite copies these to output
  return `/items/item_${itemId}.png`;
};

export function BagComponent({ selectedPlayerId }: BagComponentProps): React.JSX.Element {
  const [tuido, setTuido] = useState<Tuido[]>([]);
  const [tuideo, setTuideo] = useState<Tuideo[]>([]);
  const [luulang, setLuulang] = useState<Luulang[]>([]);

  useEffect(() => {
    // Reset bag items when player changes
    setTuido([]);
    setTuideo([]);
    setLuulang([]);

    if (!selectedPlayerId) return;

    // Listen for bag updates
    const handleBagUpdate = (data: {
      id: number;
      tuido?: Tuido[];
      tuideo?: Tuideo[];
      luulang?: Luulang[];
    }) => {
      if (selectedPlayerId && data.id === selectedPlayerId) {
        if (data.tuido) {
          setTuido(data.tuido);
        }
        if (data.tuideo) {
          setTuideo(data.tuideo);
        }
        if (data.luulang) {
          setLuulang(data.luulang);
        }
      }
    };

    const handler = window.api.onPlayerBagUpdate(handleBagUpdate);

    // Request current bag data for the selected player
    window.api.requestPlayerBag(selectedPlayerId);

    return () => {
      window.api.removePlayerBagUpdateListener(handler);
    };
  }, [selectedPlayerId]);

  if (!selectedPlayerId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No player selected</p>
      </div>
    );
  }

  const renderItemGrid = (items: (Tuido | Tuideo | Luulang)[], title: string) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-5 gap-1">
            {items.map((item, index) => (
              <div
                key={index}
                className={`relative border-2 rounded-md aspect-square flex items-center justify-center ${
                  item._Id > 0
                    ? 'border-gray-400 from-gray-100 to-gray-200 hover:border-blue-500 cursor-pointer'
                    : 'border-gray-300 bg-gray-100'
                }`}
                title={item._Id > 0 ? `ID: ${item._Id}${item._Name ? `\n${item._Name}` : ''}` : ''}
              >
                {item._Id > 0 ? (
                  <>
                    <img
                      src={getItemImagePath(item._Id)}
                      alt={`Item ${item._Id}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'block';
                        }
                      }}
                    />
                    <div className="hidden text-xs text-gray-500 font-semibold">{item._Id}</div>
                    {item._Sl > 1 && (
                      <div className="absolute bottom-0.5 right-0.5 bg-black bg-opacity-70 text-white text-xs font-bold px-1 py-0.5 rounded">
                        {item._Sl}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex gap-4 p-1 overflow-auto">
      {/* Left side: Luulang and Tuideo */}
      <div className="flex flex-col gap-4" style={{ width: '300px', minWidth: '300px' }}>
        {/* Luulang (Wanderer) - 2x5 grid */}
        {renderItemGrid(luulang, 'Lưu lang')}

        {/* Tuideo (Wardrobe) - 5x5 grid */}
        {renderItemGrid(tuideo, 'Túi đeo')}
      </div>

      {/* Right side: Tuido (Bag) */}
      <div style={{ width: '300px', minWidth: '300px' }}>{renderItemGrid(tuido, 'Túi đồ')}</div>
    </div>
  );
}
