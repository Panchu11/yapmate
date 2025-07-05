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

  const truncateText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <motion.div
      layout
      className="tweet-card"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Tweet Header */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {tweet.author.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-800 truncate">{tweet.author}</h3>
            <span className="text-gray-500 text-sm">@{tweet.username}</span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-500 text-sm">{formatTimestamp(tweet.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Tweet Content */}
      <div className="mb-3">
        <p className="text-gray-800 leading-relaxed">
          {isExpanded ? tweet.text : truncateText(tweet.text)}
        </p>
        
        {tweet.text.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-yapmate-primary text-sm mt-1 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Tweet Stats */}
      <div className="flex items-center space-x-4 text-gray-500 text-sm mb-3">
        <div className="flex items-center space-x-1">
          <span>💬</span>
          <span>{formatNumber(tweet.replyCount)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🔄</span>
          <span>{formatNumber(tweet.retweetCount)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>❤️</span>
          <span>{formatNumber(tweet.likeCount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReplyGenerator(!showReplyGenerator)}
          className="flex-1 btn-primary text-sm py-2"
        >
          ✨ Generate Reply
        </motion.button>
        
        {tweet.url && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(tweet.url, '_blank')}
            className="btn-secondary text-sm py-2 px-3"
          >
            🔗
          </motion.button>
        )}
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
