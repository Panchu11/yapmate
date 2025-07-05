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
}

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'casual', label: 'Casual', icon: '😊' },
  { id: 'witty', label: 'Witty', icon: '😄' },
  { id: 'supportive', label: 'Supportive', icon: '🤝' },
  { id: 'analytical', label: 'Analytical', icon: '📊' }
]

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  settings,
  isSelected = false,
  onSelect
}) => {
  const [showReplyGenerator, setShowReplyGenerator] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTone, setSelectedTone] = useState('professional')
  const [generatedReply, setGeneratedReply] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Utility functions
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

  const detectCryptoMentions = (text: string) => {
    const cryptoRegex = /(\$[A-Z]{1,10})/g
    return text.match(cryptoRegex) || []
  }

  // Event handlers
  const handleGenerateReply = async () => {
    setIsGenerating(true)
    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGeneratedReply(`Great insights on ${tweet.text.slice(0, 30)}... I completely agree with your perspective on this topic!`)
    } catch (error) {
      console.error('Error generating reply:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyReply = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply)
    }
  }

  const handleAutoFill = () => {
    if (generatedReply && tweet.url) {
      // Auto-fill the reply box on Twitter
      window.open(tweet.url, '_blank')
    }
  }

  const handleRegenerate = () => {
    if (generatedReply) {
      handleGenerateReply()
    }
  }

  const cryptoMentions = detectCryptoMentions(tweet.text)
  const shouldTruncate = tweet.text.length > 150

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200"
      onClick={() => onSelect?.()}
    >
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          {tweet.author.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {tweet.author}
            </span>
            <span className="text-gray-500 text-xs">@{tweet.username}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-500 text-xs">{formatTimestamp(tweet.timestamp)}</span>
          </div>
        </div>
        <div className="text-blue-500 text-sm">🐦</div>
      </div>

      {/* Compact Content */}
      <div className="mb-3">
        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
          {isExpanded || !shouldTruncate ? tweet.text : truncateText(tweet.text)}
        </p>

        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-blue-600 text-xs mt-1 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {/* Crypto Mentions */}
        {cryptoMentions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {cryptoMentions.slice(0, 3).map((mention, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full"
              >
                {mention}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Compact Metrics */}
      <div className="flex items-center gap-4 mb-3 text-gray-500 text-xs">
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

      {/* Tone Selection */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone.id}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedTone(tone.id)
              }}
              className={`px-2 py-1 text-xs rounded-full transition-all ${
                selectedTone === tone.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tone.icon} {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleGenerateReply()
          }}
          disabled={isGenerating}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isGenerating ? '⏳ Generating...' : '✨ Generate'}
        </button>

        {generatedReply && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCopyReply()
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
              title="Copy Reply"
            >
              📋
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRegenerate()
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
              title="Regenerate"
            >
              🔄
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAutoFill()
              }}
              className="bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
              title="Auto Fill"
            >
              🚀
            </button>
          </>
        )}
      </div>

      {/* Generated Reply Display */}
      {generatedReply && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
            Generated Reply ({selectedTone}):
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200">{generatedReply}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
