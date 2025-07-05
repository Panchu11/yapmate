import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface SettingsPanelProps {
  settings: any
  onUpdateSettings: (settings: any) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings }) => {
  const [apiKey, setApiKey] = useState(settings?.apiKeys?.fireworks || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const newSettings = {
        ...settings,
        apiKeys: {
          ...settings?.apiKeys,
          fireworks: apiKey
        }
      }

      await onUpdateSettings(newSettings)
      setSaveMessage('Settings saved successfully!')
      
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Failed to save settings')
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const validateApiKey = (key: string): boolean => {
    return key.startsWith('fw_') && key.length > 10
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Settings</h2>

        {/* API Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🔑 API Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fireworks AI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="fw_xxxxxxxxxxxxxxxx"
                  className="input-field w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a 
                    href="https://fireworks.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yapmate-primary hover:underline"
                  >
                    fireworks.ai
                  </a>
                </p>
                {apiKey && !validateApiKey(apiKey) && (
                  <p className="text-xs text-red-500 mt-1">
                    Invalid API key format. Should start with 'fw_'
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🎛️ General Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Theme</label>
                  <p className="text-xs text-gray-500">Choose your preferred theme</p>
                </div>
                <select 
                  value={settings?.theme || 'light'}
                  onChange={(e) => onUpdateSettings({ ...settings, theme: e.target.value })}
                  className="input-field"
                >
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                  <option value="auto">🔄 Auto</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Default Tone</label>
                  <p className="text-xs text-gray-500">Default tone for replies</p>
                </div>
                <select 
                  value={settings?.defaultTone || 'smart'}
                  onChange={(e) => onUpdateSettings({ ...settings, defaultTone: e.target.value })}
                  className="input-field"
                >
                  <option value="smart">🧠 Smart</option>
                  <option value="funny">😂 Funny</option>
                  <option value="serious">💼 Serious</option>
                  <option value="degen">🚀 Degen</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Crypto Mode</label>
                  <p className="text-xs text-gray-500">Enable crypto-focused replies</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.cryptoMode || false}
                    onChange={(e) => onUpdateSettings({ ...settings, cryptoMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yapmate-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yapmate-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Generate</label>
                  <p className="text-xs text-gray-500">Automatically generate replies</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.autoGenerate || false}
                    onChange={(e) => onUpdateSettings({ ...settings, autoGenerate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yapmate-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yapmate-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notifications</label>
                  <p className="text-xs text-gray-500">Enable browser notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.notifications || false}
                    onChange={(e) => onUpdateSettings({ ...settings, notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yapmate-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yapmate-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings}
            disabled={isSaving || !validateApiKey(apiKey)}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span>Saving...</span>
              </div>
            ) : (
              '💾 Save Settings'
            )}
          </motion.button>

          {/* Save Message */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center text-sm p-2 rounded-lg ${
                saveMessage.includes('success') 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-3">ℹ️ About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 2.0.0</p>
          <p><strong>Build:</strong> Revolutionary AI Social Engagement Platform</p>
          <p><strong>Support:</strong> support@yapmate.com</p>
        </div>
        
        <div className="mt-4 space-y-2">
          <a 
            href="https://github.com/Panchu11/yapmate" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-yapmate-primary hover:underline text-sm"
          >
            📚 Documentation
          </a>
          <a 
            href="https://github.com/Panchu11/yapmate/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-yapmate-primary hover:underline text-sm"
          >
            🐛 Report Issues
          </a>
        </div>
      </motion.div>
    </div>
  )
}
