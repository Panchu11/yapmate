// Advanced Crypto Intelligence System
export interface CryptoProject {
  id: string
  name: string
  symbol: string
  handle?: string
  hashtags: string[]
  category: 'blockchain' | 'defi' | 'nft' | 'infrastructure' | 'exchange' | 'meme' | 'ai' | 'gaming'
  description?: string
  website?: string
  marketCap?: number
  price?: number
  priceChange24h?: number
  isActive: boolean
  confidence: number
  aliases: string[]
}

export interface MarketData {
  symbol: string
  price: number
  priceChange24h: number
  marketCap: number
  volume24h: number
  lastUpdated: Date
}

export interface SentimentAnalysis {
  score: number // -1 to 1
  label: 'bearish' | 'neutral' | 'bullish'
  confidence: number
  keywords: string[]
}

export class CryptoIntelligence {
  private projects: Map<string, CryptoProject> = new Map()
  private marketData: Map<string, MarketData> = new Map()
  private lastMarketUpdate: Date = new Date(0)

  constructor() {
    this.initializeProjects()
  }

  private initializeProjects() {
    const projects: CryptoProject[] = [
      // Major Blockchains
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        handle: 'bitcoin',
        hashtags: ['#Bitcoin', '#BTC', '#HODL', '#DigitalGold'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['btc', 'bitcoin', 'digital gold', 'orange coin']
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        handle: 'ethereum',
        hashtags: ['#Ethereum', '#ETH', '#DeFi', '#SmartContracts'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['eth', 'ethereum', 'ether', 'vitalik']
      },
      {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        handle: 'solana',
        hashtags: ['#Solana', '#SOL', '#SolanaEcosystem', '#FastAndCheap'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['sol', 'solana', 'phantom', 'solana labs']
      },
      {
        id: 'base',
        name: 'Base',
        symbol: 'BASE',
        handle: 'base',
        hashtags: ['#Base', '#BaseChain', '#Coinbase', '#OnchainSummer'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['base', 'base chain', 'coinbase l2', 'onchain summer']
      },
      
      // Layer 2s
      {
        id: 'arbitrum',
        name: 'Arbitrum',
        symbol: 'ARB',
        handle: 'arbitrum',
        hashtags: ['#Arbitrum', '#ARB', '#Layer2', '#Scaling'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['arb', 'arbitrum', 'arbitrum one', 'layer 2']
      },
      {
        id: 'optimism',
        name: 'Optimism',
        symbol: 'OP',
        handle: 'optimism',
        hashtags: ['#Optimism', '#OP', '#Layer2', '#OptimisticRollups'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['op', 'optimism', 'optimistic', 'superchain']
      },
      {
        id: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        handle: 'polygon',
        hashtags: ['#Polygon', '#MATIC', '#PolygonEcosystem', '#Web3'],
        category: 'blockchain',
        isActive: true,
        confidence: 1.0,
        aliases: ['matic', 'polygon', 'polygon pos', 'polygon zkevm']
      },

      // DeFi Protocols
      {
        id: 'uniswap',
        name: 'Uniswap',
        symbol: 'UNI',
        handle: 'Uniswap',
        hashtags: ['#Uniswap', '#UNI', '#DeFi', '#DEX'],
        category: 'defi',
        isActive: true,
        confidence: 1.0,
        aliases: ['uni', 'uniswap', 'unicorn', 'dex']
      },
      {
        id: 'aave',
        name: 'Aave',
        symbol: 'AAVE',
        handle: 'AaveAave',
        hashtags: ['#Aave', '#AAVE', '#DeFi', '#Lending'],
        category: 'defi',
        isActive: true,
        confidence: 1.0,
        aliases: ['aave', 'lending', 'ghost', 'defi lending']
      },

      // AI & Gaming
      {
        id: 'humanity-protocol',
        name: 'Humanity Protocol',
        symbol: 'HMT',
        handle: 'TK_Humanity',
        hashtags: ['#HumanityProtocol', '#HumanityTestnet', '#PalmScan', '#ProofOfHumanity'],
        category: 'ai',
        isActive: true,
        confidence: 1.0,
        aliases: ['humanity', 'palm scan', 'proof of humanity', 'human verification']
      },

      // Meme Coins
      {
        id: 'dogecoin',
        name: 'Dogecoin',
        symbol: 'DOGE',
        handle: 'dogecoin',
        hashtags: ['#Dogecoin', '#DOGE', '#ToTheMoon', '#ElonMusk'],
        category: 'meme',
        isActive: true,
        confidence: 1.0,
        aliases: ['doge', 'dogecoin', 'shiba', 'much wow', 'elon']
      },
      {
        id: 'shiba-inu',
        name: 'Shiba Inu',
        symbol: 'SHIB',
        handle: 'Shibtoken',
        hashtags: ['#SHIB', '#ShibaInu', '#ShibArmy', '#HODL'],
        category: 'meme',
        isActive: true,
        confidence: 1.0,
        aliases: ['shib', 'shiba', 'shiba inu', 'shib army']
      },

      // Infrastructure
      {
        id: 'chainlink',
        name: 'Chainlink',
        symbol: 'LINK',
        handle: 'chainlink',
        hashtags: ['#Chainlink', '#LINK', '#Oracle', '#SmartContracts'],
        category: 'infrastructure',
        isActive: true,
        confidence: 1.0,
        aliases: ['link', 'chainlink', 'oracle', 'sergey nazarov']
      },

      // Exchanges
      {
        id: 'binance',
        name: 'Binance',
        symbol: 'BNB',
        handle: 'binance',
        hashtags: ['#Binance', '#BNB', '#BSC', '#CZ'],
        category: 'exchange',
        isActive: true,
        confidence: 1.0,
        aliases: ['bnb', 'binance', 'bsc', 'cz', 'changpeng zhao']
      },
      {
        id: 'coinbase',
        name: 'Coinbase',
        symbol: 'COIN',
        handle: 'coinbase',
        hashtags: ['#Coinbase', '#COIN', '#Crypto', '#Base'],
        category: 'exchange',
        isActive: true,
        confidence: 1.0,
        aliases: ['coinbase', 'coin', 'brian armstrong', 'cb']
      }
    ]

    projects.forEach(project => {
      this.projects.set(project.id, project)
      // Also index by symbol and aliases for quick lookup
      this.projects.set(project.symbol.toLowerCase(), project)
      project.aliases.forEach(alias => {
        this.projects.set(alias.toLowerCase(), project)
      })
    })
  }

  // Detect crypto projects in text
  detectProjects(text: string): CryptoProject[] {
    const detectedProjects: Map<string, CryptoProject> = new Map()
    const lowerText = text.toLowerCase()

    // Extract potential tickers ($BTC, $ETH, etc.)
    const tickerMatches = text.match(/\$([A-Z]{1,10})/g) || []
    tickerMatches.forEach(ticker => {
      const symbol = ticker.substring(1).toLowerCase()
      const project = this.projects.get(symbol)
      if (project) {
        detectedProjects.set(project.id, { ...project, confidence: 0.9 })
      }
    })

    // Extract mentions (@bitcoin, @ethereum, etc.)
    const mentionMatches = text.match(/@(\w+)/g) || []
    mentionMatches.forEach(mention => {
      const handle = mention.substring(1).toLowerCase()
      const project = this.projects.get(handle)
      if (project) {
        detectedProjects.set(project.id, { ...project, confidence: 0.8 })
      }
    })

    // Extract hashtags (#Bitcoin, #Ethereum, etc.)
    const hashtagMatches = text.match(/#(\w+)/g) || []
    hashtagMatches.forEach(hashtag => {
      const tag = hashtag.substring(1).toLowerCase()
      const project = this.projects.get(tag)
      if (project) {
        detectedProjects.set(project.id, { ...project, confidence: 0.7 })
      }
    })

    // Search for project names and aliases in text
    this.projects.forEach(project => {
      // Check project name
      if (lowerText.includes(project.name.toLowerCase())) {
        detectedProjects.set(project.id, { ...project, confidence: 0.8 })
      }

      // Check aliases
      project.aliases.forEach(alias => {
        if (lowerText.includes(alias)) {
          const existing = detectedProjects.get(project.id)
          if (!existing || existing.confidence < 0.6) {
            detectedProjects.set(project.id, { ...project, confidence: 0.6 })
          }
        }
      })
    })

    return Array.from(detectedProjects.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Return top 5 matches
  }

  // Analyze sentiment of crypto-related text
  analyzeSentiment(text: string): SentimentAnalysis {
    const lowerText = text.toLowerCase()

    // Bullish keywords
    const bullishKeywords = [
      'moon', 'bullish', 'pump', 'lfg', 'hodl', 'diamond hands', 'to the moon',
      'rocket', 'lambo', 'gains', 'profit', 'buy', 'accumulate', 'dca',
      'breakout', 'rally', 'surge', 'explode', 'parabolic', 'ath', 'new high'
    ]

    // Bearish keywords
    const bearishKeywords = [
      'dump', 'crash', 'bearish', 'sell', 'exit', 'paper hands', 'rekt',
      'liquidated', 'down', 'drop', 'fall', 'decline', 'correction',
      'bear market', 'capitulation', 'bottom', 'oversold'
    ]

    // Neutral keywords
    const neutralKeywords = [
      'hold', 'wait', 'sideways', 'consolidation', 'range', 'stable',
      'analysis', 'chart', 'technical', 'fundamental', 'research'
    ]

    let bullishScore = 0
    let bearishScore = 0
    let neutralScore = 0
    const foundKeywords: string[] = []

    bullishKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        bullishScore += 1
        foundKeywords.push(keyword)
      }
    })

    bearishKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        bearishScore += 1
        foundKeywords.push(keyword)
      }
    })

    neutralKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        neutralScore += 0.5
        foundKeywords.push(keyword)
      }
    })

    // Calculate overall sentiment
    const totalScore = bullishScore + bearishScore + neutralScore
    let score = 0
    let label: 'bearish' | 'neutral' | 'bullish' = 'neutral'
    let confidence = 0

    if (totalScore > 0) {
      score = (bullishScore - bearishScore) / totalScore
      confidence = Math.min(totalScore / 3, 1) // Max confidence at 3+ keywords
      
      if (score > 0.3) {
        label = 'bullish'
      } else if (score < -0.3) {
        label = 'bearish'
      } else {
        label = 'neutral'
      }
    }

    return {
      score,
      label,
      confidence,
      keywords: foundKeywords
    }
  }

  // Get enhanced context for AI prompt generation
  getEnhancedContext(text: string): {
    projects: CryptoProject[]
    sentiment: SentimentAnalysis
    suggestedMentions: string[]
    suggestedHashtags: string[]
    suggestedTickers: string[]
  } {
    const projects = this.detectProjects(text)
    const sentiment = this.analyzeSentiment(text)

    const suggestedMentions: string[] = []
    const suggestedHashtags: string[] = []
    const suggestedTickers: string[] = []

    projects.forEach(project => {
      if (project.handle && !text.includes(`@${project.handle}`)) {
        suggestedMentions.push(`@${project.handle}`)
      }
      
      if (!text.includes(`$${project.symbol}`)) {
        suggestedTickers.push(`$${project.symbol}`)
      }

      project.hashtags.forEach(hashtag => {
        if (!text.includes(hashtag) && suggestedHashtags.length < 3) {
          suggestedHashtags.push(hashtag)
        }
      })
    })

    return {
      projects,
      sentiment,
      suggestedMentions: suggestedMentions.slice(0, 3),
      suggestedHashtags: suggestedHashtags.slice(0, 3),
      suggestedTickers: suggestedTickers.slice(0, 3)
    }
  }

  // Get project by ID or symbol
  getProject(identifier: string): CryptoProject | undefined {
    return this.projects.get(identifier.toLowerCase())
  }

  // Get all projects by category
  getProjectsByCategory(category: CryptoProject['category']): CryptoProject[] {
    return Array.from(this.projects.values())
      .filter(project => project.category === category)
      .filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      ) // Remove duplicates
  }

  // Search projects by name or symbol
  searchProjects(query: string): CryptoProject[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.projects.values())
      .filter(project => 
        project.name.toLowerCase().includes(lowerQuery) ||
        project.symbol.toLowerCase().includes(lowerQuery) ||
        project.aliases.some(alias => alias.includes(lowerQuery))
      )
      .filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      ) // Remove duplicates
      .slice(0, 10)
  }
}

// Global instance
export const cryptoIntelligence = new CryptoIntelligence()
