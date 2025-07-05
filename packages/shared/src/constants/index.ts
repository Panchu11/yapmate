// Application constants
export const APP_NAME = 'YapMate 2.0'
export const APP_VERSION = '2.0.0'
export const APP_DESCRIPTION = 'Revolutionary AI-powered social media engagement platform'

// API endpoints
export const API_ENDPOINTS = {
  FIREWORKS: 'https://api.fireworks.ai/inference/v1/chat/completions',
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  ANTHROPIC: 'https://api.anthropic.com/v1/messages',
} as const

// Default AI models
export const DEFAULT_AI_MODELS = {
  FIREWORKS: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
  OPENAI: 'gpt-4-turbo-preview',
  ANTHROPIC: 'claude-3-sonnet-20240229',
} as const

// Tone configurations
export const DEFAULT_TONES = {
  smart: {
    name: 'Smart',
    description: 'Analytical and insightful responses',
    emoji: '🧠',
    temperature: 0.7,
    maxTokens: 150,
  },
  funny: {
    name: 'Funny',
    description: 'Witty and entertaining responses',
    emoji: '😂',
    temperature: 0.9,
    maxTokens: 150,
  },
  serious: {
    name: 'Serious',
    description: 'Professional and direct responses',
    emoji: '💼',
    temperature: 0.5,
    maxTokens: 150,
  },
  degen: {
    name: 'Degen',
    description: 'Bold and energetic crypto responses',
    emoji: '🚀',
    temperature: 0.95,
    maxTokens: 150,
  },
} as const

// Crypto projects database
export const CRYPTO_PROJECTS = {
  'bitcoin': {
    name: 'Bitcoin',
    symbol: 'BTC',
    handle: 'bitcoin',
    hashtags: ['#Bitcoin', '#BTC', '#HODL'],
    category: 'blockchain' as const,
  },
  'ethereum': {
    name: 'Ethereum',
    symbol: 'ETH',
    handle: 'ethereum',
    hashtags: ['#Ethereum', '#ETH', '#DeFi'],
    category: 'blockchain' as const,
  },
  'solana': {
    name: 'Solana',
    symbol: 'SOL',
    handle: 'solana',
    hashtags: ['#Solana', '#SOL', '#SolanaEcosystem'],
    category: 'blockchain' as const,
  },
  'base': {
    name: 'Base',
    symbol: 'BASE',
    handle: 'base',
    hashtags: ['#Base', '#BaseChain', '#Coinbase'],
    category: 'blockchain' as const,
  },
  'arbitrum': {
    name: 'Arbitrum',
    symbol: 'ARB',
    handle: 'arbitrum',
    hashtags: ['#Arbitrum', '#ARB', '#Layer2'],
    category: 'blockchain' as const,
  },
  'polygon': {
    name: 'Polygon',
    symbol: 'MATIC',
    handle: 'polygon',
    hashtags: ['#Polygon', '#MATIC', '#PolygonEcosystem'],
    category: 'blockchain' as const,
  },
  'optimism': {
    name: 'Optimism',
    symbol: 'OP',
    handle: 'optimism',
    hashtags: ['#Optimism', '#OP', '#Layer2'],
    category: 'blockchain' as const,
  },
  'avalanche': {
    name: 'Avalanche',
    symbol: 'AVAX',
    handle: 'avalancheavax',
    hashtags: ['#Avalanche', '#AVAX'],
    category: 'blockchain' as const,
  },
  'chainlink': {
    name: 'Chainlink',
    symbol: 'LINK',
    handle: 'chainlink',
    hashtags: ['#Chainlink', '#LINK', '#Oracle'],
    category: 'infrastructure' as const,
  },
  'uniswap': {
    name: 'Uniswap',
    symbol: 'UNI',
    handle: 'Uniswap',
    hashtags: ['#Uniswap', '#UNI', '#DeFi'],
    category: 'defi' as const,
  },
  'aave': {
    name: 'Aave',
    symbol: 'AAVE',
    handle: 'AaveAave',
    hashtags: ['#Aave', '#AAVE', '#DeFi'],
    category: 'defi' as const,
  },
  'compound': {
    name: 'Compound',
    symbol: 'COMP',
    handle: 'compoundfinance',
    hashtags: ['#Compound', '#COMP', '#DeFi'],
    category: 'defi' as const,
  },
  'opensea': {
    name: 'OpenSea',
    symbol: '',
    handle: 'opensea',
    hashtags: ['#OpenSea', '#NFT', '#NFTMarketplace'],
    category: 'nft' as const,
  },
  'metamask': {
    name: 'MetaMask',
    symbol: '',
    handle: 'MetaMask',
    hashtags: ['#MetaMask', '#Web3Wallet', '#Ethereum'],
    category: 'infrastructure' as const,
  },
  'binance': {
    name: 'Binance',
    symbol: 'BNB',
    handle: 'binance',
    hashtags: ['#Binance', '#BNB', '#BSC'],
    category: 'exchange' as const,
  },
  'coinbase': {
    name: 'Coinbase',
    symbol: 'COIN',
    handle: 'coinbase',
    hashtags: ['#Coinbase', '#COIN', '#Crypto'],
    category: 'exchange' as const,
  },
  'humanity-protocol': {
    name: 'Humanity Protocol',
    symbol: 'HMT',
    handle: 'TK_Humanity',
    hashtags: ['#HumanityProtocol', '#HumanityTestnet', '#PalmScan'],
    category: 'infrastructure' as const,
  },
} as const

