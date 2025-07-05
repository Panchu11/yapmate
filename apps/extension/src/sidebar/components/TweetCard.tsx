import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ReplyGenerator } from './ReplyGenerator'

interface Tweet {
  id: string
  text: string
  author: string
  username: string
  timestamp: string
  replyCount: number
  retweetCount: number
  likeCount: number
  hasReplyBox: boolean
  url?: string
}

interface TweetCardProps {
  tweet: Tweet
  settings: any
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet, settings }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showReplyGenerator, setShowReplyGenerator] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'now'
      if (diffMins < 60) return `${diffMins}m`
      if (diffHours < 24) return `${diffHours}h`
      if (diffDays < 7) return `${diffDays}d`
      return date.toLocaleDateString()
    } catch {
      return 'unknown'
    }
  }

  const getPlatformIcon = () => {
    const url = window.location.hostname
    if (url.includes('x.com') || url.includes('twitter.com')) return '🐦'
    if (url.includes('linkedin.com')) return '💼'
    if (url.includes('discord.com')) return '🎮'
    if (url.includes('telegram.org')) return '✈️'
    return '🐦'
  }

  const getPlatformColor = () => {
    const url = window.location.hostname
    if (url.includes('x.com') || url.includes('twitter.com')) return 'from-blue-400 to-blue-600'
    if (url.includes('linkedin.com')) return 'from-blue-600 to-blue-800'
    if (url.includes('discord.com')) return 'from-indigo-500 to-purple-600'
    if (url.includes('telegram.org')) return 'from-cyan-400 to-blue-500'
    return 'from-blue-400 to-blue-600'
  }

  const detectCryptoMentions = (text: string) => {
    const cryptoRegex = /(\$[A-Z]{1,10}|@\w+|#\w+)/g
    return text.match(cryptoRegex) || []
  }

  const cryptoMentions = detectCryptoMentions(tweet.text)

  const truncateText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`tweet-card cursor-pointer relative ${showReplyGenerator ? 'selected' : ''}`}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      {/* Platform Badge */}
      <div className="absolute top-4 right-4 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-8 h-8 bg-gradient-to-r ${getPlatformColor()} rounded-full flex items-center justify-center text-white text-sm shadow-lg`}
        >
          {getPlatformIcon()}
        </motion.div>
      </div>

      {/* Crypto Indicators */}
      {cryptoMentions.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center space-x-1"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              ₿
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {cryptoMentions.length}
            </span>
          </motion.div>
        </div>
      )}

      {/* Tweet Header */}
      <div className="flex items-start space-x-4 mb-4 pt-2">
        <motion.div
          className="avatar w-12 h-12 text-sm"
          whileHover={{ scale: 1.1 }}
        >
          {tweet.author.charAt(0).toUpperCase()}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-gray-800 truncate text-base">{tweet.author}</h3>
            <span className="text-gray-500 text-sm font-medium">@{tweet.username}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{formatTimestamp(tweet.timestamp)}</span>
            <span>·</span>
            <motion.span
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
            >
              <div className="status-online"></div>
              <span>Active</span>
            </motion.span>
          </div>
        </div>
      </div>

      {/* Tweet Content */}
      <motion.div
        className="mb-4"
        layout
      >
        <p className="text-gray-800 leading-relaxed text-sm font-medium">
          {isExpanded ? tweet.text : truncateText(tweet.text)}
        </p>

        {tweet.text.length > 150 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-yapmate-primary text-sm mt-2 hover:underline font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </motion.button>
        )}

        {/* Crypto Mentions Display */}
        {cryptoMentions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-1 mt-3"
          >
            {cryptoMentions.slice(0, 5).map((mention, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200"
              >
                {mention}
              </motion.span>
            ))}
            {cryptoMentions.length > 5 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{cryptoMentions.length - 5} more
              </span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Tweet Stats */}
      <motion.div
        className="flex items-center justify-between mb-4 p-3 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center space-x-6">
          <motion.div
            className="flex items-center space-x-2 text-gray-600"
            whileHover={{ scale: 1.05, color: "#3b82f6" }}
          >
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs">💬</span>
            </div>
            <span className="text-sm font-medium">{formatNumber(tweet.replyCount)}</span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-2 text-gray-600"
            whileHover={{ scale: 1.05, color: "#10b981" }}
          >
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xs">🔄</span>
            </div>
            <span className="text-sm font-medium">{formatNumber(tweet.retweetCount)}</span>
          </motion.div>

          <motion.div
            className="flex items-center space-x-2 text-gray-600"
            whileHover={{ scale: 1.05, color: "#ef4444" }}
          >
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xs">❤️</span>
            </div>
            <span className="text-sm font-medium">{formatNumber(tweet.likeCount)}</span>
          </motion.div>
        </div>

        {/* Engagement Score */}
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xs text-gray-500">Engagement</div>
          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yapmate-primary to-yapmate-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((tweet.likeCount + tweet.retweetCount + tweet.replyCount) / 100 * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Actions */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            setShowReplyGenerator(!showReplyGenerator)
          }}
          className={`flex-1 relative overflow-hidden ${
            showReplyGenerator
              ? 'bg-gradient-to-r from-yapmate-primary to-yapmate-secondary text-white'
              : 'btn-primary'
          } text-sm py-3 px-4 font-medium`}
        >
          <motion.span
            animate={{ rotate: showReplyGenerator ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block mr-2"
          >
            ✨
          </motion.span>
          {showReplyGenerator ? 'Close Generator' : 'Generate Reply'}
        </motion.button>

        {tweet.url && (
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              window.open(tweet.url, '_blank')
            }}
            className="btn-icon w-12 h-12"
            title="Open original post"
          >
            🔗
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            // Add to favorites functionality
          }}
          className="btn-icon w-12 h-12"
          title="Add to favorites"
        >
          ⭐
        </motion.button>
      </div>

      {/* Reply Generator */}
      <AnimatePresence>
        {showReplyGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border-t border-white/20 pt-4"
          >
            <ReplyGenerator 
              tweet={tweet}
              settings={settings}
              onClose={() => setShowReplyGenerator(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
