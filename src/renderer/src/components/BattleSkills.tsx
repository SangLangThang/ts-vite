import { useEffect, useState } from 'react';
import { SkillDropdown } from './SkillDropdown';

interface BattleSkillConfig {
  // Char settings
  changeGemChar: boolean;
  hoisinhChar: boolean;
  autoAttack: boolean;
  skillNormalChar: number;
  skillSoloChar: number;
  skillSpecialChar: number;
  skillCCChar: number;
  skillBuffChar: number;
  skillClearChar: number;

  // Pet settings
  changeGemPet: boolean;
  hoisinhPet: boolean;
  skillNormalPet: number;
  skillSoloPet: number;
  skillSpecialPet: number;
  skillCCPet: number;
  skillBuffPet: number;
  skillClearPet: number;
}

interface BattleSkillsProps {
  initialConfig?: BattleSkillConfig;
  onConfigChange: (config: BattleSkillConfig) => void;
}

export function BattleSkills({ initialConfig, onConfigChange }: BattleSkillsProps) {
  const [config, setConfig] = useState<BattleSkillConfig>(
    initialConfig || {
      changeGemChar: false,
      hoisinhChar: false,
      autoAttack: false,
      skillNormalChar: 99999,
      skillSoloChar: 99999,
      skillSpecialChar: 99999,
      skillCCChar: 99999,
      skillBuffChar: 99999,
      skillClearChar: 99999,
      changeGemPet: false,
      hoisinhPet: false,
      skillNormalPet: 99999,
      skillSoloPet: 99999,
      skillSpecialPet: 99999,
      skillCCPet: 99999,
      skillBuffPet: 99999,
      skillClearPet: 99999
    }
  );

  // Sync with initial config when it changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSkillChange = (field: keyof BattleSkillConfig, value: number | boolean) => {
    const newConfig = {
      ...config,
      [field]: value
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="px-1 py-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-2 gap-6">
          {/* Char Column */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b">Character</h4>

            {/* Checkboxes - Row Layout */}
            <div className="flex items-center gap-4 mb-3 pb-2 border-b border-gray-100">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.changeGemChar}
                  onChange={(e) => handleSkillChange('changeGemChar', e.target.checked)}
                  className="w-3 h-3 cursor-pointer"
                />
                <span className="font-medium text-black">Change Gem</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hoisinhChar}
                  onChange={(e) => handleSkillChange('hoisinhChar', e.target.checked)}
                  className="w-3 h-3 cursor-pointer"
                />
                <span className="font-medium text-black">Hồi sinh</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoAttack}
                  onChange={(e) => handleSkillChange('autoAttack', e.target.checked)}
                  className="w-3 h-3 cursor-pointer"
                />
                <span className="font-medium text-black">Auto Attack</span>
              </label>
            </div>

            {/* Skill Dropdowns */}
            <div className="space-y-2">
              <SkillDropdown
                value={config.skillNormalChar}
                label="Normal"
                onChange={(value) => handleSkillChange('skillNormalChar', value)}
              />
              <SkillDropdown
                value={config.skillSoloChar}
                label="Solo"
                onChange={(value) => handleSkillChange('skillSoloChar', value)}
              />
              <SkillDropdown
                value={config.skillSpecialChar}
                label="Special"
                onChange={(value) => handleSkillChange('skillSpecialChar', value)}
              />
              <SkillDropdown
                value={config.skillCCChar}
                label="CC"
                onChange={(value) => handleSkillChange('skillCCChar', value)}
              />
              <SkillDropdown
                value={config.skillBuffChar}
                label="Buff"
                onChange={(value) => handleSkillChange('skillBuffChar', value)}
              />
              <SkillDropdown
                value={config.skillClearChar}
                label="Clear"
                onChange={(value) => handleSkillChange('skillClearChar', value)}
              />
            </div>
          </div>

          {/* Pet Column */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b">Pet</h4>

            {/* Checkboxes - Row Layout */}
            <div className="flex items-center gap-4 mb-3 pb-2 border-b border-gray-100">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.changeGemPet}
                  onChange={(e) => handleSkillChange('changeGemPet', e.target.checked)}
                  className="w-3 h-3 cursor-pointer"
                />
                <span className="font-medium text-black">Change Gem</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.hoisinhPet}
                  onChange={(e) => handleSkillChange('hoisinhPet', e.target.checked)}
                  className="w-3 h-3 cursor-pointer"
                />
                <span className="font-medium text-black">Hồi sinh</span>
              </label>
            </div>

            {/* Skill Dropdowns */}
            <div className="space-y-2">
              <SkillDropdown
                value={config.skillNormalPet}
                label="Normal"
                onChange={(value) => handleSkillChange('skillNormalPet', value)}
              />
              <SkillDropdown
                value={config.skillSoloPet}
                label="Solo"
                onChange={(value) => handleSkillChange('skillSoloPet', value)}
              />
              <SkillDropdown
                value={config.skillSpecialPet}
                label="Special"
                onChange={(value) => handleSkillChange('skillSpecialPet', value)}
              />
              <SkillDropdown
                value={config.skillCCPet}
                label="CC"
                onChange={(value) => handleSkillChange('skillCCPet', value)}
              />
              <SkillDropdown
                value={config.skillBuffPet}
                label="Buff"
                onChange={(value) => handleSkillChange('skillBuffPet', value)}
              />
              <SkillDropdown
                value={config.skillClearPet}
                label="Clear"
                onChange={(value) => handleSkillChange('skillClearPet', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
