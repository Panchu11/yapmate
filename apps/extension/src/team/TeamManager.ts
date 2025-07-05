// Team Collaboration System
export interface TeamMember {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'member' | 'viewer'
  avatar?: string
  permissions: TeamPermissions
  joinedAt: Date
  lastActive: Date
  isActive: boolean
}

export interface TeamPermissions {
  canGenerateReplies: boolean
  canApproveReplies: boolean
  canManageTemplates: boolean
  canViewAnalytics: boolean
  canManageTeam: boolean
  canManageBilling: boolean
  canAccessAllProjects: boolean
  projectIds: string[]
}

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  plan: 'team' | 'enterprise'
  members: TeamMember[]
  projects: TeamProject[]
  templates: ReplyTemplate[]
  brandGuidelines: BrandGuidelines
  approvalWorkflow: ApprovalWorkflow
  createdAt: Date
  updatedAt: Date
}

export interface TeamProject {
  id: string
  name: string
  description?: string
  platforms: string[]
  assignedMembers: string[]
  brandVoice: BrandVoice
  approvalRequired: boolean
  isActive: boolean
  createdAt: Date
}

export interface ReplyTemplate {
  id: string
  name: string
  description?: string
  content: string
  tone: string
  category: string
  platforms: string[]
  variables: TemplateVariable[]
  usage: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'select'
  required: boolean
  defaultValue?: string
  options?: string[]
  description?: string
}

export interface BrandGuidelines {
  voice: BrandVoice
  doNotUse: string[]
  preferredTerms: Record<string, string>
  hashtagStrategy: string[]
  mentionGuidelines: string[]
  complianceRules: string[]
}

export interface BrandVoice {
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful'
  personality: string[]
  writingStyle: string
  keyMessages: string[]
  avoidTopics: string[]
}

export interface ApprovalWorkflow {
  enabled: boolean
  requireApprovalFor: {
    allReplies: boolean
    publicReplies: boolean
    highEngagementPosts: boolean
    sensitiveTopics: boolean
  }
  approvers: string[]
  autoApproveAfter?: number // hours
}

export interface PendingReply {
  id: string
  content: string
  originalPost: any
  tone: string
  platform: string
  projectId: string
  createdBy: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'auto-approved'
  approvedBy?: string
  approvedAt?: Date
  rejectionReason?: string
  scheduledFor?: Date
}

export class TeamManager {
  private currentTeam: Team | null = null
  private currentUser: TeamMember | null = null

  async initializeTeam(): Promise<void> {
    try {
      // Load team data from storage
      const { teamData } = await chrome.storage.sync.get(['teamData'])
      if (teamData) {
        this.currentTeam = teamData
        this.currentUser = this.getCurrentUser()
      }
    } catch (error) {
      console.error('Error initializing team:', error)
    }
  }

  getCurrentTeam(): Team | null {
    return this.currentTeam
  }

  getCurrentUser(): TeamMember | null {
    if (!this.currentTeam) return null
    
    // In a real implementation, this would get the current user's ID
    const currentUserId = 'current-user-id' // Would come from auth
    return this.currentTeam.members.find(member => member.id === currentUserId) || null
  }

  hasPermission(permission: keyof TeamPermissions): boolean {
    if (!this.currentUser) return true // Solo user has all permissions
    const value = this.currentUser.permissions[permission]
    return typeof value === 'boolean' ? value : false
  }

  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const team: Team = {
      id: this.generateId(),
      name: teamData.name || 'My Team',
      description: teamData.description,
      plan: teamData.plan || 'team',
      members: [],
      projects: [],
      templates: [],
      brandGuidelines: this.getDefaultBrandGuidelines(),
      approvalWorkflow: this.getDefaultApprovalWorkflow(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...teamData
    }

    await this.saveTeam(team)
    this.currentTeam = team
    return team
  }

