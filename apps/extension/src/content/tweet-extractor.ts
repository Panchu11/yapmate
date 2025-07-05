// Tweet extraction utility for Twitter/X
export class TweetExtractor {
  private isInitialized = false

  async init(): Promise<void> {
    this.isInitialized = true
  }

  async extractTweets(): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('TweetExtractor not initialized')
    }

    try {
      // Twitter/X selectors (these may change over time)
      const tweetSelectors = [
        'article[data-testid="tweet"]',
        '[data-testid="tweet"]',
        'article[role="article"]'
      ]

      let tweetElements: NodeListOf<Element> | null = null

      // Try different selectors
      for (const selector of tweetSelectors) {
        tweetElements = document.querySelectorAll(selector)
        if (tweetElements.length > 0) break
      }

      if (!tweetElements || tweetElements.length === 0) {
        console.log('No tweets found on page')
        return []
      }

      const tweets = []
      const processedIds = new Set<string>()

      for (const element of Array.from(tweetElements)) {
        try {
          const tweet = this.extractTweetFromElement(element as HTMLElement)
          
          if (tweet && !processedIds.has(tweet.id)) {
            tweets.push(tweet)
            processedIds.add(tweet.id)
          }
        } catch (error) {
          console.warn('Error extracting tweet:', error)
        }
      }

      console.log(`Extracted ${tweets.length} tweets`)
      return tweets.slice(0, 10) // Limit to 10 tweets for performance

    } catch (error) {
      console.error('Error in extractTweets:', error)
      return []
    }
  }

  private extractTweetFromElement(element: HTMLElement): any | null {
    try {
      // Extract tweet text
      const textSelectors = [
        '[data-testid="tweetText"]',
        '[lang]',
        '.tweet-text',
        '.css-901oao'
      ]

      let tweetText = ''
      for (const selector of textSelectors) {
        const textElement = element.querySelector(selector)
        if (textElement) {
          tweetText = textElement.textContent?.trim() || ''
          if (tweetText) break
        }
      }

      if (!tweetText) {
        return null
      }

      // Extract author information
      const authorSelectors = [
        '[data-testid="User-Name"]',
        '.css-1dbjc4n .css-901oao .css-16my406',
        '.tweet-author'
      ]

      let author = 'Unknown'
      let username = 'unknown'

      for (const selector of authorSelectors) {
        const authorElement = element.querySelector(selector)
        if (authorElement) {
          const authorText = authorElement.textContent?.trim()
          if (authorText) {
            author = authorText
            break
          }
        }
      }

      // Extract username (handle)
      const usernameSelectors = [
        '[data-testid="User-Name"] + div',
        '.css-901oao .css-16my406 .css-901oao',
        '.tweet-username'
      ]

      for (const selector of usernameSelectors) {
        const usernameElement = element.querySelector(selector)
        if (usernameElement) {
          const usernameText = usernameElement.textContent?.trim()
          if (usernameText && usernameText.startsWith('@')) {
            username = usernameText.substring(1)
            break
          }
        }
      }

      // Extract timestamp
      const timeSelectors = [
        'time',
        '[datetime]',
        '.tweet-timestamp'
      ]

      let timestamp = new Date().toISOString()
      for (const selector of timeSelectors) {
        const timeElement = element.querySelector(selector)
        if (timeElement) {
          const datetime = timeElement.getAttribute('datetime') || timeElement.textContent
          if (datetime) {
            timestamp = new Date(datetime).toISOString()
            break
          }
        }
      }

      // Extract engagement metrics
      const metrics = this.extractEngagementMetrics(element)

      // Generate unique ID
      const id = this.generateTweetId(tweetText, author, timestamp)

      // Check for reply box
      const hasReplyBox = this.hasReplyBox(element)

      // Extract URL if available
      const url = this.extractTweetUrl(element)

      return {
        id,
        text: tweetText,
        author,
        username,
        timestamp,
        replyCount: metrics.replies,
        retweetCount: metrics.retweets,
        likeCount: metrics.likes,
        hasReplyBox,
        url
      }

    } catch (error) {
      console.error('Error extracting tweet from element:', error)
      return null
    }
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
