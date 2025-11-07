import React from 'react';
import { DATA_BATTLE_SKILL } from '../../../helpers/constant2';

interface SkillDropdownProps {
  value: number;
  label: string;
  onChange: (value: number) => void;
}

export function SkillDropdown({ value, label, onChange }: SkillDropdownProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const currentSkill = DATA_BATTLE_SKILL.find(([id]) => id === value);

  const filteredSkills = DATA_BATTLE_SKILL.filter(
    ([id, name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) || String(id).includes(searchTerm)
  );

  return (
    <div className="relative flex items-center gap-2">
      <label className="text-xs text-gray-600 w-20 shrink-0">{label}:</label>
      <div className="flex-1 relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-left bg-white"
        >
          {currentSkill ? currentSkill[1] : 'Select skill...'}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 text-xs border-b border-gray-300 focus:outline-none text-black"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="overflow-y-auto max-h-48">
                {filteredSkills.map(([id, name]) => (
                  <div
                    key={id}
                    onClick={() => {
                      onChange(id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-2 py-1 text-xs cursor-pointer hover:bg-blue-50 text-black ${
                      id === value ? 'bg-blue-100' : ''
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