  async inviteMember(email: string, role: TeamMember['role']): Promise<void> {
    if (!this.hasPermission('canManageTeam')) {
      throw new Error('Insufficient permissions to invite members')
    }

    const member: TeamMember = {
      id: this.generateId(),
      email,
      name: email.split('@')[0], // Temporary name
      role,
      permissions: this.getDefaultPermissions(role),
      joinedAt: new Date(),
      lastActive: new Date(),
      isActive: true
    }

    if (this.currentTeam) {
      this.currentTeam.members.push(member)
      await this.saveTeam(this.currentTeam)
    }

    // In a real implementation, send invitation email
    console.log(`Invitation sent to ${email}`)
  }

  async createProject(projectData: Partial<TeamProject>): Promise<TeamProject> {
    if (!this.hasPermission('canManageTeam')) {
      throw new Error('Insufficient permissions to create projects')
    }

    const project: TeamProject = {
      id: this.generateId(),
      name: projectData.name || 'New Project',
      description: projectData.description,
      platforms: projectData.platforms || ['twitter'],
      assignedMembers: projectData.assignedMembers || [],
      brandVoice: projectData.brandVoice || this.getDefaultBrandVoice(),
      approvalRequired: projectData.approvalRequired || false,
      isActive: true,
      createdAt: new Date(),
      ...projectData
    }

    if (this.currentTeam) {
      this.currentTeam.projects.push(project)
      await this.saveTeam(this.currentTeam)
    }

    return project
  }

  async createTemplate(templateData: Partial<ReplyTemplate>): Promise<ReplyTemplate> {
    if (!this.hasPermission('canManageTemplates')) {
      throw new Error('Insufficient permissions to create templates')
    }

    const template: ReplyTemplate = {
      id: this.generateId(),
      name: templateData.name || 'New Template',
      description: templateData.description,
      content: templateData.content || '',
      tone: templateData.tone || 'professional',
      category: templateData.category || 'general',
      platforms: templateData.platforms || ['twitter'],
      variables: templateData.variables || [],
      usage: 0,
      createdBy: this.currentUser?.id || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...templateData
    }

    if (this.currentTeam) {
      this.currentTeam.templates.push(template)
      await this.saveTeam(this.currentTeam)
    }

    return template
  }

  async submitForApproval(replyData: Partial<PendingReply>): Promise<PendingReply> {
    const pendingReply: PendingReply = {
      id: this.generateId(),
      content: replyData.content || '',
      originalPost: replyData.originalPost,
      tone: replyData.tone || 'professional',
      platform: replyData.platform || 'twitter',
      projectId: replyData.projectId || '',
      createdBy: this.currentUser?.id || 'unknown',
      createdAt: new Date(),
      status: 'pending',
      ...replyData
    }

    // Store pending reply
    const { pendingReplies = [] } = await chrome.storage.local.get(['pendingReplies'])
    pendingReplies.push(pendingReply)
    await chrome.storage.local.set({ pendingReplies })

    // Notify approvers
    await this.notifyApprovers(pendingReply)

    return pendingReply
  }

  async approveReply(replyId: string, approverId: string): Promise<void> {
    if (!this.hasPermission('canApproveReplies')) {
      throw new Error('Insufficient permissions to approve replies')
    }

    const { pendingReplies = [] } = await chrome.storage.local.get(['pendingReplies'])
    const replyIndex = pendingReplies.findIndex((r: PendingReply) => r.id === replyId)
    
    if (replyIndex !== -1) {
      pendingReplies[replyIndex].status = 'approved'
      pendingReplies[replyIndex].approvedBy = approverId
      pendingReplies[replyIndex].approvedAt = new Date()
      
      await chrome.storage.local.set({ pendingReplies })
    }
  }

