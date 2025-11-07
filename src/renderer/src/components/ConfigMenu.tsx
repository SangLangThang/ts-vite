interface ConfigMenuProps {
  onSave: () => void;
  onLoad: () => void;
}

export function ConfigMenu({ onSave, onLoad }: ConfigMenuProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-300">
      <span className="text-sm font-semibold text-gray-700 mr-2">TS TOOL</span>
      <button
        onClick={onSave}
        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
      >
        Save
      </button>
      <button
        onClick={onLoad}
        className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
      >
        Load
      </button>
    </div>
  );
}
