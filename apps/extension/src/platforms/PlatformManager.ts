// Multi-platform support system
export interface PlatformConfig {
  name: string
  domains: string[]
  characterLimit: number
  supportsThreads: boolean
  supportsHashtags: boolean
  supportsMentions: boolean
  supportsEmojis: boolean
  selectors: {
    post: string[]
    postText: string[]
    replyButton: string[]
    replyBox: string[]
    author: string[]
    username: string[]
    timestamp: string[]
    engagement: {
      likes: string[]
      shares: string[]
      comments: string[]
    }
  }
  features: {
    cryptoFriendly: boolean
    professionalTone: boolean
    casualTone: boolean
    emojiUsage: 'high' | 'medium' | 'low'
    hashtagStrategy: 'trending' | 'niche' | 'branded' | 'minimal'
  }
}

export interface Post {
  id: string
  text: string
  author: string
  username: string
  timestamp: string
  platform: string
  engagement: {
    likes: number
    shares: number
    comments: number
  }
  hasReplyBox: boolean
  url?: string
  threadId?: string
  parentPostId?: string
}

export class PlatformManager {
  private platforms: Map<string, PlatformConfig> = new Map()
  private currentPlatform: string | null = null

  constructor() {
    this.initializePlatforms()
    this.detectCurrentPlatform()
  }

  private initializePlatforms() {
    // Twitter/X Configuration
    this.platforms.set('twitter', {
      name: 'Twitter/X',
      domains: ['twitter.com', 'x.com'],
      characterLimit: 280,
      supportsThreads: true,
      supportsHashtags: true,
      supportsMentions: true,
      supportsEmojis: true,
      selectors: {
        post: ['article[data-testid="tweet"]', '[data-testid="tweet"]'],
        postText: ['[data-testid="tweetText"]', '.tweet-text'],
        replyButton: ['[data-testid="reply"]', '[aria-label*="Reply"]'],
        replyBox: ['[data-testid="tweetTextarea_0"]', 'div[contenteditable="true"][role="textbox"]'],
        author: ['[data-testid="User-Name"]', '.tweet-author'],
        username: ['[data-testid="User-Name"] + div', '.tweet-username'],
        timestamp: ['time', '[datetime]'],
        engagement: {
          likes: ['[data-testid="like"]', '[data-testid="unlike"]'],
          shares: ['[data-testid="retweet"]', '[data-testid="unretweet"]'],
          comments: ['[data-testid="reply"]']
        }
      },
      features: {
        cryptoFriendly: true,
        professionalTone: true,
        casualTone: true,
        emojiUsage: 'high',
        hashtagStrategy: 'trending'
      }
    })

    // LinkedIn Configuration
    this.platforms.set('linkedin', {
      name: 'LinkedIn',
      domains: ['linkedin.com'],
      characterLimit: 3000,
      supportsThreads: false,
      supportsHashtags: true,
      supportsMentions: true,
      supportsEmojis: true,
      selectors: {
        post: ['.feed-shared-update-v2', '.occludable-update'],
        postText: ['.feed-shared-text', '.break-words'],
        replyButton: ['.comment-button', '[aria-label*="Comment"]'],
        replyBox: ['.ql-editor', '.comments-comment-texteditor'],
        author: ['.feed-shared-actor__name', '.update-components-actor__name'],
        username: ['.feed-shared-actor__description', '.update-components-actor__description'],
        timestamp: ['.feed-shared-actor__sub-description time', '.update-components-actor__sub-description time'],
        engagement: {
          likes: ['.reactions-react-button', '.like-button'],
          shares: ['.share-button', '.reshare-button'],
          comments: ['.comment-button']
        }
      },
      features: {
        cryptoFriendly: false,
        professionalTone: true,
        casualTone: false,
        emojiUsage: 'low',
        hashtagStrategy: 'niche'
      }
    })

    // Discord Configuration (for web version)
    this.platforms.set('discord', {
      name: 'Discord',
      domains: ['discord.com'],
      characterLimit: 2000,
      supportsThreads: true,
      supportsHashtags: false,
      supportsMentions: true,
      supportsEmojis: true,
      selectors: {
        post: ['[id^="message-"]', '.message-2qnXI6'],
        postText: ['.markup-2BOw-j', '.messageContent-2qWWxC'],
        replyButton: ['.replyButton-1YqGoA', '[aria-label*="Reply"]'],
        replyBox: ['[role="textbox"]', '.textArea-12jD-V'],
        author: ['.username-1A8OIy', '.headerText-3Uvj1Y'],
        username: ['.username-1A8OIy', '.headerText-3Uvj1Y'],
        timestamp: ['.timestamp-3ZCmNB', '.timestampInline-_lS3aK'],
        engagement: {
          likes: ['.reaction-1hd86g', '.reactionBtn-2na4DOl'],
          shares: [],
          comments: ['.replyButton-1YqGoA']
        }
      },
      features: {
        cryptoFriendly: true,
        professionalTone: false,
        casualTone: true,
        emojiUsage: 'high',
        hashtagStrategy: 'minimal'
      }
    })

    // Telegram Web Configuration
    this.platforms.set('telegram', {
      name: 'Telegram',
      domains: ['web.telegram.org'],
      characterLimit: 4096,
      supportsThreads: false,
      supportsHashtags: true,
      supportsMentions: true,
      supportsEmojis: true,
      selectors: {
        post: ['.message', '.Message'],
        postText: ['.text-content', '.message-text'],
        replyButton: ['.reply-button', '[title*="Reply"]'],
        replyBox: ['#editable-message-text', '.input-message-input'],
        author: ['.peer-title', '.message-author'],
        username: ['.peer-title', '.message-author'],
        timestamp: ['.message-time', '.time'],
        engagement: {
          likes: ['.reaction', '.reactions'],
          shares: ['.forward-button'],
          comments: ['.reply-button']
        }
      },
      features: {
        cryptoFriendly: true,
        professionalTone: false,
        casualTone: true,
        emojiUsage: 'high',
        hashtagStrategy: 'niche'
      }
    })
  }

