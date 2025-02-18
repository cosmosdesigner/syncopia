import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Settings } from 'lucide-react';

interface UserSettingsProps {
  name: string;
  color: string;
  onUpdate: (prefs: { name?: string; color?: string }) => void;
}

export function UserSettings({ name, color, onUpdate }: UserSettingsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Color
              </label>
              <HexColorPicker
                color={color}
                onChange={(color) => onUpdate({ color })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}