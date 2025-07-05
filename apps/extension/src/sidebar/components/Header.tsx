import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const views = [
    { id: 'tweets' as View, label: 'Tweets', icon: '🐦', description: 'Browse and engage with tweets' },
    { id: 'analytics' as View, label: 'Analytics', icon: '📊', description: 'Track your performance' },
    { id: 'settings' as View, label: 'Settings', icon: '⚙️', description: 'Configure preferences' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6 relative overflow-hidden"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yapmate-primary to-yapmate-secondary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-yapmate-secondary to-yapmate-accent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo and Title */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <motion.div
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yapmate-primary via-yapmate-secondary to-yapmate-accent rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">YapMate 2.0</h1>
            <p className="text-sm text-gray-600 font-medium">AI Social Assistant</p>
          </div>
        </motion.div>

        {/* Status and Actions */}
        <div className="flex items-center space-x-3">
          {/* AI Status */}
          <motion.div
            className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <div className="status-online"></div>
            <span className="text-xs font-medium text-green-700">AI Ready</span>
          </motion.div>

          {/* Refresh Button */}
          {currentView === 'tweets' && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="btn-icon"
              title="Refresh tweets"
            >
              🔄
            </motion.button>
          )}

          {/* Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="btn-icon"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ⚡
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="relative z-10">
        <div className="flex space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl p-2 border border-white/30">
          {views.map((view, index) => (
            <motion.button
              key={view.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(view.id)}
              className={`flex-1 relative group ${
                currentView === view.id ? 'tone-button active' : 'tone-button'
              }`}
            >
              {/* Active Indicator */}
              {currentView === view.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-yapmate-primary to-yapmate-secondary rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center space-x-2">
                <motion.span
                  className="text-lg"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {view.icon}
                </motion.span>
                <span className="hidden sm:inline font-medium">{view.label}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                  {view.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 right-4 mt-2 glass-card p-4 z-50"
          >
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
              >
                <span className="text-lg">🚀</span>
                <span className="text-sm font-medium text-gray-700">Quick Reply</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
              >
                <span className="text-lg">🎯</span>
                <span className="text-sm font-medium text-gray-700">Auto Mode</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
              >
                <span className="text-lg">📈</span>
                <span className="text-sm font-medium text-gray-700">Insights</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200"
              >
                <span className="text-lg">⚡</span>
                <span className="text-sm font-medium text-gray-700">Boost</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Toggle */}
      {currentView === 'tweets' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-between relative z-10"
        >
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600">Mode:</span>
            <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/30">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {/* Toggle crypto mode */}}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  settings?.cryptoMode
                    ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
                }`}
              >
                ₿ Crypto
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {/* Toggle general mode */}}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  !settings?.cryptoMode
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
                }`}
              >
                💬 General
              </motion.button>
            </div>
          </div>

          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="status-online"></div>
            <span className="text-xs font-medium text-green-700">Active</span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
