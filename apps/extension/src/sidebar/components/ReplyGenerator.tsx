import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cryptoIntelligence } from '../../utils/cryptoIntelligence'

interface Tweet {
  id: string
  text: string
  author: string
  username: string
}

interface ReplyGeneratorProps {
  tweet: Tweet
  settings: any
  onClose: () => void
}

type ToneType = 'smart' | 'funny' | 'serious' | 'degen'

const tones = [
  { id: 'smart' as ToneType, name: 'Smart', emoji: '🧠', description: 'Analytical and insightful' },
  { id: 'funny' as ToneType, name: 'Funny', emoji: '😂', description: 'Witty and entertaining' },
  { id: 'serious' as ToneType, name: 'Serious', emoji: '💼', description: 'Professional and direct' },
  { id: 'degen' as ToneType, name: 'Degen', emoji: '🚀', description: 'Bold and energetic' },
]

// Helper functions for AI integration
const buildPrompt = (tweet: Tweet, tone: ToneType, cryptoMode: boolean): string => {
  let prompt = `Tweet: "${tweet.text}"\n`
  prompt += `Author: @${tweet.username} (${tweet.author})\n\n`

  if (cryptoMode) {
    // Get enhanced crypto context
    const context = cryptoIntelligence.getEnhancedContext(tweet.text)

    if (context.projects.length > 0) {
      prompt += `Detected Crypto Projects:\n`
      context.projects.forEach(project => {
        prompt += `- ${project.name} (${project.symbol}): ${project.category}\n`
      })
      prompt += `\n`
    }

    if (context.sentiment.confidence > 0.3) {
      prompt += `Market Sentiment: ${context.sentiment.label} (${context.sentiment.score.toFixed(2)})\n`
      prompt += `Key indicators: ${context.sentiment.keywords.join(', ')}\n\n`
    }

    if (context.suggestedTickers.length > 0) {
      prompt += `Suggested tickers to include: ${context.suggestedTickers.join(', ')}\n`
    }

    if (context.suggestedMentions.length > 0) {
      prompt += `Suggested mentions: ${context.suggestedMentions.join(', ')}\n`
    }

    if (context.suggestedHashtags.length > 0) {
      prompt += `Suggested hashtags: ${context.suggestedHashtags.join(', ')}\n`
    }

    prompt += `\n`
  }

  prompt += `Instructions:\n`
  prompt += `- Generate a ${tone} reply to this tweet\n`
  prompt += `- Max 280 characters, natural and conversational\n`
  prompt += `- Write like a real ${cryptoMode ? 'crypto Twitter' : 'social media'} user\n`
  prompt += `- Be engaging and add value to the conversation\n`

  if (cryptoMode) {
    prompt += `- CRITICAL: Use the detected crypto context above\n`
    prompt += `- Include relevant tickers, mentions, and hashtags naturally\n`
    prompt += `- Match the market sentiment appropriately\n`
    prompt += `- Show deep crypto knowledge and community understanding\n`
  }

  prompt += `- NO quotes around the reply, write it as a direct tweet\n`
  prompt += `- Sound authentic and engaging\n\n`
  prompt += `Reply:`

  return prompt
}

const getSystemPrompt = (tone: ToneType, cryptoMode: boolean): string => {
  const basePrompt = 'You are an expert at writing engaging social media replies.'

  if (cryptoMode) {
    return `${basePrompt} You have deep knowledge of cryptocurrency, DeFi, NFTs, and Web3. Analyze tweets for crypto projects and topics, then generate natural responses that include relevant handles, tickers, and hashtags. Write like a knowledgeable crypto community member.`
  }

  return `${basePrompt} Generate natural, engaging replies that add value to conversations. Write like a real person - casual, direct, and conversational.`
}

const getToneTemperature = (tone: ToneType): number => {
  const temperatures = {
    smart: 0.7,
    funny: 0.9,
    serious: 0.5,
    degen: 0.95
  }
  return temperatures[tone] || 0.7
}

const sanitizeReply = (content: string): string => {
  return content
    .replace(/^(Reply:|Response:)\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/^@\w+\s+/, '')
    .trim()
}

