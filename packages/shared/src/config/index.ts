// Configuration management
export interface AppConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    debug: boolean
  }
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  ai: {
    providers: {
      fireworks: {
        apiUrl: string
        model: string
        timeout: number
      }
      openai: {
        apiUrl: string
        model: string
        timeout: number
      }
      anthropic: {
        apiUrl: string
        model: string
        timeout: number
      }
    }
    defaultProvider: 'fireworks' | 'openai' | 'anthropic'
    fallbackProviders: ('fireworks' | 'openai' | 'anthropic')[]
  }
  extension: {
    sidebarWidth: number
    popupWidth: number
    popupHeight: number
    contentScriptRetryDelay: number
  }
  analytics: {
    enabled: boolean
    batchSize: number
    flushInterval: number
  }
  cache: {
    ttl: {
      replies: number
      userProfiles: number
      tweetAnalysis: number
    }
    maxSize: {
      replies: number
      userProfiles: number
      tweetAnalysis: number
    }
  }
  rateLimits: {
    free: {
      repliesPerMonth: number
      requestsPerMinute: number
    }
    pro: {
      repliesPerMonth: number
      requestsPerMinute: number
    }
    team: {
      repliesPerMonth: number
      requestsPerMinute: number
    }
    enterprise: {
      repliesPerMonth: number
      requestsPerMinute: number
    }
  }
}

const createConfig = (): AppConfig => {
  const env = process.env.NODE_ENV || 'development'
  const isProduction = env === 'production'
  
  return {
    app: {
      name: 'YapMate 2.0',
      version: '2.0.0',
      environment: env as 'development' | 'staging' | 'production',
      debug: !isProduction,
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 30000,
      retries: 3,
    },
    ai: {
      providers: {
        fireworks: {
          apiUrl: 'https://api.fireworks.ai/inference/v1/chat/completions',
          model: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
          timeout: 30000,
        },
        openai: {
          apiUrl: 'https://api.openai.com/v1/chat/completions',
          model: 'gpt-4-turbo-preview',
          timeout: 30000,
        },
        anthropic: {
          apiUrl: 'https://api.anthropic.com/v1/messages',
          model: 'claude-3-sonnet-20240229',
          timeout: 30000,
        },
      },
      defaultProvider: 'fireworks',
      fallbackProviders: ['openai', 'anthropic'],
    },
    extension: {
      sidebarWidth: 400,
      popupWidth: 350,
      popupHeight: 500,
      contentScriptRetryDelay: 1000,
    },
    analytics: {
      enabled: isProduction,
      batchSize: 10,
      flushInterval: 5000,
    },
    cache: {
      ttl: {
        replies: 3600000, // 1 hour
        userProfiles: 86400000, // 24 hours
        tweetAnalysis: 900000, // 15 minutes
      },
      maxSize: {
        replies: 100,
        userProfiles: 50,
        tweetAnalysis: 200,
      },
    },
    rateLimits: {
      free: {
        repliesPerMonth: 100,
        requestsPerMinute: 10,
      },
      pro: {
        repliesPerMonth: -1, // Unlimited
        requestsPerMinute: 60,
      },
      team: {
        repliesPerMonth: -1, // Unlimited
        requestsPerMinute: 120,
      },
      enterprise: {
        repliesPerMonth: -1, // Unlimited
        requestsPerMinute: 300,
      },
    },
  }
}

export const config = createConfig()

export const getConfig = (): AppConfig => config

export const updateConfig = (updates: Partial<AppConfig>): void => {
  Object.assign(config, updates)
}

export const isProduction = (): boolean => config.app.environment === 'production'
export const isDevelopment = (): boolean => config.app.environment === 'development'
export const isStaging = (): boolean => config.app.environment === 'staging'

export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

export const getAIProviderConfig = (provider: 'fireworks' | 'openai' | 'anthropic') => {
  return config.ai.providers[provider]
}

export const getRateLimitForPlan = (plan: 'free' | 'pro' | 'team' | 'enterprise') => {
  return config.rateLimits[plan]
}
