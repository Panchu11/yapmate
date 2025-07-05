// AI-specific types
export interface AIRequest {
  prompt: string
  tone: string
  cryptoMode: boolean
  maxTokens?: number
  temperature?: number
  context?: AIContext
}

export interface AIResponse {
  content: string
  provider: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  latency: number
  confidence: number
}

export interface AIContext {
  tweetText: string
  author: string
  username: string
  threadContext?: string[]
  userHistory?: string[]
  cryptoProjects?: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  engagement?: {
    likes: number
    retweets: number
    replies: number
  }
}

export interface AIProvider {
  id: string
  name: string
  isAvailable: () => Promise<boolean>
  generateReply: (request: AIRequest) => Promise<AIResponse>
  rewriteReply: (originalReply: string, tone?: string) => Promise<AIResponse>
  estimateCost: (request: AIRequest) => number
  getLatency: () => number
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  tone: string
  cryptoMode: boolean
}

export interface ToneConfig {
  name: string
  description: string
  emoji: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  examples: string[]
}

export interface CryptoProjectMeta {
  name: string
  symbol: string
  handle?: string
  hashtags: string[]
  category: string
  confidence: number
}

export interface AIError extends Error {
  provider: string
  code: string
  retryable: boolean
  originalError?: Error
}

export interface AIMetrics {
  provider: string
  model: string
  requestCount: number
  successCount: number
  errorCount: number
  averageLatency: number
  averageCost: number
  lastUsed: Date
}

export interface AIProviderConfig {
  apiKey: string
  apiUrl: string
  model: string
  timeout: number
  retries: number
  rateLimit: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
}

export interface AIOrchestrator {
  generateReply: (request: AIRequest) => Promise<AIResponse>
  rewriteReply: (originalReply: string, tone?: string) => Promise<AIResponse>
  selectProvider: (request: AIRequest) => Promise<AIProvider>
  getMetrics: () => AIMetrics[]
  healthCheck: () => Promise<Record<string, boolean>>
}

export type AIProviderType = 'fireworks' | 'openai' | 'anthropic' | 'local'

export interface ModelCapabilities {
  maxTokens: number
  supportsStreaming: boolean
  supportsFunctionCalling: boolean
  supportsVision: boolean
  languages: string[]
  specialties: string[]
}

export interface AIUsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  averageLatency: number
  successRate: number
  topProviders: Array<{
    provider: string
    usage: number
    percentage: number
  }>
  dailyUsage: Array<{
    date: string
    requests: number
    tokens: number
    cost: number
  }>
}
