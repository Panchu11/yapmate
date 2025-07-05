import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      // Simulate AI generation with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock reply generation based on tone
      const mockReplies = {
        smart: `Interesting perspective on ${tweet.text.split(' ').slice(0, 3).join(' ')}. The data suggests this trend could continue, especially considering the current market dynamics. What's your take on the long-term implications? 🧠`,
        funny: `Haha, this reminds me of when I tried to explain crypto to my grandma 😂 She said "So it's like Monopoly money but more expensive?" Not wrong tbh 💀`,
        serious: `This is a significant development that could impact the broader ecosystem. The implications for institutional adoption and regulatory clarity are worth monitoring closely. 💼`,
        degen: `LFG! 🚀 This is exactly what we've been waiting for! Time to load up the bags and ride this wave to the moon! Who's with me? 💎🙌 #ToTheMoon`
      }

      const reply = mockReplies[selectedTone]
      
      // Simulate typewriter effect
      for (let i = 0; i <= reply.length; i++) {
        setGeneratedReply(reply.substring(0, i))
        await new Promise(resolve => setTimeout(resolve, 30))
      }

    } catch (err) {
      setError('Failed to generate reply. Please try again.')
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
      // Simulate rewrite
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const variations = [
        generatedReply.replace(/\./g, '!'),
        generatedReply.replace(/interesting/gi, 'fascinating'),
        generatedReply.replace(/This/g, 'That'),
      ]
      
      const newReply = variations[Math.floor(Math.random() * variations.length)]
      setGeneratedReply(newReply)
    } catch (err) {
      setError('Failed to rewrite reply. Please try again.')
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
