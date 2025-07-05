import { useState, useEffect, useCallback } from 'react'

interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  defaultTone: 'smart' | 'funny' | 'serious' | 'degen'
  cryptoMode: boolean
  autoGenerate: boolean
  notifications: boolean
  apiKeys: {
    fireworks?: string
    openai?: string
    anthropic?: string
  }
  onboardingCompleted: boolean
}

const defaultSettings: UserSettings = {
  theme: 'light',
  defaultTone: 'smart',
  cryptoMode: true,
  autoGenerate: false,
  notifications: true,
  apiKeys: {},
  onboardingCompleted: false
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from Chrome storage
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await chrome.storage.sync.get(['yapmate_settings'])
      const savedSettings = result.yapmate_settings

      if (savedSettings) {
        setSettings({ ...defaultSettings, ...savedSettings })
      } else {
        // First time user, save default settings
        await chrome.storage.sync.set({ yapmate_settings: defaultSettings })
        setSettings(defaultSettings)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to Chrome storage
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      setError(null)
      
      const updatedSettings = { ...settings, ...newSettings }
      
      await chrome.storage.sync.set({ yapmate_settings: updatedSettings })
      setSettings(updatedSettings)
      
      // Apply theme changes immediately
      if (newSettings.theme) {
        applyTheme(newSettings.theme)
      }
      
      return updatedSettings
    } catch (err) {
      console.error('Error updating settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      throw err
    }
  }, [settings])

  // Apply theme to document
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [])

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      await chrome.storage.sync.set({ yapmate_settings: defaultSettings })
      setSettings(defaultSettings)
      applyTheme(defaultSettings.theme)
    } catch (err) {
      console.error('Error resetting settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      throw err
    }
  }, [applyTheme])

  // Export settings
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'yapmate-settings.json'
    link.click()
    
    URL.revokeObjectURL(url)
  }, [settings])

  // Import settings
  const importSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      
      // Validate imported settings
      const validatedSettings = { ...defaultSettings, ...importedSettings }
      
      await updateSettings(validatedSettings)
      return validatedSettings
    } catch (err) {
      console.error('Error importing settings:', err)
      setError('Invalid settings file')
      throw err
    }
  }, [updateSettings])

  // Get API key for specific provider
  const getApiKey = useCallback((provider: 'fireworks' | 'openai' | 'anthropic'): string | undefined => {
    return settings.apiKeys[provider]
  }, [settings.apiKeys])

  // Set API key for specific provider
  const setApiKey = useCallback(async (provider: 'fireworks' | 'openai' | 'anthropic', key: string) => {
    const newApiKeys = { ...settings.apiKeys, [provider]: key }
    await updateSettings({ apiKeys: newApiKeys })
  }, [settings.apiKeys, updateSettings])

  // Check if settings are properly configured
  const isConfigured = useCallback((): boolean => {
    return !!(settings.apiKeys.fireworks || settings.apiKeys.openai || settings.apiKeys.anthropic)
  }, [settings.apiKeys])

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('auto')
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme, applyTheme])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Apply theme on settings change
  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme, applyTheme])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    getApiKey,
    setApiKey,
    isConfigured,
    loadSettings
  }
}
