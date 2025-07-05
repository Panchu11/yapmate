import React from 'react'
import { motion } from 'framer-motion'
import type { View } from '../SidebarApp'

interface HeaderProps {
  currentView: View
  onViewChange: (view: View) => void
  settings: any
  onRefresh: () => void
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  settings,
  onRefresh
}) => {
  const views = [
    { id: 'tweets' as View, label: 'Tweets', icon: '🐦' },
    { id: 'settings' as View, label: 'Settings', icon: '⚙️' },
    { id: 'analytics' as View, label: 'Analytics', icon: '📊' },
  ]

  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 p-4">
      {/* Logo and Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-yapmate-primary to-yapmate-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">YapMate 2.0</h1>
            <p className="text-xs text-gray-600">AI Social Engagement</p>
          </div>
        </div>
        
        {currentView === 'tweets' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-2 bg-white/50 hover:bg-white/70 rounded-lg border border-white/20 transition-all duration-200"
            title="Refresh tweets"
          >
            🔄
          </motion.button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/30 rounded-lg p-1">
        {views.map((view) => (
          <motion.button
            key={view.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange(view.id)}
            className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === view.id
                ? 'bg-white text-yapmate-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <span>{view.icon}</span>
            <span className="hidden sm:inline">{view.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Mode Toggle */}
      {currentView === 'tweets' && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode:</span>
            <div className="flex bg-white/30 rounded-lg p-1">
              <button
                onClick={() => {/* Toggle crypto mode */}}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  settings?.cryptoMode
                    ? 'bg-white text-yapmate-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ₿ Crypto
              </button>
              <button
                onClick={() => {/* Toggle general mode */}}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  !settings?.cryptoMode
                    ? 'bg-white text-yapmate-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                💬 General
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active</span>
          </div>
        </div>
      )}
    </div>
  )
}
