import { AIProvider, AIRequest, AIResponse, AIError, AIProviderConfig } from '../types'
import { withTimeout, retry, createLogger } from '@yapmate/shared'

export abstract class BaseAIProvider implements AIProvider {
  protected logger = createLogger(`AI:${this.id}`)
  protected config: AIProviderConfig
  protected metrics = {
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    totalLatency: 0,
    totalCost: 0,
    lastUsed: new Date(),
  }

  constructor(
    public readonly id: string,
    public readonly name: string,
    config: AIProviderConfig
  ) {
    this.config = config
  }

  abstract generateReply(request: AIRequest): Promise<AIResponse>
  abstract rewriteReply(originalReply: string, tone?: string): Promise<AIResponse>

  async isAvailable(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch (error) {
      this.logger.warn('Provider health check failed:', error)
      return false
    }
  }

  protected abstract healthCheck(): Promise<void>

  estimateCost(request: AIRequest): number {
    // Base implementation - override in specific providers
    const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.maxTokens || 150)
    return estimatedTokens * 0.00001 // $0.01 per 1K tokens as default
  }

  getLatency(): number {
    return this.metrics.requestCount > 0 
      ? this.metrics.totalLatency / this.metrics.requestCount 
      : 0
  }

  getMetrics() {
    return {
      provider: this.id,
      model: this.config.model,
      requestCount: this.metrics.requestCount,
      successCount: this.metrics.successCount,
      errorCount: this.metrics.errorCount,
      averageLatency: this.getLatency(),
      averageCost: this.metrics.requestCount > 0 
        ? this.metrics.totalCost / this.metrics.requestCount 
        : 0,
      lastUsed: this.metrics.lastUsed,
    }
  }

  protected async makeRequest<T>(
    requestFn: () => Promise<T>,
    requestInfo: { prompt: string; maxTokens?: number }
  ): Promise<T> {
    const startTime = Date.now()
    this.metrics.requestCount++
    this.metrics.lastUsed = new Date()

    try {
      const result = await withTimeout(
        retry(requestFn, this.config.retries),
        this.config.timeout,
        `${this.name} request timed out`
      )

      const latency = Date.now() - startTime
      this.metrics.totalLatency += latency
      this.metrics.successCount++
      this.metrics.totalCost += this.estimateCost({
        prompt: requestInfo.prompt,
        tone: 'smart',
        cryptoMode: true,
        maxTokens: requestInfo.maxTokens,
      })

      this.logger.debug(`Request completed in ${latency}ms`)
      return result

    } catch (error) {
      this.metrics.errorCount++
      const aiError = this.createAIError(error as Error)
      this.logger.error('Request failed:', aiError)
      throw aiError
    }
  }

  protected createAIError(error: Error): AIError {
    const aiError = new Error(error.message) as AIError
    aiError.name = 'AIError'
    aiError.provider = this.id
    aiError.code = this.getErrorCode(error)
    aiError.retryable = this.isRetryableError(error)
    aiError.originalError = error
    return aiError
  }

  protected getErrorCode(error: Error): string {
    if (error.message.includes('timeout')) return 'TIMEOUT'
    if (error.message.includes('rate limit')) return 'RATE_LIMIT'
    if (error.message.includes('unauthorized') || error.message.includes('401')) return 'UNAUTHORIZED'
    if (error.message.includes('quota')) return 'QUOTA_EXCEEDED'
    if (error.message.includes('network')) return 'NETWORK_ERROR'
    return 'UNKNOWN_ERROR'
  }

  protected isRetryableError(error: Error): boolean {
    const code = this.getErrorCode(error)
    return ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT'].includes(code)
  }

  protected validateApiKey(): void {
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      throw new Error(`API key not configured for ${this.name}`)
    }
  }

  protected sanitizeResponse(content: string): string {
    return content
      .replace(/^(Reply:|Response:)\s*/i, '')
      .replace(/^["']|["']$/g, '')
      .replace(/^@\w+\s+/, '')
      .trim()
  }

  updateConfig(config: Partial<AIProviderConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
