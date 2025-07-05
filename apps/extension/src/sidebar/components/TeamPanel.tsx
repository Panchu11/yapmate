import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { teamManager, Team, TeamMember, ReplyTemplate, PendingReply } from '../../team/TeamManager'

export const TeamPanel: React.FC = () => {
  const [team, setTeam] = useState<Team | null>(null)
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'templates' | 'approvals'>('overview')
  const [templates, setTemplates] = useState<ReplyTemplate[]>([])
  const [pendingReplies, setPendingReplies] = useState<PendingReply[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    setIsLoading(true)
    try {
      await teamManager.initializeTeam()
      const teamData = teamManager.getCurrentTeam()
      const userData = teamManager.getCurrentUser()
      
      setTeam(teamData)
      setCurrentUser(userData)

      if (teamData) {
        const teamTemplates = await teamManager.getTemplates()
        setTemplates(teamTemplates)

        // Load pending replies
        const { pendingReplies = [] } = await chrome.storage.local.get(['pendingReplies'])
        setPendingReplies(pendingReplies.filter((r: PendingReply) => r.status === 'pending'))
      }
    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (email: string, role: TeamMember['role']) => {
    try {
      await teamManager.inviteMember(email, role)
      await loadTeamData()
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const handleApproveReply = async (replyId: string) => {
    try {
      await teamManager.approveReply(replyId, currentUser?.id || '')
      await loadTeamData()
    } catch (error) {
      console.error('Error approving reply:', error)
    }
  }

  const handleRejectReply = async (replyId: string, reason: string) => {
    try {
      await teamManager.rejectReply(replyId, reason)
      await loadTeamData()
    } catch (error) {
      console.error('Error rejecting reply:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yapmate-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading team data...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return <CreateTeamView onTeamCreated={loadTeamData} />
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{team.name}</h2>
            <p className="text-sm text-gray-600">{team.members.length} members • {team.plan} plan</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/30 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'members', label: 'Members', icon: '👥' },
            { id: 'templates', label: 'Templates', icon: '📝' },
            { id: 'approvals', label: 'Approvals', icon: '✅', badge: pendingReplies.length }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'bg-white text-yapmate-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <TeamOverview team={team} currentUser={currentUser} />
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <TeamMembers 
              team={team} 
              currentUser={currentUser}
              onInviteMember={handleInviteMember}
            />
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <TeamTemplates 
              templates={templates}
              currentUser={currentUser}
              onTemplateCreated={loadTeamData}
            />
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <TeamApprovals 
              pendingReplies={pendingReplies}
              currentUser={currentUser}
              onApprove={handleApproveReply}
              onReject={handleRejectReply}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Create Team View Component
const CreateTeamView: React.FC<{ onTeamCreated: () => void }> = ({ onTeamCreated }) => {
  const [teamName, setTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return

    setIsCreating(true)
    try {
      await teamManager.createTeam({
        name: teamName,
        plan: 'team'
      })
      onTeamCreated()
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 max-w-md w-full text-center"
      >
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Your Team</h3>
        <p className="text-gray-600 mb-4">
          Collaborate with your team on social media engagement
        </p>
        
        <div className="space-y-3">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            className="input-field w-full"
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateTeam}
            disabled={!teamName.trim() || isCreating}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Team'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// Team Overview Component
const TeamOverview: React.FC<{ team: Team; currentUser: TeamMember | null }> = ({ team, currentUser }) => {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yapmate-primary">{team.members.length}</div>
          <div className="text-sm text-gray-600">Team Members</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{team.templates.length}</div>
          <div className="text-sm text-gray-600">Templates</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Team created</span>
            <span className="text-gray-400">• {team.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Team Members Component
const TeamMembers: React.FC<{ 
  team: Team; 
  currentUser: TeamMember | null;
  onInviteMember: (email: string, role: TeamMember['role']) => void;
}> = ({ team, currentUser, onInviteMember }) => {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('member')

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteMember(inviteEmail, inviteRole)
      setInviteEmail('')
    }
  }

  const canManageTeam = currentUser?.permissions.canManageTeam || false

  return (
    <div className="space-y-4">
      {/* Invite Member */}
      {canManageTeam && (
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Invite Member</h3>
          <div className="space-y-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="input-field w-full"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
              className="input-field w-full"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              Send Invitation
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Team Members</h3>
        <div className="space-y-3">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.email}</div>
                </div>
              </div>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Team Templates Component
const TeamTemplates: React.FC<{ 
  templates: ReplyTemplate[];
  currentUser: TeamMember | null;
  onTemplateCreated: () => void;
}> = ({ templates, currentUser, onTemplateCreated }) => {
  const canManageTemplates = currentUser?.permissions.canManageTemplates || false

  return (
    <div className="space-y-4">
      {canManageTemplates && (
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Create Template</h3>
          <button className="btn-primary w-full">
            + New Template
          </button>
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Templates</h3>
        {templates.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No templates yet</p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <span className="text-sm text-gray-500">{template.usage} uses</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {template.tone}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Team Approvals Component
const TeamApprovals: React.FC<{ 
  pendingReplies: PendingReply[];
  currentUser: TeamMember | null;
  onApprove: (replyId: string) => void;
  onReject: (replyId: string, reason: string) => void;
}> = ({ pendingReplies, currentUser, onApprove, onReject }) => {
  const canApprove = currentUser?.permissions.canApproveReplies || false

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Pending Approvals</h3>
        {pendingReplies.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No pending approvals</p>
        ) : (
          <div className="space-y-3">
            {pendingReplies.map((reply) => (
              <div key={reply.id} className="border border-gray-200 rounded-lg p-3">
                <div className="mb-2">
                  <div className="text-sm text-gray-600 mb-1">Reply content:</div>
                  <div className="bg-gray-50 p-2 rounded text-sm">{reply.content}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {reply.platform} • {reply.tone} • {reply.createdAt.toLocaleDateString()}
                  </div>
                  {canApprove && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onApprove(reply.id)}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(reply.id, 'Rejected by moderator')}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
