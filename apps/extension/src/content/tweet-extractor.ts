// Revolutionary Tweet extraction system for Twitter/X
export class TweetExtractor {
  private isInitialized = false
  private observer: MutationObserver | null = null
  private extractedTweets = new Map<string, any>()
  private onTweetsUpdate: ((tweets: any[]) => void) | null = null
  private lastExtractionTime = 0
  private extractionQueue: Set<Element> = new Set()
  private isProcessing = false

  async init(): Promise<void> {
    console.log('🚀 Initializing Revolutionary Tweet Extractor...')
    this.isInitialized = true
    await this.setupAdvancedObserver()
    await this.performInitialExtraction()
    console.log('✅ Tweet Extractor Ready!')
  }

  private async setupAdvancedObserver(): Promise<void> {
    // Revolutionary multi-strategy observer system
    this.observer = new MutationObserver((mutations) => {
      const now = Date.now()

      // Throttle to prevent overwhelming
      if (now - this.lastExtractionTime < 100) return

      let hasNewContent = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element

              // Multiple detection strategies
              if (this.isTweetElement(element)) {
                this.extractionQueue.add(element)
                hasNewContent = true
              } else {
                // Deep scan for nested tweets
                const tweets = this.findAllTweets(element)
                tweets.forEach(tweet => {
                  this.extractionQueue.add(tweet)
                  hasNewContent = true
                })
              }
            }
          })
        }
      })

      if (hasNewContent) {
        this.processExtractionQueue()
      }
    })

    // Advanced observation configuration
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false
    })

    // Additional observers for specific Twitter containers
    this.setupSpecializedObservers()
  }

  private setupSpecializedObservers(): void {
    // Observer for main timeline
    const timelineObserver = () => {
      const timeline = document.querySelector('[data-testid="primaryColumn"]') ||
                      document.querySelector('[aria-label*="Timeline"]') ||
                      document.querySelector('main[role="main"]')

      if (timeline && !timeline.hasAttribute('yapmate-observed')) {
        timeline.setAttribute('yapmate-observed', 'true')

        const observer = new MutationObserver(() => {
          this.scheduleExtraction()
        })

        observer.observe(timeline, {
          childList: true,
          subtree: true
        })
      }
    }

    // Run immediately and on interval
    timelineObserver()
    setInterval(timelineObserver, 2000)
  }

  private findAllTweets(element: Element): Element[] {
    const tweets: Element[] = []

    // Multiple selectors for different Twitter layouts
    const selectors = [
      'article[data-testid="tweet"]',
      'article[role="article"]',
      '[data-testid="tweet"]',
      '.tweet',
      '[data-tweet-id]'
    ]

    selectors.forEach(selector => {
      try {
        const found = element.querySelectorAll(selector)
        found.forEach(tweet => tweets.push(tweet))
      } catch (e) {
        // Ignore selector errors
      }
    })

    return [...new Set(tweets)] // Remove duplicates
  }

  private async performInitialExtraction(): Promise<void> {
    console.log('🔍 Performing initial tweet extraction...')

    // Wait for page to stabilize
    await this.waitForPageLoad()

    // Extract all visible tweets
    const tweets = this.findAllTweets(document.body)
    console.log(`📊 Found ${tweets.length} tweets on page`)

    tweets.forEach(tweet => this.extractionQueue.add(tweet))
    await this.processExtractionQueue()

    console.log(`✅ Initial extraction complete: ${this.extractedTweets.size} tweets`)
  }

  private async waitForPageLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        setTimeout(resolve, 1000) // Give Twitter time to render
      } else {
        window.addEventListener('load', () => {
          setTimeout(resolve, 1000)
        })
      }
    })
  }

  private scheduleExtraction(): void {
    if (this.isProcessing) return

    setTimeout(() => {
      this.processExtractionQueue()
    }, 200)
  }

  private async processExtractionQueue(): Promise<void> {
    if (this.isProcessing || this.extractionQueue.size === 0) return

    this.isProcessing = true
    this.lastExtractionTime = Date.now()

    const elementsToProcess = Array.from(this.extractionQueue)
    this.extractionQueue.clear()

    let newTweets = 0

    for (const element of elementsToProcess) {
      try {
        const tweet = this.extractTweetFromElement(element as HTMLElement)
        if (tweet && tweet.id && !this.extractedTweets.has(tweet.id)) {
          this.extractedTweets.set(tweet.id, tweet)
          newTweets++
        }
      } catch (error) {
        console.warn('Error processing tweet:', error)
      }
    }

    if (newTweets > 0) {
      console.log(`🆕 Extracted ${newTweets} new tweets`)
      if (this.onTweetsUpdate) {
        this.onTweetsUpdate(Array.from(this.extractedTweets.values()))
      }
    }

    this.isProcessing = false
  }

  private isTweetElement(element: Element): boolean {
    // Enhanced tweet detection
    const selectors = [
      'article[data-testid="tweet"]',
      'article[role="article"]',
      '[data-testid="tweet"]'
    ]

    return selectors.some(selector => {
      try {
        return element.matches(selector)
      } catch {
        return false
      }
    })
  }

  async extractTweets(): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('TweetExtractor not initialized')
    }

    try {
      // Get all current tweets on the page
      const tweetElements = document.querySelectorAll('article[data-testid="tweet"]')

      if (tweetElements.length === 0) {
        console.log('No tweets found on page')
        return []
      }

      this.extractedTweets.clear()

      for (const element of Array.from(tweetElements)) {
        this.extractionQueue.add(element)
      }

      const tweets = Array.from(this.extractedTweets.values())
      console.log(`Extracted ${tweets.length} tweets`)

      return tweets

    } catch (error) {
      console.error('Error in extractTweets:', error)
      return []
    }
  }

  setOnTweetsUpdate(callback: (tweets: any[]) => void): void {
    this.onTweetsUpdate = callback
  }

  private extractTweetFromElement(element: HTMLElement): any | null {
    try {
      // Revolutionary multi-strategy extraction
      const extractionResult = this.performAdvancedExtraction(element)

      if (!extractionResult.isValid) {
        return null
      }

      const tweet = {
        id: extractionResult.id,
        text: extractionResult.text,
        author: extractionResult.author,
        username: extractionResult.username,
        timestamp: extractionResult.timestamp,
        replyCount: extractionResult.metrics.replies,
        retweetCount: extractionResult.metrics.retweets,
        likeCount: extractionResult.metrics.likes,
        viewCount: extractionResult.metrics.views || 0,
        hasReplyBox: extractionResult.hasReplyBox,
        url: extractionResult.url,
        isThread: extractionResult.isThread,
        isRetweet: extractionResult.isRetweet,
        media: extractionResult.media,
        mentions: extractionResult.mentions,
        hashtags: extractionResult.hashtags,
        links: extractionResult.links,
        sentiment: extractionResult.sentiment,
        language: extractionResult.language,
        platform: 'twitter',
        extractedAt: new Date().toISOString(),
        quality: extractionResult.quality
      }

      return tweet

    } catch (error) {
      console.error('❌ Error extracting tweet:', error)
      return null
    }
  }

  private performAdvancedExtraction(element: HTMLElement): any {
    const result = {
      isValid: false,
      quality: 0,
      id: '',
      text: '',
      author: '',
      username: '',
      timestamp: '',
      metrics: { replies: 0, retweets: 0, likes: 0, views: 0 },
      hasReplyBox: false,
      url: '',
      isThread: false,
      isRetweet: false,
      media: [] as Array<{type: string; url: string; alt?: string}>,
      mentions: [] as string[],
      hashtags: [] as string[],
      links: [] as string[],
      sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
      language: 'en'
    }

    // Step 1: Extract text content
    const textResult = this.extractAdvancedText(element)
    if (!textResult.text || textResult.text.length < 3) {
      return result
    }
    result.text = textResult.text
    result.quality += textResult.confidence * 30

    // Step 2: Extract author information
    const authorResult = this.extractAdvancedAuthor(element)
    if (!authorResult.username) {
      return result
    }
    result.author = authorResult.displayName
    result.username = authorResult.username
    result.quality += authorResult.confidence * 25

    // Step 3: Extract timestamp
    const timestampResult = this.extractAdvancedTimestamp(element)
    result.timestamp = timestampResult.timestamp
    result.quality += timestampResult.confidence * 15

    // Step 4: Extract engagement metrics
    const metricsResult = this.extractAdvancedMetrics(element)
    result.metrics = metricsResult.metrics
    result.quality += metricsResult.confidence * 10

    // Step 5: Extract additional data
    result.url = this.extractTweetUrl(element) || ''
    result.hasReplyBox = this.hasReplyBox(element)
    result.isThread = this.isPartOfThread(element)
    result.isRetweet = this.isRetweet(element)
    result.media = this.extractMediaInfo(element)
    result.mentions = this.extractMentions(element)
    result.hashtags = this.extractHashtags(element)
    result.links = this.extractLinks(element)
    result.sentiment = this.analyzeSentiment(element)
    result.language = this.detectLanguage(result.text)

    // Generate ID
    result.id = this.generateAdvancedId(result)

    // Quality threshold
    result.isValid = result.quality >= 50

    return result
  }

  private extractAdvancedText(element: HTMLElement): { text: string; confidence: number } {
    const strategies = [
      // Strategy 1: Primary tweet text selector
      {
        extract: () => element.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || '',
        confidence: 0.95
      },

      // Strategy 2: Language-tagged content
      {
        extract: () => {
          const langElements = element.querySelectorAll('[lang]:not([lang=""])')
          let bestText = ''
          let maxLength = 0

          langElements.forEach(el => {
            const text = el.textContent?.trim() || ''
            if (text.length > maxLength && text.length > 10) {
              bestText = text
              maxLength = text.length
            }
          })

          return bestText
        },
        confidence: 0.85
      },

      // Strategy 3: Span elements with specific patterns
      {
        extract: () => {
          const spans = element.querySelectorAll('span')
          let bestText = ''
          let maxLength = 0

          spans.forEach(span => {
            const text = span.textContent?.trim() || ''
            const parent = span.parentElement

            // Check if this looks like tweet content
            if (text.length > 20 && text.length < 2000 &&
                !text.includes('Retweet') &&
                !text.includes('Like') &&
                !text.includes('Reply') &&
                parent && !parent.querySelector('button')) {

              if (text.length > maxLength) {
                bestText = text
                maxLength = text.length
              }
            }
          })

          return bestText
        },
        confidence: 0.7
      },

      // Strategy 4: Fallback to any substantial text
      {
        extract: () => {
          const allText = element.textContent?.trim() || ''
          const lines = allText.split('\n').filter(line => line.trim().length > 0)

          // Find the longest meaningful line
          let bestLine = ''
          for (const line of lines) {
            const cleaned = line.trim()
            if (cleaned.length > 20 && cleaned.length < 2000 &&
                !cleaned.includes('Retweet') &&
                !cleaned.includes('Like') &&
                !cleaned.includes('Reply') &&
                cleaned.length > bestLine.length) {
              bestLine = cleaned
            }
          }

          return bestLine
        },
        confidence: 0.5
      }
    ]

    // Try strategies in order of confidence
    for (const strategy of strategies) {
      const text = strategy.extract()
      if (text && text.length >= 3) {
        return { text, confidence: strategy.confidence }
      }
    }

    return { text: '', confidence: 0 }
  }

  private extractAdvancedAuthor(element: HTMLElement): { displayName: string; username: string; confidence: number } {
    const strategies = [
      // Strategy 1: Standard Twitter selectors
      {
        extract: () => {
          const userNameContainer = element.querySelector('[data-testid="User-Name"]')
          if (!userNameContainer) return null

          const displayNameEl = userNameContainer.querySelector('span:not([dir])') ||
                                userNameContainer.querySelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0')

          const displayName = displayNameEl?.textContent?.trim() || ''

          // Extract username from the same container
          const usernameMatch = userNameContainer.textContent?.match(/@(\w+)/)
          const username = usernameMatch ? usernameMatch[1] : ''

          return { displayName, username }
        },
        confidence: 0.9
      },

      // Strategy 2: Link-based extraction
      {
        extract: () => {
          const profileLinks = element.querySelectorAll('a[href*="/"]')

          for (const link of profileLinks) {
            const href = link.getAttribute('href') || ''
            const usernameMatch = href.match(/^\/([a-zA-Z0-9_]+)$/)

            if (usernameMatch) {
              const username = usernameMatch[1]
              const displayName = link.textContent?.trim() || username

              // Validate it's not a system link
              if (!['home', 'explore', 'notifications', 'messages', 'bookmarks', 'lists', 'profile', 'more'].includes(username)) {
                return { displayName, username }
              }
            }
          }

          return null
        },
        confidence: 0.8
      },

      // Strategy 3: Pattern matching in text
      {
        extract: () => {
          const text = element.textContent || ''
          const lines = text.split('\n').filter(line => line.trim())

          for (const line of lines) {
            const usernameMatch = line.match(/@(\w+)/)
            if (usernameMatch) {
              const username = usernameMatch[1]
              // Try to find display name in the same line or previous line
              const displayNameMatch = line.replace(/@\w+/, '').trim()
              const displayName = displayNameMatch || username

              return { displayName, username }
            }
          }

          return null
        },
        confidence: 0.6
      }
    ]

    // Try strategies in order
    for (const strategy of strategies) {
      const result = strategy.extract()
      if (result && result.username && result.username.length > 0) {
        return {
          displayName: result.displayName || result.username,
          username: result.username,
          confidence: strategy.confidence
        }
      }
    }

    return { displayName: 'Unknown', username: 'unknown', confidence: 0 }
  }

  private extractAdvancedTimestamp(element: HTMLElement): { timestamp: string; confidence: number } {
    const strategies = [
      // Strategy 1: Standard time element with datetime
      {
        extract: () => {
          const timeEl = element.querySelector('time[datetime]')
          if (timeEl) {
            const datetime = timeEl.getAttribute('datetime')
            if (datetime) {
              return new Date(datetime).toISOString()
            }
          }
          return null
        },
        confidence: 0.95
      },

      // Strategy 2: Time element with relative text
      {
        extract: () => {
          const timeEl = element.querySelector('time')
          if (timeEl) {
            const text = timeEl.textContent?.trim()
            if (text) {
              return this.parseRelativeTime(text)
            }
          }
          return null
        },
        confidence: 0.8
      },

      // Strategy 3: Link with time pattern
      {
        extract: () => {
          const links = element.querySelectorAll('a[href*="/status/"]')
          for (const link of links) {
            const text = link.textContent?.trim()
            if (text && (text.includes('m') || text.includes('h') || text.includes('d') || text.includes('now'))) {
              return this.parseRelativeTime(text)
            }
          }
          return null
        },
        confidence: 0.7
      }
    ]

    for (const strategy of strategies) {
      const result = strategy.extract()
      if (result) {
        return { timestamp: result, confidence: strategy.confidence }
      }
    }

    return { timestamp: new Date().toISOString(), confidence: 0.1 }
  }

  private extractAdvancedMetrics(element: HTMLElement): { metrics: { replies: number; retweets: number; likes: number; views: number }; confidence: number } {
    const metrics = { replies: 0, retweets: 0, likes: 0, views: 0 }
    let confidence = 0

    try {
      // Try to find engagement buttons
      const buttons = element.querySelectorAll('[role="button"], button')

      buttons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label') || ''
        const text = button.textContent || ''

        // Extract numbers from aria-label or text
        const numberMatch = (ariaLabel + ' ' + text).match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i)
        if (numberMatch) {
          const count = this.parseEngagementCount(numberMatch[1])

          if (ariaLabel.toLowerCase().includes('repl') || text.includes('💬')) {
            metrics.replies = count
            confidence += 0.2
          } else if (ariaLabel.toLowerCase().includes('retweet') || text.includes('🔄')) {
            metrics.retweets = count
            confidence += 0.2
          } else if (ariaLabel.toLowerCase().includes('like') || text.includes('❤️')) {
            metrics.likes = count
            confidence += 0.2
          } else if (ariaLabel.toLowerCase().includes('view') || text.includes('👁️')) {
            metrics.views = count
            confidence += 0.2
          }
        }
      })
    } catch (error) {
      console.warn('Error extracting advanced metrics:', error)
    }

    return { metrics, confidence: Math.min(confidence, 1) }
  }

  private isRetweet(element: HTMLElement): boolean {
    const text = element.textContent || ''
    const retweetIndicators = ['Retweeted', 'RT @', 'retweeted']

    return retweetIndicators.some(indicator =>
      text.toLowerCase().includes(indicator.toLowerCase())
    )
  }

  private extractLinks(element: HTMLElement): string[] {
    const links: string[] = []
    const linkElements = element.querySelectorAll('a[href]')

    linkElements.forEach(link => {
      const href = link.getAttribute('href')
      if (href && !href.startsWith('/') && href.includes('http')) {
        links.push(href)
      }
    })

    return [...new Set(links)] // Remove duplicates
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
    if (/[\u0600-\u06ff]/.test(text)) return 'ar'
    if (/[\u0400-\u04ff]/.test(text)) return 'ru'

    return 'en' // Default to English
  }

  private generateAdvancedId(result: any): string {
    const combined = `${result.text}-${result.username}-${result.timestamp}`
    let hash = 0

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
  }

  private extractTimestamp(element: HTMLElement): string {
    const timeElement = element.querySelector('time[datetime]')
    if (timeElement) {
      const datetime = timeElement.getAttribute('datetime')
      if (datetime) {
        return new Date(datetime).toISOString()
      }
    }

    // Fallback: try to parse relative time
    const timeText = element.querySelector('time')?.textContent?.trim()
    if (timeText) {
      return this.parseRelativeTime(timeText)
    }

    return new Date().toISOString()
  }

  private parseRelativeTime(timeText: string): string {
    const now = new Date()
    const lowerText = timeText.toLowerCase()

    if (lowerText.includes('now') || lowerText.includes('just now')) {
      return now.toISOString()
    }

    const minuteMatch = lowerText.match(/(\d+)m/)
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1])
      return new Date(now.getTime() - minutes * 60 * 1000).toISOString()
    }

    const hourMatch = lowerText.match(/(\d+)h/)
    if (hourMatch) {
      const hours = parseInt(hourMatch[1])
      return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
    }

    const dayMatch = lowerText.match(/(\d+)d/)
    if (dayMatch) {
      const days = parseInt(dayMatch[1])
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
    }

    return now.toISOString()
  }

  private isPartOfThread(element: HTMLElement): boolean {
    // Check for thread indicators
    const threadIndicators = [
      '[data-testid="tweet"] + [data-testid="tweet"]', // Sequential tweets
      '.css-1dbjc4n[data-testid="tweet"]', // Thread container
      '[aria-label*="thread"]' // Thread labels
    ]

    return threadIndicators.some(selector => {
      try {
        return element.closest(selector) !== null || element.querySelector(selector) !== null
      } catch {
        return false
      }
    })
  }

  private extractMediaInfo(element: HTMLElement): Array<{type: string; url: string; alt?: string}> {
    const media: Array<{type: string; url: string; alt?: string}> = []

    // Extract images
    const images = element.querySelectorAll('img[src*="pbs.twimg.com"]')
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src) {
        media.push({
          type: 'image',
          url: src,
          alt: img.getAttribute('alt') || ''
        })
      }
    })

    // Extract videos
    const videos = element.querySelectorAll('video')
    videos.forEach(video => {
      const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src')
      if (src) {
        media.push({
          type: 'video',
          url: src
        })
      }
    })

    return media
  }

  private extractEngagementMetrics(element: HTMLElement): { replies: number; retweets: number; likes: number } {
    const metrics = { replies: 0, retweets: 0, likes: 0 }

    try {
      // Look for engagement buttons and their counts
      const engagementSelectors = [
        '[data-testid="reply"]',
        '[data-testid="retweet"]',
        '[data-testid="like"]',
        '[data-testid="unretweet"]',
        '[data-testid="unlike"]'
      ]

      engagementSelectors.forEach(selector => {
        const button = element.querySelector(selector)
        if (button) {
          const countElement = button.querySelector('[data-testid$="count"]') || 
                              button.querySelector('.css-901oao') ||
                              button.nextElementSibling

          if (countElement) {
            const countText = countElement.textContent?.trim()
            const count = this.parseEngagementCount(countText || '0')

            if (selector.includes('reply')) {
              metrics.replies = count
            } else if (selector.includes('retweet')) {
              metrics.retweets = count
            } else if (selector.includes('like')) {
              metrics.likes = count
            }
          }
        }
      })
    } catch (error) {
      console.warn('Error extracting engagement metrics:', error)
    }

    return metrics
  }

  private parseEngagementCount(countText: string): number {
    if (!countText || countText === '') return 0

    const cleanText = countText.toLowerCase().replace(/,/g, '')
    
    if (cleanText.includes('k')) {
      return Math.floor(parseFloat(cleanText) * 1000)
    } else if (cleanText.includes('m')) {
      return Math.floor(parseFloat(cleanText) * 1000000)
    } else {
      return parseInt(cleanText) || 0
    }
  }

  private hasReplyBox(element: HTMLElement): boolean {
    // Check if there's a reply button or reply box nearby
    const replySelectors = [
      '[data-testid="reply"]',
      '.tweet-reply-button',
      '[aria-label*="Reply"]'
    ]

    return replySelectors.some(selector => element.querySelector(selector) !== null)
  }

  private extractTweetUrl(element: HTMLElement): string | undefined {
    try {
      // Look for tweet permalink
      const linkSelectors = [
        'a[href*="/status/"]',
        'time[datetime] a',
        '.tweet-timestamp a'
      ]

      for (const selector of linkSelectors) {
        const linkElement = element.querySelector(selector) as HTMLAnchorElement
        if (linkElement && linkElement.href) {
          return linkElement.href
        }
      }

      return undefined
    } catch (error) {
      console.warn('Error extracting tweet URL:', error)
      return undefined
    }
  }

  private generateTweetId(text: string, author: string, timestamp: string): string {
    // Create a simple hash-based ID
    const combined = `${text}-${author}-${timestamp}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  async extractTweetContext(tweetId: string): Promise<any> {
    // Extract additional context for a specific tweet
    try {
      const tweetElement = document.querySelector(`[data-tweet-id="${tweetId}"]`) ||
                          document.querySelector(`#tweet-${tweetId}`)

      if (!tweetElement) {
        return null
      }

      // Extract thread context, mentions, hashtags, etc.
      const context = {
        threadContext: this.extractThreadContext(tweetElement as HTMLElement),
        mentions: this.extractMentions(tweetElement as HTMLElement),
        hashtags: this.extractHashtags(tweetElement as HTMLElement),
        sentiment: this.analyzeSentiment(tweetElement as HTMLElement)
      }

      return context
    } catch (error) {
      console.error('Error extracting tweet context:', error)
      return null
    }
  }

  private extractThreadContext(element: HTMLElement): string[] {
    // Extract previous tweets in thread
    return []
  }

  private extractMentions(element: HTMLElement): string[] {
    const text = element.textContent || ''
    const mentions = text.match(/@(\w+)/g)
    return mentions ? mentions.map(m => m.substring(1)) : []
  }

  private extractHashtags(element: HTMLElement): string[] {
    const text = element.textContent || ''
    const hashtags = text.match(/#(\w+)/g)
    return hashtags ? hashtags.map(h => h.substring(1)) : []
  }

  private analyzeSentiment(element: HTMLElement): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis based on keywords
    const text = (element.textContent || '').toLowerCase()
    
    const positiveWords = ['great', 'awesome', 'amazing', 'love', 'excellent', 'fantastic', 'bullish', 'moon', 'lfg']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'bearish', 'dump', 'crash', 'scam']
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length
    const negativeCount = negativeWords.filter(word => text.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  destroy(): void {
    this.isInitialized = false
  }
}
