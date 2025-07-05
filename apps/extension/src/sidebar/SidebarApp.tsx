import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TweetCard } from './components/TweetCard'
import { SettingsPanel } from './components/SettingsPanel'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { Header } from './components/Header'
import { useTweets } from './hooks/useTweets'
import { useSettings } from './hooks/useSettings'

export type View = 'tweets' | 'settings' | 'analytics'

const SidebarApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('tweets')
  const [isLoading, setIsLoading] = useState(true)
  
  const { tweets, isLoadingTweets, refreshTweets } = useTweets()
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    // Initialize the app
    const init = async () => {
      try {
        await refreshTweets()
      } catch (error) {
        console.error('Error initializing sidebar:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [refreshTweets])

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yapmate-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading YapMate...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        settings={settings}
        onRefresh={refreshTweets}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'tweets' && (
            <motion.div
              key="tweets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TweetsView 
                tweets={tweets}
                isLoading={isLoadingTweets}
                settings={settings}
                onRefresh={refreshTweets}
              />
            </motion.div>
          )}

          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SettingsPanel 
                settings={settings}
                onUpdateSettings={updateSettings}
              />
            </motion.div>
          )}

          {currentView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface TweetsViewProps {
  tweets: any[]
  isLoading: boolean
  settings: any
  onRefresh: () => void
}

const TweetsView: React.FC<TweetsViewProps> = ({ tweets, isLoading, settings, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yapmate-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading tweets...</p>
        </div>
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/20"
        >
          <div className="text-4xl mb-4">🐦</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tweets Found</h3>
          <p className="text-gray-600 mb-4">
            Navigate to a Twitter/X page to see tweets and generate AI replies.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="bg-yapmate-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-yapmate-primary/90 transition-colors"
          >
            🔄 Refresh
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {tweets.map((tweet, index) => (
        <motion.div
          key={tweet.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <TweetCard 
            tweet={tweet}
            settings={settings}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default SidebarApp
