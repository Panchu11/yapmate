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
  platform?: string
  isThread?: boolean
  media?: any[]
}

interface TweetCardProps {
  tweet: Tweet
  settings: any
  isSelected?: boolean
  onSelect?: () => void
}

export const TweetCard: React.FC<TweetCardProps> = ({ 
  tweet, 
  settings, 
  isSelected = false, 
  onSelect 
}) => {
  const [showReplyGenerator, setShowReplyGenerator] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  const truncateText = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const detectCryptoMentions = (text: string) => {
    const cryptoRegex = /(\$[A-Z]{1,10}|@\w+|#\w+)/g
    return text.match(cryptoRegex) || []
  }

  const cryptoMentions = detectCryptoMentions(tweet.text)
  const shouldTruncate = tweet.text.length > 200

  const handleCardClick = () => {
    if (onSelect) {
      onSelect()
    }
  }

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowReplyGenerator(!showReplyGenerator)
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`tweet-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {tweet.author.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {tweet.author}
            </h3>
            <span className="text-gray-500 text-sm">@{tweet.username}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 text-sm">
              {formatTimestamp(tweet.timestamp)}
            </span>
          </div>
        </div>

        {/* Platform Badge */}
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs">🐦</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">
          {isExpanded || !shouldTruncate ? tweet.text : truncateText(tweet.text)}
        </p>
        
        {shouldTruncate && (
          <button
            onClick={handleExpandClick}
            className="text-blue-600 text-sm mt-1 hover:underline font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Crypto Mentions */}
        {cryptoMentions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {cryptoMentions.slice(0, 5).map((mention, index) => (
              <span
                key={index}
                className="badge badge-secondary text-xs"
              >
                {mention}
              </span>
            ))}
            {cryptoMentions.length > 5 && (
              <span className="text-xs text-gray-500">
                +{cryptoMentions.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      <div className="flex items-center gap-6 mb-4 text-gray-500 text-sm">
        <div className="flex items-center gap-1">
          <span>💬</span>
          <span>{formatNumber(tweet.replyCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔄</span>
          <span>{formatNumber(tweet.retweetCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❤️</span>
          <span>{formatNumber(tweet.likeCount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleReplyClick}
          className={`btn flex-1 ${
            showReplyGenerator ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          <span>✨</span>
          {showReplyGenerator ? 'Close Generator' : 'Generate Reply'}
        </button>
        
        {tweet.url && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(tweet.url, '_blank')
            }}
            className="btn-icon"
            title="Open original tweet"
          >
            🔗
          </button>
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
            className="mt-4 pt-4 border-t border-gray-200"
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
