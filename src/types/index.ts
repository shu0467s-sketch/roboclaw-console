// ===== 基础枚举 =====
export type Industry = 'hotel' | 'mall' | 'exhibition' | 'reception'
export type LoginMode = 'account' | 'sms' | 'sso'
export type PageKey = 'workbench' | 'config' | 'operation' | 'help'

export interface IndustryOption {
  value: Industry
  label: string
  desc: string
  scenarios: string[]
}

// ===== 能力 =====
export interface Capability {
  id: string
  name: string
  desc: string
  category: '交流服务' | '业务服务' | '行动服务'
  recommended: boolean
  defaultOn: boolean
  recommendFor?: string
}

// ===== 资料项 =====
export type MaterialStatus = 'pending' | 'parsing' | 'done' | 'need-fix'
export interface MaterialItem {
  id: string
  name: string
  desc: string
  status: MaterialStatus
  size?: string
  parseResult?: string
}

// ===== 系统连接 =====
export interface SystemConnection {
  id: string
  name: string
  desc: string
  connected: boolean
  status: string
}

// ===== 地图点位 =====
export interface MapPoint {
  id: string
  name: string
  type: '入口' | '服务点' | '关键地点' | '出口'
  x: number // 0-100 %
  y: number // 0-100 %
}

// ===== 语音配置 =====
export interface VoiceOption {
  id: string
  name: string
  style: string
  selected: boolean
}
export interface VoiceConfig {
  voiceId: string
  volume: number
  speed: number
  welcomeMsg: string
  listened: boolean
}

// ===== 服务方案 =====
export type PlanStatus = 'draft' | 'running' | 'abnormal' | 'offline'
export interface ServicePlan {
  id: string
  name: string
  industry: Industry
  scenario: string
  status: PlanStatus
  progress: number // 0-100
  lastModified: string
  onlineDuration?: string
  serviceCount?: number
  satisfaction?: number
  currentStep?: number
  capabilities?: string[]
  materials?: MaterialItem[]
  points?: MapPoint[]
  voice?: VoiceConfig
  robotId?: string
}

// ===== 版本 =====
export interface VersionRecord {
  id: string
  version: string
  publishedAt: string
  publisher: string
  changes: string
  isCurrent: boolean
  serviceCount?: number
  satisfaction?: number
}

// ===== 运行数据 =====
export interface OperationKpi {
  label: string
  value: string
  unit?: string
  trend?: number[]
  alert?: boolean
}
export interface AlertRecord {
  id: string
  level: 'high' | 'medium' | 'low'
  message: string
  time: string
}
export interface RunLog {
  id: string
  time: string
  message: string
  type: 'service' | 'error' | 'version'
}

// ===== 聊天测试 =====
export interface ChatMessage {
  role: 'user' | 'robot'
  text: string
  source?: string
  route?: string
}

// ===== 发布检查 =====
export interface ChecklistItem {
  key: string
  label: string
  value: string
  passed: boolean
  required: boolean
}

// ===== 配置流程草稿 =====
export interface DraftMaterial {
  id: string
  name: string
  status: string
  desc: string
  size?: string
  parseResult?: string
}

export interface DraftPoint {
  id: string
  name: string
  type: '入口' | '服务点' | '关键地点' | '出口'
  x: number
  y: number
}

export interface DraftConfig {
  planName: string
  industry: Industry | null
  scenario: string
  capabilities: string[]
  materials: DraftMaterial[]
  points: DraftPoint[]
  voice: VoiceConfig
  robotId: string
  step: number
}

// ===== 用户 =====
export interface UserInfo {
  name: string
  role: string
  enterprise: string
  domain: string
  isGuest: boolean
  avatar: string
}