export const ReplyGenerator: React.FC<ReplyGeneratorProps> = ({ tweet, settings, onClose }) => {
  const [selectedTone, setSelectedTone] = useState<ToneType>('smart')
  const [generatedReply, setGeneratedReply] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>('')

  const generateReply = async () => {
    setIsGenerating(true)
    setError('')
    setGeneratedReply('')

    try {
      // Get API key from settings
      const result = await chrome.storage.sync.get(['yapmate_settings'])
      const apiKey = result.yapmate_settings?.apiKeys?.fireworks

      if (!apiKey) {
        setError('Please configure your Fireworks AI API key in settings.')
        return
      }

      // Build the AI prompt
      const prompt = buildPrompt(tweet, selectedTone, settings?.cryptoMode)

      // Call Fireworks AI API
      const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(selectedTone, settings?.cryptoMode)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: getToneTemperature(selectedTone),
          top_p: 0.95,
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format')
      }

      const reply = sanitizeReply(data.choices[0].message.content)

      // Animate typewriter effect
      for (let i = 0; i <= reply.length; i++) {
        setGeneratedReply(reply.substring(0, i))
        await new Promise(resolve => setTimeout(resolve, 30))
      }

      // Track analytics
      chrome.runtime.sendMessage({
        type: 'ANALYTICS_EVENT',
        payload: {
          event: 'reply_generated',
          properties: {
            tone: selectedTone,
            cryptoMode: settings?.cryptoMode,
            replyLength: reply.length,
            tweetLength: tweet.text.length
          }
        }
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reply'
      setError(errorMessage)
      console.error('Error generating reply:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyReply = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply)
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy reply:', err)
    }
  }

  const fillReplyBox = async () => {
    try {
      // Send message to content script to fill reply box
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'FILL_REPLY_BOX',
          payload: { tweetId: tweet.id, replyText: generatedReply }
        })
      }
    } catch (err) {
      console.error('Failed to fill reply box:', err)
    }
  }

  const rewriteReply = async () => {
    if (!generatedReply) return

    setIsGenerating(true)
    try {
      // Get API key from settings
      const result = await chrome.storage.sync.get(['yapmate_settings'])
      const apiKey = result.yapmate_settings?.apiKeys?.fireworks

      if (!apiKey) {
        setError('Please configure your Fireworks AI API key in settings.')
        return
      }

      // Build rewrite prompt
      const prompt = `Original reply: "${generatedReply}"

Instructions:
- Rephrase this reply differently while keeping the same meaning
- Keep all hashtags, handles (@), and ticker symbols ($) exactly the same
- Maintain the same tone and style
- Max 280 characters
- Make it sound fresh and natural

Rewritten reply:`

      // Call Fireworks AI API
      const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at rewriting social media replies while maintaining their meaning and tone.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8,
          top_p: 0.95,
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const newReply = sanitizeReply(data.choices[0].message.content)

      setGeneratedReply(newReply)

      // Track analytics
      chrome.runtime.sendMessage({
        type: 'ANALYTICS_EVENT',
        payload: {
          event: 'reply_rewritten',
          properties: {
            originalLength: generatedReply.length,
            newLength: newReply.length
          }
        }
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rewrite reply'
      setError(errorMessage)
      console.error('Error rewriting reply:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tone Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Select Tone:</h4>
        <div className="grid grid-cols-2 gap-2">
          {tones.map((tone) => (
            <motion.button
              key={tone.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTone(tone.id)}
              className={`tone-button ${selectedTone === tone.id ? 'active' : ''}`}
            >
              <span>{tone.emoji}</span>
              <span className="text-sm font-medium">{tone.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generateReply}
        disabled={isGenerating}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <span>Generating...</span>
          </div>
        ) : (
          '✨ Generate AI Reply'
        )}
      </motion.button>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Reply */}
      <AnimatePresence>
        {generatedReply && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <div className="bg-white/50 border border-white/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Generated Reply:</span>
                <span className="text-xs text-gray-500">{generatedReply.length}/280</span>
              </div>
              <p className="text-gray-800 leading-relaxed">{generatedReply}</p>
            </div>

            {/* Reply Actions */}
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyReply}
                className="flex-1 btn-secondary text-sm"
              >
                📋 Copy
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={rewriteReply}
                disabled={isGenerating}
                className="flex-1 btn-secondary text-sm disabled:opacity-50"
              >
                🔄 Rewrite
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fillReplyBox}
                className="flex-1 btn-primary text-sm"
              >
                📝 Fill
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕ Close
        </motion.button>
      </div>
    </div>
  )
}
