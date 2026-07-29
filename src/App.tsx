import React, { useState, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { LoginPage } from './pages/LoginPage'
import { WorkbenchPage } from './pages/WorkbenchPage'
import { ConfigFlowPage } from './pages/ConfigFlowPage'
import { OperationPage } from './pages/OperationPage'
import { HelpPage } from './pages/HelpPage'
import type { PageKey, UserInfo, ServicePlan, Industry, DraftConfig } from './types'
import { SERVICE_PLANS, DEFAULT_WELCOME } from './data/mock'

const DEFAULT_USER: UserInfo = {
  name: '运营主管',
  role: '运营主管',
  enterprise: '悦澜酒店集团',
  domain: 'hotel-demo.roboclaw.cn',
  isGuest: false,
  avatar: ''
}

const GUEST_USER: UserInfo = {
  name: '游客',
  role: '游客',
  enterprise: '体验空间',
  domain: 'guest.roboclaw.cn',
  isGuest: true,
  avatar: ''
}

const EMPTY_DRAFT: DraftConfig = {
  planName: '',
  industry: null,
  scenario: '',
  capabilities: [],
  materials: [],
  points: [],
  voice: { voiceId: 'warm-female', volume: 64, speed: 50, welcomeMsg: '', listened: false },
  robotId: 'RoboClaw-A01',
  step: 0
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<UserInfo>(DEFAULT_USER)
  const [page, setPage] = useState<PageKey>('workbench')
  const [plans, setPlans] = useState<ServicePlan[]>(SERVICE_PLANS)
  const [draft, setDraft] = useState<DraftConfig>(EMPTY_DRAFT)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

  const handleLogin = (guest: boolean) => {
    setUser(guest ? GUEST_USER : DEFAULT_USER)
    setLoggedIn(true)
    setPage('workbench')
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setUser(DEFAULT_USER)
    setPage('workbench')
    setDraft(EMPTY_DRAFT)
    setEditingPlanId(null)
  }

  const startNewPlan = useCallback(() => {
    setDraft(EMPTY_DRAFT)
    setEditingPlanId(null)
    setPage('config')
  }, [])

  const continuePlan = useCallback((plan: ServicePlan) => {
    setDraft({
      planName: plan.name,
      industry: plan.industry,
      scenario: plan.scenario,
      capabilities: plan.capabilities || [],
      materials: (plan.materials || []).map((m) => ({ id: m.id, name: m.name, status: m.status, desc: m.desc })),
      points: (plan.points || []).map((p) => ({ id: p.id, name: p.name, type: p.type, x: p.x, y: p.y })),
      voice: plan.voice
        ? { voiceId: plan.voice.voiceId, volume: plan.voice.volume, speed: plan.voice.speed, welcomeMsg: plan.voice.welcomeMsg, listened: plan.voice.listened }
        : { voiceId: 'warm-female', volume: 64, speed: 50, welcomeMsg: plan.industry ? DEFAULT_WELCOME[plan.industry] : '', listened: false },
      robotId: plan.robotId || 'RoboClaw-A01',
      step: (plan.currentStep || 1) - 1
    })
    setEditingPlanId(plan.id)
    setPage('config')
  }, [])

  const publishPlan = useCallback((name: string, industry: Industry, scenario: string, robotId: string) => {
    const newPlan: ServicePlan = {
      id: `plan-${Date.now()}`,
      name: name || `${industry === 'hotel' ? '酒店' : industry === 'mall' ? '商场' : industry === 'exhibition' ? '展厅' : '迎宾'}${scenario}`,
      industry,
      scenario,
      status: 'running',
      progress: 100,
      lastModified: '刚刚',
      onlineDuration: '刚刚上线',
      serviceCount: 0,
      satisfaction: 0,
      currentStep: 7,
      robotId
    }
    setPlans((prev) => [newPlan, ...prev.filter((p) => p.id !== editingPlanId)])
    setDraft(EMPTY_DRAFT)
    setEditingPlanId(null)
    setPage('operation')
  }, [editingPlanId])

  const runningCount = plans.filter((p) => p.status === 'running').length

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar
        current={page}
        onNavigate={setPage}
        user={user}
        runningCount={runningCount}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {page === 'workbench' && (
          <WorkbenchPage
            user={user}
            plans={plans}
            onNewPlan={startNewPlan}
            onContinuePlan={continuePlan}
            onNavigate={setPage}
          />
        )}
        {page === 'config' && (
          <ConfigFlowPage
            draft={draft}
            setDraft={setDraft}
            isGuest={user.isGuest}
            onPublish={publishPlan}
            onBack={() => setPage('workbench')}
          />
        )}
        {page === 'operation' && <OperationPage plans={plans} onNavigate={setPage} />}
        {page === 'help' && <HelpPage />}
      </main>
    </div>
  )
}
