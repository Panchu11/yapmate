import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
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
  viewCount?: number
  hasReplyBox: boolean
  url?: string
  platform?: string
  isThread?: boolean
  isRetweet?: boolean
  media?: any[]
  mentions?: string[]
  hashtags?: string[]
  links?: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  language?: string
  quality?: number
}

interface TweetCardProps {
  tweet: Tweet
  settings: any
  isSelected?: boolean
  onSelect?: () => void
  index?: number
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  settings,
  isSelected = false,
  onSelect,
  index = 0
}) => {
  const [showReplyGenerator, setShowReplyGenerator] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "100px" })

  // Revolutionary formatting functions
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

  const truncateText = (text: string, maxLength: number = 280): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const detectCryptoMentions = (text: string) => {
    const cryptoRegex = /(\$[A-Z]{1,10})/g
    return text.match(cryptoRegex) || []
  }

  const detectMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g
    return text.match(mentionRegex) || []
  }

  const detectHashtags = (text: string) => {
    const hashtagRegex = /#(\w+)/g
    return text.match(hashtagRegex) || []
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '📈'
      case 'negative': return '📉'
      default: return '📊'
    }
  }

  const getQualityBadge = (quality?: number) => {
    if (!quality) return null
    if (quality >= 90) return { text: 'Premium', color: 'bg-purple-500' }
    if (quality >= 70) return { text: 'High', color: 'bg-blue-500' }
    if (quality >= 50) return { text: 'Good', color: 'bg-green-500' }
    return { text: 'Basic', color: 'bg-gray-500' }
  }

  // Extract data for display
  const cryptoMentions = detectCryptoMentions(tweet.text)
  const mentions = detectMentions(tweet.text)
  const hashtags = detectHashtags(tweet.text)
  const shouldTruncate = tweet.text.length > 280
  const qualityBadge = getQualityBadge(tweet.quality)

  // Event handlers
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

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.4
      }
    }
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      className={`tweet-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Revolutionary Header */}
      <motion.div
        variants={contentVariants}
        className="flex items-start gap-4 mb-6"
      >
        {/* Advanced Avatar */}
        <motion.div
          className="flex-shrink-0 relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {tweet.author.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Online Status Indicator */}
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Enhanced Author Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <motion.h3
              className="font-bold text-gray-900 dark:text-white truncate text-lg"
              whileHover={{ scale: 1.02 }}
            >
              {tweet.author}
            </motion.h3>

            {/* Verification Badge */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-blue-500"
            >
              ✓
            </motion.div>

            {/* Quality Badge */}
            {qualityBadge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-1 rounded-full text-xs font-medium text-white ${qualityBadge.color}`}
              >
                {qualityBadge.text}
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">@{tweet.username}</span>
            <span>·</span>
            <span>{formatTimestamp(tweet.timestamp)}</span>

            {/* Sentiment Indicator */}
            {tweet.sentiment && (
              <>
                <span>·</span>
                <span className={`flex items-center gap-1 ${getSentimentColor(tweet.sentiment)}`}>
                  {getSentimentIcon(tweet.sentiment)}
                  <span className="capitalize">{tweet.sentiment}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Advanced Platform & Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Platform Badge */}
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <span className="text-white text-sm">🐦</span>
          </motion.div>

          {/* Thread Indicator */}
          {tweet.isThread && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
            >
              <span className="text-xs">🧵</span>
            </motion.div>
          )}

          {/* Retweet Indicator */}
          {tweet.isRetweet && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
            >
              <span className="text-xs">🔄</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Revolutionary Content */}
      <motion.div
        variants={contentVariants}
        className="mb-6"
      >
        <motion.div
          className="relative"
          layout
        >
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base font-medium">
            {isExpanded || !shouldTruncate ? tweet.text : truncateText(tweet.text)}
          </p>

          {shouldTruncate && (
            <motion.button
              onClick={handleExpandClick}
              className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline font-semibold flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <span className="text-xs">↑</span>
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <span className="text-xs">↓</span>
                </>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Advanced Mentions & Tags */}
        <AnimatePresence>
          {(cryptoMentions.length > 0 || mentions.length > 0 || hashtags.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {/* Crypto Mentions */}
              {cryptoMentions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Crypto:</span>
                  {cryptoMentions.slice(0, 5).map((mention, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
                    >
                      {mention}
                    </motion.span>
                  ))}
                  {cryptoMentions.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      +{cryptoMentions.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* User Mentions */}
              {mentions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Mentions:</span>
                  {mentions.slice(0, 3).map((mention, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-2 py-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs font-medium rounded-full"
                    >
                      {mention}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tags:</span>
                  {hashtags.slice(0, 3).map((hashtag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-2 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-medium rounded-full"
                    >
                      {hashtag}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Preview */}
        {tweet.media && tweet.media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-2 gap-2"
          >
            {tweet.media.slice(0, 4).map((media, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center"
              >
                <span className="text-2xl">
                  {media.type === 'image' ? '🖼️' : '🎥'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Revolutionary Engagement Metrics */}
      <motion.div
        variants={contentVariants}
        className="flex items-center justify-between mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
      >
        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-lg">💬</span>
            <span className="font-semibold">{formatNumber(tweet.replyCount)}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-lg">🔄</span>
            <span className="font-semibold">{formatNumber(tweet.retweetCount)}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-lg">❤️</span>
            <span className="font-semibold">{formatNumber(tweet.likeCount)}</span>
          </motion.div>

          {tweet.viewCount && (
            <motion.div
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-lg">👁️</span>
              <span className="font-semibold">{formatNumber(tweet.viewCount)}</span>
            </motion.div>
          )}
        </div>

        {/* Engagement Score */}
        <motion.div
          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          🔥 {Math.round((tweet.likeCount + tweet.retweetCount + tweet.replyCount) / 10)}
        </motion.div>
      </motion.div>

      {/* Revolutionary Actions */}
      <motion.div
        variants={contentVariants}
        className="flex gap-3"
      >
        <motion.button
          onClick={handleReplyClick}
          className={`btn flex-1 ${
            showReplyGenerator ? 'btn-primary btn-glow' : 'btn-secondary'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            animate={{ rotate: showReplyGenerator ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            ✨
          </motion.span>
          {showReplyGenerator ? 'Close Generator' : 'Generate Reply'}
        </motion.button>

        {tweet.url && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              window.open(tweet.url, '_blank')
            }}
            className="btn-icon"
            title="Open original tweet"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            🔗
          </motion.button>
        )}

        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            // Copy tweet text to clipboard
            navigator.clipboard.writeText(tweet.text)
          }}
          className="btn-icon"
          title="Copy tweet text"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          📋
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            // Bookmark functionality
          }}
          className="btn-icon"
          title="Bookmark tweet"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔖
        </motion.button>
      </motion.div>

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
