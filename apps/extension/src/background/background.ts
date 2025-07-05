// Background service worker for YapMate 2.0

// Simple logger
const logger = {
  info: (...args: any[]) => console.log('[Background]', ...args),
  warn: (...args: any[]) => console.warn('[Background]', ...args),
  error: (...args: any[]) => console.error('[Background]', ...args),
  debug: (...args: any[]) => console.debug('[Background]', ...args),
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  logger.info('Extension icon clicked', { tabId: tab.id })
  
  if (tab.id) {
    try {
      // Check if we're on a supported platform
      if (tab.url && (tab.url.includes('x.com') || tab.url.includes('twitter.com'))) {
        await chrome.sidePanel.open({ tabId: tab.id })
        logger.info('Sidebar opened successfully')
      } else {
        // Show popup for non-supported sites
        logger.info('Non-supported site, showing popup')
      }
    } catch (error) {
      logger.error('Error opening sidebar:', error)
    }
  }
})

// Auto-enable sidebar for Twitter/X pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isTwitter = tab.url.includes('x.com') || tab.url.includes('twitter.com')
    
    if (isTwitter) {
      try {
        await chrome.sidePanel.setOptions({
          tabId,
          path: 'sidebar.html',
          enabled: true
        })
        
        // Update badge to show extension is active
        await chrome.action.setBadgeText({
          text: '●',
          tabId
        })
        
        await chrome.action.setBadgeBackgroundColor({
          color: '#10b981',
          tabId
        })
        
        logger.info('Sidebar enabled for Twitter/X tab', { tabId, url: tab.url })
      } catch (error) {
        logger.error('Error setting sidebar options:', error)
      }
    } else {
      // Clear badge for non-Twitter sites
      try {
        await chrome.action.setBadgeText({
          text: '',
          tabId
        })
      } catch (error) {
        logger.error('Error clearing badge:', error)
      }
    }
  }
})

// Handle messages from content scripts and popup/sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.debug('Message received:', { message, sender: sender.tab?.id })
  
  switch (message.type) {
    case 'OPEN_SIDEBAR':
      handleOpenSidebar(message, sender, sendResponse)
      break
      
    case 'CLOSE_SIDEBAR':
      handleCloseSidebar(message, sender, sendResponse)
      break
      
    case 'UPDATE_BADGE':
      handleUpdateBadge(message, sender, sendResponse)
      break
      
    case 'GET_TAB_INFO':
      handleGetTabInfo(message, sender, sendResponse)
      break
      
    case 'ANALYTICS_EVENT':
      handleAnalyticsEvent(message, sender, sendResponse)
      break
      
    default:
      logger.warn('Unknown message type:', message.type)
      sendResponse({ success: false, error: 'Unknown message type' })
  }
  
  return true // Keep message channel open for async response
})

async function handleOpenSidebar(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    if (sender.tab?.id) {
      await chrome.sidePanel.open({ tabId: sender.tab.id })
      sendResponse({ success: true })
    } else {
      sendResponse({ success: false, error: 'No tab ID available' })
    }
  } catch (error) {
    logger.error('Error opening sidebar:', error)
    sendResponse({ success: false, error: (error as Error).message })
  }
}

async function handleCloseSidebar(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    // Note: Chrome doesn't have a direct API to close sidebar, but we can disable it
    if (sender.tab?.id) {
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        enabled: false
      })
      sendResponse({ success: true })
    } else {
      sendResponse({ success: false, error: 'No tab ID available' })
    }
  } catch (error) {
    logger.error('Error closing sidebar:', error)
    sendResponse({ success: false, error: (error as Error).message })
  }
}

async function handleUpdateBadge(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    const { text, color } = message.payload

    if (sender.tab?.id) {
      await chrome.action.setBadgeText({
        text: text || '',
        tabId: sender.tab.id
      })

      if (color) {
        await chrome.action.setBadgeBackgroundColor({
          color,
          tabId: sender.tab.id
        })
      }

      sendResponse({ success: true })
    } else {
      sendResponse({ success: false, error: 'No tab ID available' })
    }
  } catch (error) {
    logger.error('Error updating badge:', error)
    sendResponse({ success: false, error: (error as Error).message })
  }
}

async function handleGetTabInfo(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    if (sender.tab) {
      sendResponse({
        success: true,
        data: {
          id: sender.tab.id,
          url: sender.tab.url,
          title: sender.tab.title,
          isTwitter: sender.tab.url?.includes('x.com') || sender.tab.url?.includes('twitter.com')
        }
      })
    } else {
      sendResponse({ success: false, error: 'No tab information available' })
    }
  } catch (error) {
    logger.error('Error getting tab info:', error)
    sendResponse({ success: false, error: (error as Error).message })
  }
}

async function handleAnalyticsEvent(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    // Store analytics event locally for now
    // In the future, this could be sent to an analytics service
    const event = {
      ...message.payload,
      timestamp: new Date().toISOString(),
      tabId: sender.tab?.id,
      url: sender.tab?.url
    }

    // Store in local storage
    const { analyticsEvents = [] } = await chrome.storage.local.get(['analyticsEvents'])
    analyticsEvents.push(event)

    // Keep only last 1000 events
    if (analyticsEvents.length > 1000) {
      analyticsEvents.splice(0, analyticsEvents.length - 1000)
    }

    await chrome.storage.local.set({ analyticsEvents })

    logger.debug('Analytics event stored:', event)
    sendResponse({ success: true })
  } catch (error) {
    logger.error('Error handling analytics event:', error)
    sendResponse({ success: false, error: (error as Error).message })
  }
}

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  logger.info('Extension installed/updated:', details)
  
  if (details.reason === 'install') {
    // First time installation
    logger.info('First time installation detected')
    
    // Set default settings
    chrome.storage.sync.set({
      yapmate_settings: {
        theme: 'light',
        defaultTone: 'smart',
        cryptoMode: true,
        autoGenerate: false,
        notifications: true,
        onboardingCompleted: false
      }
    })
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    })
  }
})

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  logger.info('Extension started')
})

// Handle context invalidation
chrome.runtime.onConnect.addListener((port) => {
  logger.debug('Port connected:', port.name)
  
  port.onDisconnect.addListener(() => {
    logger.debug('Port disconnected:', port.name)
  })
})

// Cleanup on extension suspend
chrome.runtime.onSuspend.addListener(() => {
  logger.info('Extension suspending')
})

logger.info('Background script loaded successfully')
