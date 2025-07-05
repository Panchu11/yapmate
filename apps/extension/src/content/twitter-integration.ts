// Twitter/X integration utilities
export class TwitterIntegration {
  private isInitialized = false

  async init(): Promise<void> {
    this.isInitialized = true
  }

  async fillReplyBox(tweetId: string, replyText: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('TwitterIntegration not initialized')
    }

    try {
      // Find the reply box for the specific tweet
      const replyBox = this.findReplyBox(tweetId)
      
      if (!replyBox) {
        // Try to open reply box first
        const opened = await this.openReplyBox(tweetId)
        if (!opened) {
          console.warn('Could not find or open reply box for tweet:', tweetId)
          return false
        }
        
        // Wait a bit for the reply box to appear
        await this.sleep(500)
        
        // Try to find reply box again
        const newReplyBox = this.findReplyBox(tweetId)
        if (!newReplyBox) {
          return false
        }
        
        return this.fillTextArea(newReplyBox, replyText)
      }

      return this.fillTextArea(replyBox, replyText)

    } catch (error) {
      console.error('Error filling reply box:', error)
      return false
    }
  }

  private findReplyBox(tweetId?: string): HTMLElement | null {
    // Common selectors for Twitter reply boxes
    const selectors = [
      '[data-testid="tweetTextarea_0"]',
      '[data-testid="tweetTextarea"]',
      'div[contenteditable="true"][data-testid*="tweet"]',
      'div[contenteditable="true"][role="textbox"]',
      '.public-DraftEditor-content',
      '.tweet-compose-text'
    ]

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector)
      
      for (const element of Array.from(elements)) {
        const htmlElement = element as HTMLElement
        
        // Check if this is a visible reply box
        if (this.isElementVisible(htmlElement)) {
          return htmlElement
        }
      }
    }

    return null
  }

  private async openReplyBox(tweetId: string): Promise<boolean> {
    try {
      // Find the reply button for the specific tweet
      const replyButton = this.findReplyButton(tweetId)
      
      if (!replyButton) {
        console.warn('Could not find reply button for tweet:', tweetId)
        return false
      }

      // Click the reply button
      replyButton.click()
      
      // Wait for the reply box to appear
      await this.sleep(1000)
      
      return true

    } catch (error) {
      console.error('Error opening reply box:', error)
      return false
    }
  }

  private findReplyButton(tweetId?: string): HTMLElement | null {
    // Common selectors for reply buttons
    const selectors = [
      '[data-testid="reply"]',
      '[aria-label*="Reply"]',
      '.tweet-reply-button',
      'button[data-testid="reply"]'
    ]

    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector)
      
      for (const button of Array.from(buttons)) {
        const htmlButton = button as HTMLElement
        
        if (this.isElementVisible(htmlButton)) {
          return htmlButton
        }
      }
    }

    return null
  }

  private fillTextArea(element: HTMLElement, text: string): boolean {
    try {
      // Method 1: Direct content setting for contenteditable
      if (element.contentEditable === 'true') {
        element.focus()
        element.textContent = text
        
        // Trigger input events
        this.triggerInputEvents(element)
        return true
      }

      // Method 2: For textarea elements
      if (element.tagName === 'TEXTAREA') {
        const textarea = element as HTMLTextAreaElement
        textarea.focus()
        textarea.value = text
        
        this.triggerInputEvents(textarea)
        return true
      }

      // Method 3: For input elements
      if (element.tagName === 'INPUT') {
        const input = element as HTMLInputElement
        input.focus()
        input.value = text
        
        this.triggerInputEvents(input)
        return true
      }

      // Method 4: Try to find nested input/textarea
      const nestedInput = element.querySelector('textarea, input[type="text"]') as HTMLInputElement | HTMLTextAreaElement
      if (nestedInput) {
        nestedInput.focus()
        nestedInput.value = text
        
        this.triggerInputEvents(nestedInput)
        return true
      }

      console.warn('Could not determine how to fill element:', element)
      return false

    } catch (error) {
      console.error('Error filling text area:', error)
      return false
    }
  }

  private triggerInputEvents(element: HTMLElement): void {
    // Trigger various events to ensure the UI updates
    const events = ['input', 'change', 'keyup', 'keydown']
    
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true, cancelable: true })
      element.dispatchEvent(event)
    })

    // Also trigger a keyboard event for good measure
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(keyboardEvent)
  }

  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    )
  }

  async scrollToTweet(tweetId: string): Promise<boolean> {
    try {
      // Find the tweet element
      const tweetElement = document.querySelector(`[data-tweet-id="${tweetId}"]`) ||
                          document.querySelector(`#tweet-${tweetId}`)

      if (!tweetElement) {
        console.warn('Could not find tweet element:', tweetId)
        return false
      }

      // Scroll to the tweet
      tweetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })

      return true

    } catch (error) {
      console.error('Error scrolling to tweet:', error)
      return false
    }
  }

  async highlightTweet(tweetId: string, duration: number = 2000): Promise<boolean> {
    try {
      const tweetElement = document.querySelector(`[data-tweet-id="${tweetId}"]`) ||
                          document.querySelector(`#tweet-${tweetId}`)

      if (!tweetElement) {
        return false
      }

      const htmlElement = tweetElement as HTMLElement

      // Add highlight class
      htmlElement.style.transition = 'background-color 0.3s ease'
      htmlElement.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'
      htmlElement.style.border = '2px solid rgba(99, 102, 241, 0.3)'
      htmlElement.style.borderRadius = '8px'

      // Remove highlight after duration
      setTimeout(() => {
        htmlElement.style.backgroundColor = ''
        htmlElement.style.border = ''
        htmlElement.style.borderRadius = ''
      }, duration)

      return true

    } catch (error) {
      console.error('Error highlighting tweet:', error)
      return false
    }
  }

  async getPageInfo(): Promise<{ url: string; title: string; isTwitter: boolean }> {
    return {
      url: window.location.href,
      title: document.title,
      isTwitter: window.location.hostname === 'x.com' || window.location.hostname === 'twitter.com'
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  destroy(): void {
    this.isInitialized = false
  }
}
