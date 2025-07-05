// Core application types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  createdAt: Date
  updatedAt: Date
}

export interface Tweet {
  id: string
  text: string
  author: string
  username: string
  timestamp: string
  replyCount: number
  retweetCount: number
  likeCount: number
  hasReplyBox: boolean
  url?: string
  threadId?: string
  parentTweetId?: string
}

export interface GeneratedReply {
  id: string
  tweetId: string
  content: string
  tone: ToneType
  cryptoMode: boolean
  timestamp: Date
  performance?: ReplyPerformance
}

export interface ReplyPerformance {
  likes: number
  replies: number
  retweets: number
  engagementRate: number
  viralScore: number
}

export type ToneType = 'smart' | 'funny' | 'serious' | 'degen' | 'custom'

export interface ToneConfig {
  name: string
  description: string
  emoji: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export interface CryptoProject {
  id: string
  name: string
  symbol: string
  handle?: string
  hashtags: string[]
  category: 'blockchain' | 'defi' | 'nft' | 'infrastructure' | 'exchange' | 'other'
  description?: string
  website?: string
  isActive: boolean
}

export interface AIProvider {
  id: string
  name: string
  apiUrl: string
  models: AIModel[]
  isActive: boolean
  priority: number
}

export interface AIModel {
  id: string
  name: string
  provider: string
  maxTokens: number
  costPerToken: number
  latency: number
  strengths: string[]
}

export interface AnalyticsEvent {
  id: string
  userId: string
  event: string
  properties: Record<string, any>
  timestamp: Date
}

export interface UserSettings {
  userId: string
  theme: 'light' | 'dark' | 'auto'
  defaultTone: ToneType
  cryptoMode: boolean
  autoGenerate: boolean
  notifications: boolean
  apiKeys: Record<string, string>
  customTones: ToneConfig[]
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Chrome Extension specific types
export interface ExtensionMessage {
  type: string
  payload?: any
  tabId?: number
}

export interface ContentScriptMessage extends ExtensionMessage {
  type: 'GET_TWEETS' | 'FILL_REPLY_BOX' | 'COPY_TO_CLIPBOARD' | 'TWEETS_UPDATED'
}

export interface BackgroundMessage extends ExtensionMessage {
  type: 'OPEN_SIDEBAR' | 'CLOSE_SIDEBAR' | 'UPDATE_BADGE'
}

// UI Component types
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
}

// Error types
export class YapMateError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'YapMateError'
  }
}

export class AIProviderError extends YapMateError {
  constructor(message: string, public provider: string) {
    super(message, 'AI_PROVIDER_ERROR', 503)
    this.name = 'AIProviderError'
  }
}

export class ValidationError extends YapMateError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends YapMateError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends YapMateError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429)
    this.name = 'RateLimitError'
  }
}