// Chrome extension constants
export const EXTENSION_CONSTANTS = {
  SIDEBAR_WIDTH: 400,
  POPUP_WIDTH: 350,
  POPUP_HEIGHT: 500,
  CONTENT_SCRIPT_RETRY_DELAY: 1000,
  API_TIMEOUT: 30000,
  STORAGE_KEYS: {
    API_KEYS: 'yapmate_api_keys',
    USER_SETTINGS: 'yapmate_user_settings',
    CACHED_REPLIES: 'yapmate_cached_replies',
    ANALYTICS: 'yapmate_analytics',
  },
} as const

// Rate limiting
export const RATE_LIMITS = {
  FREE_TIER: {
    REPLIES_PER_MONTH: 100,
    REQUESTS_PER_MINUTE: 10,
  },
  PRO_TIER: {
    REPLIES_PER_MONTH: -1, // Unlimited
    REQUESTS_PER_MINUTE: 60,
  },
  TEAM_TIER: {
    REPLIES_PER_MONTH: -1, // Unlimited
    REQUESTS_PER_MINUTE: 120,
  },
  ENTERPRISE_TIER: {
    REPLIES_PER_MONTH: -1, // Unlimited
    REQUESTS_PER_MINUTE: 300,
  },
} as const

// Analytics events
export const ANALYTICS_EVENTS = {
  REPLY_GENERATED: 'reply_generated',
  REPLY_COPIED: 'reply_copied',
  REPLY_FILLED: 'reply_filled',
  REPLY_REWRITTEN: 'reply_rewritten',
  TONE_CHANGED: 'tone_changed',
  MODE_TOGGLED: 'mode_toggled',
  SETTINGS_UPDATED: 'settings_updated',
  ERROR_OCCURRED: 'error_occurred',
} as const

// Error codes
export const ERROR_CODES = {
  INVALID_API_KEY: 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  CONTENT_SCRIPT_ERROR: 'CONTENT_SCRIPT_ERROR',
} as const

// Social media platforms
export const PLATFORMS = {
  TWITTER: {
    name: 'Twitter/X',
    domains: ['twitter.com', 'x.com'],
    characterLimit: 280,
    selectors: {
      tweet: 'article[data-testid="tweet"]',
      tweetText: '[data-testid="tweetText"]',
      replyButton: '[data-testid="reply"]',
      replyBox: '[data-testid="tweetTextarea_0"]',
    },
  },
} as const
