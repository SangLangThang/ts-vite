import { useState } from 'react';

export function DebugComponent(): React.JSX.Element {
  const [inputString, setInputString] = useState('');
  const [xorResult, setXorResult] = useState('');

  // Decimal to Hex conversion states
  const [decimalInput, setDecimalInput] = useState('');
  const [hexResult, setHexResult] = useState('');
  const [rearrangedResult, setRearrangedResult] = useState('');

  const handleConvert = async () => {
    if (!inputString.trim()) {
      return;
    }

    try {
      const result = await window.api.debugXorWithAD(inputString);
      setXorResult(result);
    } catch (error) {
      setXorResult('Error: ' + error);
    }
  };

  const handleDecimalToHex = async () => {
    if (!decimalInput.trim()) {
      return;
    }

    try {
      const decimal = parseInt(decimalInput);
      if (isNaN(decimal)) {
        setHexResult('Invalid decimal number');
        setRearrangedResult('');
        return;
      }

      const result = await window.api.debugDecimalToHex(decimal);
      setHexResult(result.hex);
      setRearrangedResult(result.rearranged);
    } catch (error) {
      setHexResult('Error: ' + error);
      setRearrangedResult('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Debug Tools</h2>

          {/* XOR with AD Converter */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input String (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConvert();
                    }
                  }}
                  placeholder="Enter hex string (e.g., F4440A00320103...)"
                  className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <button
                  onClick={handleConvert}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  Convert
                </button>
              </div>
            </div>

            {/* XOR Result */}
            {xorResult && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  XOR with AD Result
                </label>
                <div className="relative">
                  <div className="px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-md font-mono text-sm break-all">
                    {xorResult}
                  </div>
                  <button
                    onClick={() => handleCopy(xorResult)}
                    className="absolute top-2 text-black right-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decimal to Hex Converter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Decimal to Hex Converter (Skill ID)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Number (Skill ID)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={decimalInput}
                  onChange={(e) => setDecimalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDecimalToHex();
                    }
                  }}
                  placeholder="Enter decimal number (e.g., 12034)"
                  className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <button
                  onClick={handleDecimalToHex}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                >
                  Convert
                </button>
              </div>
            </div>

            {/* Conversion Results */}
            {hexResult && (
              <div className="grid grid-cols-2 gap-4">
                {/* Hex Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hex (Normal)
                  </label>
                  <div className="relative">
                    <div className="px-4 py-3 text-black bg-gray-50 border border-gray-300 rounded-md font-mono text-sm break-all">
                      {hexResult}
                    </div>
                    <button
                      onClick={() => handleCopy(hexResult)}
                      className="absolute top-2 text-black right-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Rearranged Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hex (Rearranged - Skill Format)
                  </label>
                  <div className="relative">
                    <div className="px-4 py-3 text-black bg-green-50 border border-green-300 rounded-md font-mono text-sm break-all">
                      {rearrangedResult}
                    </div>
                    <button
                      onClick={() => handleCopy(rearrangedResult)}
                      className="absolute top-2 text-black right-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Usage</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>XOR with AD:</strong> Enter a hexadecimal string and click Convert to apply
              XOR encryption
            </li>
            <li>
              <strong>Decimal to Hex:</strong> Enter a decimal number (e.g., 12034) to convert to
              hex (2f02) and rearranged format (022f)
            </li>
            <li>• Example: 12034 → 2f02 (normal) → 022f (rearranged for skill packets)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
