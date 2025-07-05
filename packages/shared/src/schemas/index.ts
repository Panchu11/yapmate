import { z } from 'zod'

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  plan: z.enum(['free', 'pro', 'team', 'enterprise']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
})

// Tweet schemas
export const TweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  username: z.string(),
  timestamp: z.string(),
  replyCount: z.number().int().min(0),
  retweetCount: z.number().int().min(0),
  likeCount: z.number().int().min(0),
  hasReplyBox: z.boolean(),
  url: z.string().url().optional(),
  threadId: z.string().optional(),
  parentTweetId: z.string().optional(),
})

// Reply schemas
export const GeneratedReplySchema = z.object({
  id: z.string(),
  tweetId: z.string(),
  content: z.string().max(280),
  tone: z.enum(['smart', 'funny', 'serious', 'degen', 'custom']),
  cryptoMode: z.boolean(),
  timestamp: z.date(),
})

export const GenerateReplyRequestSchema = z.object({
  tweetText: z.string().min(1),
  tone: z.enum(['smart', 'funny', 'serious', 'degen', 'custom']),
  cryptoMode: z.boolean().default(true),
  customPrompt: z.string().optional(),
})

export const RewriteReplyRequestSchema = z.object({
  originalReply: z.string().min(1),
  tone: z.enum(['smart', 'funny', 'serious', 'degen', 'custom']).optional(),
})

// Settings schemas
export const UserSettingsSchema = z.object({
  userId: z.string(),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  defaultTone: z.enum(['smart', 'funny', 'serious', 'degen', 'custom']).default('smart'),
  cryptoMode: z.boolean().default(true),
  autoGenerate: z.boolean().default(false),
  notifications: z.boolean().default(true),
  apiKeys: z.record(z.string(), z.string()),
  customTones: z.array(z.object({
    name: z.string(),
    description: z.string(),
    emoji: z.string(),
    systemPrompt: z.string(),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().min(1).max(1000),
  })).default([]),
})

export const UpdateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  defaultTone: z.enum(['smart', 'funny', 'serious', 'degen', 'custom']).optional(),
  cryptoMode: z.boolean().optional(),
  autoGenerate: z.boolean().optional(),
  notifications: z.boolean().optional(),
  apiKeys: z.record(z.string(), z.string()).optional(),
})

// API schemas
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
})

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: PaginationSchema,
  error: z.string().optional(),
  message: z.string().optional(),
})

// Analytics schemas
export const AnalyticsEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  event: z.string(),
  properties: z.record(z.string(), z.any()),
  timestamp: z.date(),
})

export const TrackEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.string(), z.any()).optional(),
})

// Chrome extension schemas
export const ExtensionMessageSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
  tabId: z.number().optional(),
})

export const ContentScriptMessageSchema = z.object({
  type: z.enum(['GET_TWEETS', 'FILL_REPLY_BOX', 'COPY_TO_CLIPBOARD', 'TWEETS_UPDATED']),
  payload: z.any().optional(),
  tabId: z.number().optional(),
})

export const BackgroundMessageSchema = z.object({
  type: z.enum(['OPEN_SIDEBAR', 'CLOSE_SIDEBAR', 'UPDATE_BADGE']),
  payload: z.any().optional(),
  tabId: z.number().optional(),
})

// Crypto project schemas
export const CryptoProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  handle: z.string().optional(),
  hashtags: z.array(z.string()),
  category: z.enum(['blockchain', 'defi', 'nft', 'infrastructure', 'exchange', 'other']),
  description: z.string().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().default(true),
})

// AI provider schemas
export const AIProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiUrl: z.string().url(),
  models: z.array(z.object({
    id: z.string(),
    name: z.string(),
    provider: z.string(),
    maxTokens: z.number().int().min(1),
    costPerToken: z.number().min(0),
    latency: z.number().min(0),
    strengths: z.array(z.string()),
  })),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
})

// Validation helpers
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success
}

export const validateTweetText = (text: string): boolean => {
  return z.string().min(1).max(280).safeParse(text).success
}

export const validateApiKey = (key: string, provider: string): boolean => {
  const patterns = {
    fireworks: /^fw_[a-zA-Z0-9]+$/,
    openai: /^sk-[a-zA-Z0-9]+$/,
    anthropic: /^sk-ant-[a-zA-Z0-9]+$/,
  }
  
  const pattern = patterns[provider as keyof typeof patterns]
  return pattern ? pattern.test(key) : key.length > 0
}

// Type exports
export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type Tweet = z.infer<typeof TweetSchema>
export type GeneratedReply = z.infer<typeof GeneratedReplySchema>
export type GenerateReplyRequest = z.infer<typeof GenerateReplyRequestSchema>
export type RewriteReplyRequest = z.infer<typeof RewriteReplyRequestSchema>
export type UserSettings = z.infer<typeof UserSettingsSchema>
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>
export type APIResponse = z.infer<typeof APIResponseSchema>
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>
export type TrackEvent = z.infer<typeof TrackEventSchema>
export type ExtensionMessage = z.infer<typeof ExtensionMessageSchema>
export type ContentScriptMessage = z.infer<typeof ContentScriptMessageSchema>
export type BackgroundMessage = z.infer<typeof BackgroundMessageSchema>
export type CryptoProject = z.infer<typeof CryptoProjectSchema>
export type AIProvider = z.infer<typeof AIProviderSchema>