  async rejectReply(replyId: string, reason: string): Promise<void> {
    if (!this.hasPermission('canApproveReplies')) {
      throw new Error('Insufficient permissions to reject replies')
    }

    const { pendingReplies = [] } = await chrome.storage.local.get(['pendingReplies'])
    const replyIndex = pendingReplies.findIndex((r: PendingReply) => r.id === replyId)
    
    if (replyIndex !== -1) {
      pendingReplies[replyIndex].status = 'rejected'
      pendingReplies[replyIndex].rejectionReason = reason
      
      await chrome.storage.local.set({ pendingReplies })
    }
  }

  async getTemplates(category?: string, platform?: string): Promise<ReplyTemplate[]> {
    if (!this.currentTeam) return []

    let templates = this.currentTeam.templates

    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    if (platform) {
      templates = templates.filter(t => t.platforms.includes(platform))
    }

    return templates.sort((a, b) => b.usage - a.usage)
  }

  async useTemplate(templateId: string, variables: Record<string, string>): Promise<string> {
    const template = this.currentTeam?.templates.find(t => t.id === templateId)
    if (!template) throw new Error('Template not found')

    let content = template.content

    // Replace variables
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || ''
      content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), value)
    })

    // Increment usage
    template.usage++
    await this.saveTeam(this.currentTeam!)

    return content
  }

  private async saveTeam(team: Team): Promise<void> {
    await chrome.storage.sync.set({ teamData: team })
  }

  private async notifyApprovers(pendingReply: PendingReply): Promise<void> {
    // In a real implementation, this would send notifications
    console.log('Notifying approvers of pending reply:', pendingReply.id)
  }

  private getDefaultPermissions(role: TeamMember['role']): TeamPermissions {
    const basePermissions: TeamPermissions = {
      canGenerateReplies: false,
      canApproveReplies: false,
      canManageTemplates: false,
      canViewAnalytics: false,
      canManageTeam: false,
      canManageBilling: false,
      canAccessAllProjects: false,
      projectIds: []
    }

    switch (role) {
      case 'admin':
        return {
          ...basePermissions,
          canGenerateReplies: true,
          canApproveReplies: true,
          canManageTemplates: true,
          canViewAnalytics: true,
          canManageTeam: true,
          canManageBilling: true,
          canAccessAllProjects: true
        }
      case 'manager':
        return {
          ...basePermissions,
          canGenerateReplies: true,
          canApproveReplies: true,
          canManageTemplates: true,
          canViewAnalytics: true,
          canAccessAllProjects: true
        }
      case 'member':
        return {
          ...basePermissions,
          canGenerateReplies: true,
          canViewAnalytics: true
        }
      case 'viewer':
        return {
          ...basePermissions,
          canViewAnalytics: true
        }
      default:
        return basePermissions
    }
  }

  private getDefaultBrandGuidelines(): BrandGuidelines {
    return {
      voice: this.getDefaultBrandVoice(),
      doNotUse: ['spam', 'scam', 'guaranteed returns'],
      preferredTerms: {
        'crypto': 'cryptocurrency',
        'hodl': 'hold long-term'
      },
      hashtagStrategy: ['#crypto', '#blockchain', '#web3'],
      mentionGuidelines: ['Always be respectful', 'Add value to conversations'],
      complianceRules: ['No financial advice', 'Disclose partnerships']
    }
  }

  private getDefaultBrandVoice(): BrandVoice {
    return {
      tone: 'professional',
      personality: ['knowledgeable', 'helpful', 'authentic'],
      writingStyle: 'Clear and concise with industry expertise',
      keyMessages: ['Innovation in blockchain', 'Community-first approach'],
      avoidTopics: ['price predictions', 'investment advice']
    }
  }

  private getDefaultApprovalWorkflow(): ApprovalWorkflow {
    return {
      enabled: false,
      requireApprovalFor: {
        allReplies: false,
        publicReplies: true,
        highEngagementPosts: true,
        sensitiveTopics: true
      },
      approvers: [],
      autoApproveAfter: 24
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Global instance
export const teamManager = new TeamManager()
