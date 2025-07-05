// Content script for multi-platform integration
import { TweetExtractor } from './tweet-extractor'
import { TwitterIntegration } from './twitter-integration'
import { platformManager } from '../platforms/PlatformManager'

// Simple logger
const logger = {
  info: (...args: any[]) => console.log('[Content]', ...args),
  warn: (...args: any[]) => console.warn('[Content]', ...args),
  error: (...args: any[]) => console.error('[Content]', ...args),
  debug: (...args: any[]) => console.debug('[Content]', ...args),
}

// Simple debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

class YapMateContentScript {
  private tweetExtractor: TweetExtractor
  private twitterIntegration: TwitterIntegration
  private isInitialized = false
  private observer: MutationObserver | null = null

  constructor() {
    this.tweetExtractor = new TweetExtractor()
    this.twitterIntegration = new TwitterIntegration()
    
    this.init()
  }

  private async init() {
    try {
      logger.info('Initializing YapMate content script')
      
      // Wait for page to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup())
      } else {
        this.setup()
      }
    } catch (error) {
      logger.error('Error initializing content script:', error)
    }
  }

  private async setup() {
    try {
      // Verify we're on Twitter/X specifically
      if (!this.isTwitterPage()) {
        logger.warn('❌ Not on Twitter/X, content script will not activate')
        return
      }

      logger.info('🚀 Setting up YapMate on Twitter/X')

      // Initialize components
      await this.tweetExtractor.init()
      await this.twitterIntegration.init()

      // Set up message listeners
      this.setupMessageListeners()

      // Set up DOM observers
      this.setupDOMObserver()

      // Wait for page to load then extract tweets
      setTimeout(async () => {
        logger.info('🔍 Starting initial tweet extraction...')
        await this.extractTweets()
      }, 3000)

      this.isInitialized = true
      logger.info('✅ YapMate content script initialized successfully')

      // Notify background script
      chrome.runtime.sendMessage({
        type: 'CONTENT_SCRIPT_READY',
        payload: { url: window.location.href }
      })

    } catch (error) {
      logger.error('❌ Error setting up content script:', error)
    }
  }

  private isTwitterPage(): boolean {
    const hostname = window.location.hostname
    return hostname === 'x.com' || hostname === 'twitter.com'
  }

  private async extractTweets() {
    try {
      // Check if we're on Twitter/X
      if (!this.isTwitterPage()) {
        logger.warn('❌ Not on Twitter/X, skipping tweet extraction')
        return
      }

      logger.info('🔍 Extracting tweets from page...')

      // Extract tweets using the dedicated tweet extractor
      const tweets = await this.tweetExtractor.extractTweets()

      logger.info(`📊 Found ${tweets.length} tweets on page`)

      if (tweets.length > 0) {
        this.sendTweetsToSidebar(tweets)
        logger.info(`✅ Sent ${tweets.length} tweets to sidebar`)
      } else {
        logger.warn('⚠️ No tweets found on page')
      }
    } catch (error) {
      logger.error('❌ Error extracting tweets:', error)
    }
  }

  private sendTweetsToSidebar(tweets: any[]) {
    logger.info(`📤 Sending ${tweets.length} tweets to sidebar`)

    // Notify sidebar about new tweets
    chrome.runtime.sendMessage({
      type: 'TWEETS_UPDATED',
      payload: {
        tweets,
        url: window.location.href,
        platform: 'twitter',
        timestamp: Date.now()
      }
    }).catch(error => {
      logger.error('❌ Failed to send tweets to sidebar:', error)
    })
  }



  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      logger.debug('Message received:', message)

      switch (message.type) {
        case 'GET_TWEETS':
          this.handleGetTweets(sendResponse)
          break

        case 'FILL_REPLY_BOX':
          this.handleFillReplyBox(message.payload, sendResponse)
          break

        case 'COPY_TO_CLIPBOARD':
          this.handleCopyToClipboard(message.payload, sendResponse)
          break

        case 'EXTRACT_TWEET_CONTEXT':
          this.handleExtractTweetContext(message.payload, sendResponse)
          break

        case 'SCROLL_TO_TWEET':
          this.handleScrollToTweet(message.payload, sendResponse)
          break

        default:
          logger.warn('Unknown message type:', message.type)
          sendResponse({ success: false, error: 'Unknown message type' })
      }

      return true // Keep message channel open
    })
  }

  private setupDOMObserver() {
    // Set up real-time tweet updates from the tweet extractor
    this.tweetExtractor.setOnTweetsUpdate((tweets) => {
      this.sendTweetsToSidebar(tweets)
    })

    // Debounced function to handle URL changes and major DOM updates
    const handleDOMChanges = debounce(() => {
      if (this.isInitialized && this.isTwitterPage()) {
        this.extractTweets()
      }
    }, 1000)

    // Create observer to watch for navigation changes (Twitter is SPA)
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if this is a major page change
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.querySelector('[data-testid="tweet"]') || 
                  element.closest('[data-testid="tweet"]')) {
                shouldUpdate = true
              }
            }
          })
        }
      })

      if (shouldUpdate) {
        handleDOMChanges()
      }
    })

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    logger.debug('DOM observer set up')
  }



  private async handleGetTweets(sendResponse: (response: any) => void) {
    try {
      const tweets = await this.tweetExtractor.extractTweets()
      sendResponse({ success: true, data: tweets })
    } catch (error) {
      logger.error('Error getting tweets:', error)
      sendResponse({ success: false, error: (error as Error).message })
    }
  }

  private async handleFillReplyBox(payload: any, sendResponse: (response: any) => void) {
    try {
      const { tweetId, replyText } = payload
      const success = await this.twitterIntegration.fillReplyBox(tweetId, replyText)
      
      if (success) {
        // Track analytics
        chrome.runtime.sendMessage({
          type: 'ANALYTICS_EVENT',
          payload: {
            event: 'reply_filled',
            properties: { tweetId, replyLength: replyText.length }
          }
        })
      }
      
      sendResponse({ success })
    } catch (error) {
      logger.error('Error filling reply box:', error)
      sendResponse({ success: false, error: (error as Error).message })
    }
  }

  private async handleCopyToClipboard(payload: any, sendResponse: (response: any) => void) {
    try {
      const { text } = payload
      await navigator.clipboard.writeText(text)

      // Track analytics
      chrome.runtime.sendMessage({
        type: 'ANALYTICS_EVENT',
        payload: {
          event: 'reply_copied',
          properties: { textLength: text.length }
        }
      })

      sendResponse({ success: true })
    } catch (error) {
      logger.error('Error copying to clipboard:', error)
      sendResponse({ success: false, error: (error as Error).message })
    }
  }

  private async handleExtractTweetContext(payload: any, sendResponse: (response: any) => void) {
    try {
      const { tweetId } = payload
      const context = await this.tweetExtractor.extractTweetContext(tweetId)
      sendResponse({ success: true, data: context })
    } catch (error) {
      logger.error('Error extracting tweet context:', error)
      sendResponse({ success: false, error: (error as Error).message })
    }
  }

  private async handleScrollToTweet(payload: any, sendResponse: (response: any) => void) {
    try {
      const { tweetId } = payload
      const success = await this.twitterIntegration.scrollToTweet(tweetId)
      sendResponse({ success })
    } catch (error) {
      logger.error('Error scrolling to tweet:', error)
      sendResponse({ success: false, error: (error as Error).message })
    }
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    this.tweetExtractor.destroy()
    this.twitterIntegration.destroy()
    
    logger.info('Content script destroyed')
  }
}

// Initialize content script
let yapMateContent: YapMateContentScript | null = null

try {
  yapMateContent = new YapMateContentScript()
} catch (error) {
  logger.error('Failed to initialize YapMate content script:', error)
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (yapMateContent) {
    yapMateContent.destroy()
    yapMateContent = null
  }
})

// Handle page navigation (SPA)
let currentUrl = window.location.href
const checkUrlChange = () => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href
    logger.info('URL changed, reinitializing content script')
    
    if (yapMateContent) {
      yapMateContent.destroy()
    }
    
    // Reinitialize after a short delay
    setTimeout(() => {
      yapMateContent = new YapMateContentScript()
    }, 1000)
  }
}

// Check for URL changes periodically (for SPA navigation)
setInterval(checkUrlChange, 1000)

logger.info('YapMate content script loaded')
