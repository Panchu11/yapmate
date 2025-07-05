import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnalyticsData {
  totalReplies: number
  totalCopied: number
  totalFilled: number
  averageLength: number
  topTones: Array<{ tone: string; count: number; percentage: number }>
  dailyUsage: Array<{ date: string; replies: number; engagement: number }>
  cryptoModeUsage: { crypto: number; general: number }
  performanceMetrics: {
    successRate: number
    averageGenerationTime: number
    errorRate: number
  }
  topProjects: Array<{ name: string; mentions: number; symbol: string }>
  sentimentDistribution: { bullish: number; neutral: number; bearish: number }
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // Get analytics events from storage
      const { analyticsEvents = [] } = await chrome.storage.local.get(['analyticsEvents'])
      
      // Filter events by time range
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90))
      
      const filteredEvents = analyticsEvents.filter((event: any) => 
        new Date(event.timestamp) >= cutoffDate
      )

      // Process analytics data
      const processedData = processAnalyticsData(filteredEvents)
      setAnalytics(processedData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processAnalyticsData = (events: any[]): AnalyticsData => {
    const replyEvents = events.filter(e => e.event === 'reply_generated')
    const copyEvents = events.filter(e => e.event === 'reply_copied')
    const fillEvents = events.filter(e => e.event === 'reply_filled')

    // Calculate basic metrics
    const totalReplies = replyEvents.length
    const totalCopied = copyEvents.length
    const totalFilled = fillEvents.length
    const averageLength = replyEvents.reduce((sum, e) => sum + (e.properties?.replyLength || 0), 0) / totalReplies || 0

    // Tone distribution
    const toneCount: Record<string, number> = {}
    replyEvents.forEach(event => {
      const tone = event.properties?.tone || 'unknown'
      toneCount[tone] = (toneCount[tone] || 0) + 1
    })

    const topTones = Object.entries(toneCount)
      .map(([tone, count]) => ({
        tone,
        count,
        percentage: (count / totalReplies) * 100
      }))
      .sort((a, b) => b.count - a.count)

    // Daily usage (last 7 days)
    const dailyUsage = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayEvents = events.filter(e => 
        e.timestamp.startsWith(dateStr)
      )
      
      dailyUsage.push({
        date: dateStr,
        replies: dayEvents.filter(e => e.event === 'reply_generated').length,
        engagement: dayEvents.filter(e => e.event === 'reply_filled').length
      })
    }

    // Crypto vs General mode usage
    const cryptoEvents = replyEvents.filter(e => e.properties?.cryptoMode === true).length
    const generalEvents = replyEvents.filter(e => e.properties?.cryptoMode === false).length

    // Performance metrics
    const errorEvents = events.filter(e => e.event === 'error_occurred')
    const successRate = totalReplies / (totalReplies + errorEvents.length) * 100 || 0
    const errorRate = errorEvents.length / (totalReplies + errorEvents.length) * 100 || 0

    // Mock data for crypto projects and sentiment (would be real in production)
    const topProjects = [
      { name: 'Bitcoin', mentions: 45, symbol: 'BTC' },
      { name: 'Ethereum', mentions: 38, symbol: 'ETH' },
      { name: 'Solana', mentions: 22, symbol: 'SOL' },
      { name: 'Base', mentions: 18, symbol: 'BASE' },
      { name: 'Arbitrum', mentions: 15, symbol: 'ARB' }
    ]

    const sentimentDistribution = {
      bullish: 45,
      neutral: 35,
      bearish: 20
    }

    return {
      totalReplies,
      totalCopied,
      totalFilled,
      averageLength,
      topTones,
      dailyUsage,
      cryptoModeUsage: { crypto: cryptoEvents, general: generalEvents },
      performanceMetrics: {
        successRate,
        averageGenerationTime: 2.3, // Mock data
        errorRate
      },
      topProjects,
      sentimentDistribution
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yapmate-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Start using YapMate to see your analytics!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">📊 Analytics Dashboard</h2>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          className="input-field text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="text-2xl font-bold text-yapmate-primary">{analytics.totalReplies}</div>
          <div className="text-sm text-gray-600">Replies Generated</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="text-2xl font-bold text-green-600">{analytics.totalFilled}</div>
          <div className="text-sm text-gray-600">Replies Used</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="text-2xl font-bold text-blue-600">{Math.round(analytics.averageLength)}</div>
          <div className="text-sm text-gray-600">Avg Length</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.performanceMetrics.successRate)}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </motion.div>
      </div>

      {/* Top Tones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🎭 Popular Tones</h3>
        <div className="space-y-2">
          {analytics.topTones.map((tone, index) => (
            <div key={tone.tone} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="capitalize font-medium">{tone.tone}</span>
                <span className="text-sm text-gray-500">({tone.count})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yapmate-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tone.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-10 text-right">
                  {Math.round(tone.percentage)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Crypto vs General Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">₿ Mode Usage</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{analytics.cryptoModeUsage.crypto}</div>
            <div className="text-sm text-gray-600">Crypto Mode</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{analytics.cryptoModeUsage.general}</div>
            <div className="text-sm text-gray-600">General Mode</div>
          </div>
        </div>
      </motion.div>

      {/* Top Crypto Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🚀 Top Crypto Projects</h3>
        <div className="space-y-2">
          {analytics.topProjects.map((project, index) => (
            <div key={project.symbol} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{project.name}</span>
                <span className="text-sm text-gray-500">${project.symbol}</span>
              </div>
              <span className="text-sm font-medium text-yapmate-primary">
                {project.mentions} mentions
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sentiment Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-4"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📈 Market Sentiment</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{analytics.sentimentDistribution.bullish}%</div>
            <div className="text-sm text-gray-600">Bullish</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">{analytics.sentimentDistribution.neutral}%</div>
            <div className="text-sm text-gray-600">Neutral</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{analytics.sentimentDistribution.bearish}%</div>
            <div className="text-sm text-gray-600">Bearish</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
