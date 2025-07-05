import { useState, useCallback, useEffect } from 'react'

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

export const useTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoadingTweets, setIsLoadingTweets] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen for real-time tweet updates from content script
  useEffect(() => {
    console.log('🎧 Setting up tweet update listener...')

    const handleMessage = (message: any) => {
      console.log('📨 Received message:', message)

      if (message.type === 'TWEETS_UPDATED') {
        const receivedTweets = message.payload?.tweets || []
        console.log(`📊 Received ${receivedTweets.length} tweets from content script`)

        if (receivedTweets.length > 0) {
          setTweets(receivedTweets)
          setError(null)
        }
        setIsLoadingTweets(false)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const refreshTweets = useCallback(async () => {
    console.log('🔄 Refreshing tweets...')
    setIsLoadingTweets(true)
    setError(null)

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab.id) {
        throw new Error('No active tab found')
      }

      console.log('📍 Current tab URL:', tab.url)

      // Check if we're on Twitter/X
      const isTwitter = tab.url?.includes('x.com') || tab.url?.includes('twitter.com')

      if (!isTwitter) {
        console.log('❌ Not on Twitter/X, using mock data')
        setTweets(generateMockTweets())
        setIsLoadingTweets(false)
        return
      }

      console.log('✅ On Twitter/X, requesting tweets from content script...')

      // Send message to content script to get tweets
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'GET_TWEETS'
      })

      console.log('📨 Content script response:', response)

      if (response?.success && response.data?.length > 0) {
        console.log(`✅ Got ${response.data.length} tweets from content script`)
        setTweets(response.data)
        setError(null)
      } else {
        console.log('⚠️ No tweets from content script, using mock data')
        setTweets(generateMockTweets())
      }

    } catch (err) {
      console.error('❌ Error refreshing tweets:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tweets')

      // Fallback to mock data
      console.log('🔄 Falling back to mock data')
      setTweets(generateMockTweets())
    } finally {
      setIsLoadingTweets(false)
    }
  }, [])

  return {
    tweets,
    isLoadingTweets,
    error,
    refreshTweets
  }
}

// Generate mock tweets for demo/fallback
const generateMockTweets = (): Tweet[] => {
  const mockTweets = [
    {
      id: '1',
      text: 'Just deployed my first smart contract on @base! The developer experience is incredible. Gas fees are practically nothing compared to mainnet. Building the future of DeFi one transaction at a time 🚀 #Base #DeFi #Web3',
      author: 'Alex Chen',
      username: 'alexbuilds',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      replyCount: 23,
      retweetCount: 45,
      likeCount: 127,
      hasReplyBox: true,
      url: 'https://x.com/alexbuilds/status/1'
    },
    {
      id: '2',
      text: 'The @HumanityProtocol testnet is live! 🎉 Just completed my first palm scan verification. The future of human-centric identity is here. Who else is testing this revolutionary approach to digital identity? #HumanityProtocol #PalmScan',
      author: 'Sarah Martinez',
      username: 'sarahcrypto',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      replyCount: 67,
      retweetCount: 89,
      likeCount: 234,
      hasReplyBox: true,
      url: 'https://x.com/sarahcrypto/status/2'
    },
    {
      id: '3',
      text: '$BTC just hit a new local high! 📈 The institutional adoption we\'ve been waiting for is finally happening. MicroStrategy, Tesla, and now even traditional banks are accumulating. This is just the beginning of the next bull run 🚀💎',
      author: 'Crypto Analyst',
      username: 'cryptoanalyst',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
      replyCount: 156,
      retweetCount: 234,
      likeCount: 567,
      hasReplyBox: true,
      url: 'https://x.com/cryptoanalyst/status/3'
    },
    {
      id: '4',
      text: 'GM crypto Twitter! ☀️ What are you building today? I\'m diving deep into @solana\'s new features. The speed and cost efficiency is mind-blowing. Web3 infrastructure is finally catching up to Web2 expectations. LFG! 🔥',
      author: 'Dev Mike',
      username: 'devmike',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      replyCount: 89,
      retweetCount: 123,
      likeCount: 345,
      hasReplyBox: true,
      url: 'https://x.com/devmike/status/4'
    },
    {
      id: '5',
      text: 'Hot take: The real value of NFTs isn\'t in JPEGs, it\'s in utility and community. Projects that focus on building genuine value and fostering strong communities will survive the bear market. Quality > hype, always. 🎨✨',
      author: 'NFT Collector',
      username: 'nftcollector',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      replyCount: 234,
      retweetCount: 345,
      likeCount: 678,
      hasReplyBox: true,
      url: 'https://x.com/nftcollector/status/5'
    }
  ]

  return mockTweets
}