  private detectCurrentPlatform(): void {
    const hostname = window.location.hostname
    
    for (const [platformId, config] of this.platforms) {
      if (config.domains.some(domain => hostname.includes(domain))) {
        this.currentPlatform = platformId
        break
      }
    }
  }

  getCurrentPlatform(): PlatformConfig | null {
    if (!this.currentPlatform) return null
    return this.platforms.get(this.currentPlatform) || null
  }

  getCurrentPlatformId(): string | null {
    return this.currentPlatform
  }

  isSupported(): boolean {
    return this.currentPlatform !== null
  }

  isCryptoFriendly(): boolean {
    const platform = this.getCurrentPlatform()
    return platform?.features.cryptoFriendly || false
  }

  getCharacterLimit(): number {
    const platform = this.getCurrentPlatform()
    return platform?.characterLimit || 280
  }

  getRecommendedTone(): 'professional' | 'casual' {
    const platform = this.getCurrentPlatform()
    if (!platform) return 'casual'
    
    if (platform.features.professionalTone && !platform.features.casualTone) {
      return 'professional'
    }
    return 'casual'
  }

  getEmojiUsage(): 'high' | 'medium' | 'low' {
    const platform = this.getCurrentPlatform()
    return platform?.features.emojiUsage || 'medium'
  }

  getHashtagStrategy(): 'trending' | 'niche' | 'branded' | 'minimal' {
    const platform = this.getCurrentPlatform()
    return platform?.features.hashtagStrategy || 'niche'
  }

  // Extract posts from current platform
  async extractPosts(): Promise<Post[]> {
    const platform = this.getCurrentPlatform()
    if (!platform) return []

    try {
      const posts: Post[] = []
      const postElements = this.findElements(platform.selectors.post)

      for (const element of postElements.slice(0, 10)) {
        try {
          const post = await this.extractPostFromElement(element, platform)
          if (post) {
            posts.push(post)
          }
        } catch (error) {
          console.warn('Error extracting post:', error)
        }
      }

      return posts
    } catch (error) {
      console.error('Error extracting posts:', error)
      return []
    }
  }

