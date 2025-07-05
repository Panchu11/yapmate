import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TabInfo {
  id?: number
  url?: string
  title?: string
  isTwitter: boolean
}

const PopupApp: React.FC = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      if (currentTab) {
        const isTwitter = currentTab.url?.includes('x.com') || currentTab.url?.includes('twitter.com') || false
        setTabInfo({
          id: currentTab.id,
          url: currentTab.url,
          title: currentTab.title,
          isTwitter
        })
      }
      setIsLoading(false)
    })
  }, [])

  const handleOpenSidebar = async () => {
    if (tabInfo?.id) {
      try {
        await chrome.sidePanel.open({ tabId: tabInfo.id })
        window.close() // Close popup after opening sidebar
      } catch (error) {
        console.error('Error opening sidebar:', error)
      }
    }
  }

  const handleOpenSettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') })
    window.close()
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yapmate-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yapmate-primary to-yapmate-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">YapMate 2.0</h1>
          </div>
          <p className="text-sm text-gray-600">AI-Powered Social Engagement</p>
        </div>

        {/* Status */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${tabInfo?.isTwitter ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {tabInfo?.isTwitter ? 'Twitter/X Detected' : 'Navigate to Twitter/X'}
            </span>
          </div>
          {tabInfo?.title && (
            <p className="text-xs text-gray-500 mt-1 truncate">{tabInfo.title}</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {tabInfo?.isTwitter ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenSidebar}
              className="w-full bg-gradient-to-r from-yapmate-primary to-yapmate-secondary text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🚀 Open YapMate Sidebar
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => chrome.tabs.create({ url: 'https://x.com' })}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🐦 Go to Twitter/X
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenSettings}
            className="w-full bg-white/70 backdrop-blur-sm text-gray-700 py-2 px-4 rounded-lg font-medium border border-white/20 hover:bg-white/80 transition-all duration-200"
          >
            ⚙️ Settings
          </motion.button>
        </div>

        {/* Features */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">✨ Features</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• AI-powered reply generation</li>
            <li>• Crypto-native intelligence</li>
            <li>• Multiple tone options</li>
            <li>• Real-time tweet analysis</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Made with ❤️ for the crypto community
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default PopupApp
