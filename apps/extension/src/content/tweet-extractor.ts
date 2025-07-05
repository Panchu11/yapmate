// Real-time Tweet extraction utility for Twitter/X
export class TweetExtractor {
  private isInitialized = false
  private observer: MutationObserver | null = null
  private extractedTweets = new Map<string, any>()
  private onTweetsUpdate: ((tweets: any[]) => void) | null = null

  async init(): Promise<void> {
    this.isInitialized = true
    this.setupRealTimeObserver()
  }

  private setupRealTimeObserver(): void {
    // Observe DOM changes for real-time tweet detection
    this.observer = new MutationObserver((mutations) => {
      let hasNewTweets = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element

              // Check if this is a tweet or contains tweets
              if (this.isTweetElement(element)) {
                this.processTweetElement(element)
                hasNewTweets = true
              } else {
                // Check for tweets within the added element
                const tweets = element.querySelectorAll('article[data-testid="tweet"]')
                tweets.forEach(tweet => {
                  this.processTweetElement(tweet)
                  hasNewTweets = true
                })
              }
            }
          })
        }
      })

      if (hasNewTweets && this.onTweetsUpdate) {
        this.onTweetsUpdate(Array.from(this.extractedTweets.values()))
      }
    })

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  private isTweetElement(element: Element): boolean {
    return element.matches('article[data-testid="tweet"]') ||
           element.matches('[data-testid="tweet"]') ||
           element.matches('article[role="article"]')
  }

  private processTweetElement(element: Element): void {
    try {
      const tweet = this.extractTweetFromElement(element as HTMLElement)
      if (tweet && tweet.id) {
        this.extractedTweets.set(tweet.id, tweet)
      }
    } catch (error) {
      console.warn('Error processing tweet element:', error)
    }
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
        this.processTweetElement(element)
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
      // Extract tweet text with full content
      const tweetText = this.extractFullTweetText(element)
      if (!tweetText) {
        return null
      }

      // Extract author information
      const authorInfo = this.extractAuthorInfo(element)
      if (!authorInfo.author || !authorInfo.username) {
        return null
      }

      // Extract timestamp
      const timestamp = this.extractTimestamp(element)

      // Extract engagement metrics
      const metrics = this.extractEngagementMetrics(element)

      // Generate unique ID based on content and author
      const id = this.generateTweetId(tweetText, authorInfo.username, timestamp)

      // Check for reply box
      const hasReplyBox = this.hasReplyBox(element)

      // Extract URL if available
      const url = this.extractTweetUrl(element)

      // Check if this is a thread
      const isThread = this.isPartOfThread(element)

      // Extract media information
      const media = this.extractMediaInfo(element)

      return {
        id,
        text: tweetText,
        author: authorInfo.author,
        username: authorInfo.username,
        timestamp,
        replyCount: metrics.replies,
        retweetCount: metrics.retweets,
        likeCount: metrics.likes,
        hasReplyBox,
        url,
        isThread,
        media,
        platform: 'twitter'
      }

    } catch (error) {
      console.error('Error extracting tweet from element:', error)
      return null
    }
  }

  private extractFullTweetText(element: HTMLElement): string {
    // Multiple strategies to get full tweet text
    const strategies = [
      // Strategy 1: Main tweet text container
      () => {
        const textElement = element.querySelector('[data-testid="tweetText"]')
        return textElement?.textContent?.trim() || ''
      },

      // Strategy 2: Language-tagged elements (Twitter uses these)
      () => {
        const langElements = element.querySelectorAll('[lang]')
        let fullText = ''
        langElements.forEach(el => {
          const text = el.textContent?.trim()
          if (text && text.length > fullText.length) {
            fullText = text
          }
        })
        return fullText
      },

      // Strategy 3: CSS class-based extraction
      () => {
        const selectors = [
          '.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0',
          '.css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0',
          '.css-901oao'
        ]

        for (const selector of selectors) {
          const elements = element.querySelectorAll(selector)
          for (const el of elements) {
            const text = el.textContent?.trim()
            if (text && text.length > 10) { // Reasonable tweet length
              return text
            }
          }
        }
        return ''
      }
    ]

    // Try each strategy until we get good content
    for (const strategy of strategies) {
      const text = strategy()
      if (text && text.length > 0) {
        return text
      }
    }

    return ''
  }

  private extractAuthorInfo(element: HTMLElement): { author: string; username: string } {
    let author = ''
    let username = ''

    // Extract display name
    const nameElement = element.querySelector('[data-testid="User-Name"] .css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0') ||
                       element.querySelector('[data-testid="User-Name"] span') ||
                       element.querySelector('.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0')

    if (nameElement) {
      author = nameElement.textContent?.trim() || ''
    }

    // Extract username (handle)
    const usernameElement = element.querySelector('[data-testid="User-Name"]')
    if (usernameElement) {
      const usernameText = usernameElement.textContent
      const match = usernameText?.match(/@(\w+)/)
      if (match) {
        username = match[1]
      }
    }

    // Fallback: try to find username in any text
    if (!username) {
      const allText = element.textContent || ''
      const match = allText.match(/@(\w+)/)
      if (match) {
        username = match[1]
      }
    }

    return { author: author || 'Unknown', username: username || 'unknown' }
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