  private async extractPostFromElement(element: Element, platform: PlatformConfig): Promise<Post | null> {
    try {
      // Extract text
      const textElement = this.findElementInParent(element, platform.selectors.postText)
      const text = textElement?.textContent?.trim() || ''
      if (!text) return null

      // Extract author
      const authorElement = this.findElementInParent(element, platform.selectors.author)
      const author = authorElement?.textContent?.trim() || 'Unknown'

      // Extract username
      const usernameElement = this.findElementInParent(element, platform.selectors.username)
      let username = usernameElement?.textContent?.trim() || 'unknown'
      if (username.startsWith('@')) {
        username = username.substring(1)
      }

      // Extract timestamp
      const timestampElement = this.findElementInParent(element, platform.selectors.timestamp)
      const timestamp = timestampElement?.getAttribute('datetime') || 
                       timestampElement?.textContent || 
                       new Date().toISOString()

      // Extract engagement metrics
      const engagement = this.extractEngagement(element, platform)

      // Check for reply box
      const hasReplyBox = this.findElementInParent(element, platform.selectors.replyButton) !== null

      // Generate ID
      const id = this.generatePostId(text, author, timestamp)

      return {
        id,
        text,
        author,
        username,
        timestamp,
        platform: this.currentPlatform!,
        engagement,
        hasReplyBox,
        url: window.location.href
      }
    } catch (error) {
      console.error('Error extracting post from element:', error)
      return null
    }
  }

  private findElements(selectors: string[]): Element[] {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        return Array.from(elements)
      }
    }
    return []
  }

  private findElementInParent(parent: Element, selectors: string[]): Element | null {
    for (const selector of selectors) {
      const element = parent.querySelector(selector)
      if (element) return element
    }
    return null
  }

  private extractEngagement(element: Element, platform: PlatformConfig): { likes: number; shares: number; comments: number } {
    const engagement = { likes: 0, shares: 0, comments: 0 }

    try {
      // Extract likes
      const likeElement = this.findElementInParent(element, platform.selectors.engagement.likes)
      if (likeElement) {
        const likeText = likeElement.textContent?.trim() || '0'
        engagement.likes = this.parseEngagementNumber(likeText)
      }

      // Extract shares
      const shareElement = this.findElementInParent(element, platform.selectors.engagement.shares)
      if (shareElement) {
        const shareText = shareElement.textContent?.trim() || '0'
        engagement.shares = this.parseEngagementNumber(shareText)
      }

      // Extract comments
      const commentElement = this.findElementInParent(element, platform.selectors.engagement.comments)
      if (commentElement) {
        const commentText = commentElement.textContent?.trim() || '0'
        engagement.comments = this.parseEngagementNumber(commentText)
      }
    } catch (error) {
      console.warn('Error extracting engagement:', error)
    }

    return engagement
  }

  private parseEngagementNumber(text: string): number {
    if (!text || text === '') return 0

    const cleanText = text.toLowerCase().replace(/[,\s]/g, '')
    
    if (cleanText.includes('k')) {
      return Math.floor(parseFloat(cleanText) * 1000)
    } else if (cleanText.includes('m')) {
      return Math.floor(parseFloat(cleanText) * 1000000)
    } else {
      return parseInt(cleanText) || 0
    }
  }

  private generatePostId(text: string, author: string, timestamp: string): string {
    const combined = `${text}-${author}-${timestamp}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  // Fill reply box on current platform
  async fillReplyBox(postId: string, replyText: string): Promise<boolean> {
    const platform = this.getCurrentPlatform()
    if (!platform) return false

    try {
      // Find reply box
      const replyBox = this.findElements(platform.selectors.replyBox)[0]
      if (!replyBox) {
        // Try to open reply box first
        const replyButton = this.findElements(platform.selectors.replyButton)[0]
        if (replyButton) {
          (replyButton as HTMLElement).click()
          await this.sleep(500)
          
          const newReplyBox = this.findElements(platform.selectors.replyBox)[0]
          if (newReplyBox) {
            return this.fillTextElement(newReplyBox as HTMLElement, replyText)
          }
        }
        return false
      }

      return this.fillTextElement(replyBox as HTMLElement, replyText)
    } catch (error) {
      console.error('Error filling reply box:', error)
      return false
    }
  }

  private fillTextElement(element: HTMLElement, text: string): boolean {
    try {
      element.focus()

      if (element.contentEditable === 'true') {
        element.textContent = text
      } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        (element as HTMLInputElement | HTMLTextAreaElement).value = text
      }

      // Trigger events
      const events = ['input', 'change', 'keyup']
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true })
        element.dispatchEvent(event)
      })

      return true
    } catch (error) {
      console.error('Error filling text element:', error)
      return false
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Global instance
export const platformManager = new PlatformManager()
