import { BaseAIProvider } from './base'
import { AIRequest, AIResponse, AIProviderConfig } from '../types'

export class FireworksProvider extends BaseAIProvider {
  constructor(config: AIProviderConfig) {
    super('fireworks', 'Fireworks AI', config)
  }

  async generateReply(request: AIRequest): Promise<AIResponse> {
    this.validateApiKey()

    const prompt = this.buildPrompt(request)
    
    return this.makeRequest(async () => {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.tone, request.cryptoMode),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: request.maxTokens || 150,
          temperature: request.temperature || 0.9,
          top_p: 0.95,
        }),
      })

      if (!response.ok) {
        throw new Error(`Fireworks API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format')
      }

      const content = this.sanitizeResponse(data.choices[0].message.content)
      
      return {
        content,
        provider: this.id,
        model: this.config.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        latency: 0, // Will be calculated by base class
        confidence: this.calculateConfidence(content, request),
      }
    }, { prompt, maxTokens: request.maxTokens })
  }

  async rewriteReply(originalReply: string, tone?: string): Promise<AIResponse> {
    this.validateApiKey()

    const prompt = this.buildRewritePrompt(originalReply, tone)
    
    return this.makeRequest(async () => {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at rewriting social media replies while maintaining their meaning and tone.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.8,
          top_p: 0.95,
        }),
      })

      if (!response.ok) {
        throw new Error(`Fireworks API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = this.sanitizeResponse(data.choices[0].message.content)
      
      return {
        content,
        provider: this.id,
        model: this.config.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        latency: 0,
        confidence: 0.9, // High confidence for rewrites
      }
    }, { prompt })
  }

  protected async healthCheck(): Promise<void> {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }
  }

  estimateCost(request: AIRequest): number {
    // Fireworks pricing: ~$0.0002 per 1K tokens
    const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.maxTokens || 150)
    return (estimatedTokens / 1000) * 0.0002
  }

  private buildPrompt(request: AIRequest): string {
    const { cryptoMode, tone } = request
    const context = request.context

    let prompt = `Tweet: "${context?.tweetText || request.prompt}"\n\n`
    
    if (context?.author) {
      prompt += `Author: @${context.username} (${context.author})\n`
    }

    if (context?.threadContext && context.threadContext.length > 0) {
      prompt += `Thread context: ${context.threadContext.join(' → ')}\n`
    }

    if (context?.sentiment) {
      prompt += `Sentiment: ${context.sentiment}\n`
    }

    prompt += `\nInstructions:\n`
    prompt += `- ${this.getToneInstruction(tone)}\n`
    prompt += `- Max 280 characters, natural, conversational tone\n`
    prompt += `- Write like a real ${cryptoMode ? 'crypto Twitter' : 'social media'} user, not a bot\n`
    prompt += `- Be engaging and add ${cryptoMode ? 'crypto perspective' : 'value'} to the conversation\n`

    if (cryptoMode) {
      prompt += `- CRITICAL: Analyze the tweet content and identify:\n`
      prompt += `  * Specific crypto projects mentioned\n`
      prompt += `  * Relevant ticker symbols ($BTC, $ETH, etc.)\n`
      prompt += `  * Appropriate crypto hashtags\n`
      prompt += `- ALWAYS include relevant mentions, tickers, and hashtags based on what's discussed\n`
      prompt += `- Connect the tweet topic to crypto/Web3 perspective naturally\n`
    }

    prompt += `- NO quotes around the reply, write it as a direct tweet\n`
    prompt += `- Sound like genuine ${cryptoMode ? 'crypto Twitter' : 'social media'} engagement\n\n`
    prompt += `Reply:`

    return prompt
  }

  private buildRewritePrompt(originalReply: string, tone?: string): string {
    return `Original reply: "${originalReply}"

Instructions:
- Rephrase this reply differently while keeping the same meaning
- Keep all hashtags, handles (@), and ticker symbols ($) exactly the same
- Maintain the ${tone ? `${tone} tone` : 'same tone and style'}
- Max 280 characters
- Make it sound fresh and natural

Rewritten reply:`
  }

  private getSystemPrompt(tone: string, cryptoMode: boolean): string {
    const basePrompt = 'You are a crypto Twitter expert who writes authentic, engaging replies.'
    
    if (cryptoMode) {
      return `${basePrompt} Analyze tweet content and identify specific crypto projects, people, or topics mentioned. Generate natural responses that include relevant handles (@), tickers ($), and hashtags (#) based on what you detect in the tweet. Write like a real person tweeting - casual, direct, and conversational.`
    }
    
    return `${basePrompt} Generate natural, engaging social media replies that add value to conversations. Write like a real person - casual, direct, and conversational.`
  }

  private getToneInstruction(tone: string): string {
    const instructions = {
      smart: 'Write an analytical and insightful reply that shows deep understanding',
      funny: 'Write a witty and entertaining reply with appropriate humor',
      serious: 'Write a professional and direct reply that adds value to the conversation',
      degen: 'Write a bold and energetic reply with appropriate enthusiasm',
    }

    return instructions[tone as keyof typeof instructions] || instructions.smart
  }

  private calculateConfidence(content: string, request: AIRequest): number {
    let confidence = 0.8 // Base confidence

    // Increase confidence for crypto mode if crypto terms are detected
    if (request.cryptoMode) {
      const hasCryptoTerms = /(\$[A-Z]{1,10}|#[A-Za-z]+|@[A-Za-z0-9_]+)/.test(content)
      confidence += hasCryptoTerms ? 0.1 : -0.1
    }

    // Adjust based on length (not too short, not too long)
    if (content.length > 50 && content.length < 250) {
      confidence += 0.05
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence))
  }
}
