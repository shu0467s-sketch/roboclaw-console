import React, { useState, useRef, useEffect } from 'react'
import { Icon } from './shared/Icon'
import { Logo } from './shared/Logo'
import type { PageKey, UserInfo } from '../types'

interface SidebarProps {
  current: PageKey
  onNavigate: (p: PageKey) => void
  user: UserInfo
  runningCount: number
  onLogout: () => void
}

const NAV: { key: PageKey; label: string; icon: string }[] = [
  { key: 'workbench', label: '工作台', icon: 'dashboard' },
  { key: 'config', label: '方案配置', icon: 'config' },
  { key: 'operation', label: '上线运营', icon: 'rocket' },
  { key: 'help', label: '帮助支持', icon: 'help' }
]

export function Sidebar({ current, onNavigate, user, runningCount, onLogout }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const avatarText = user.isGuest ? '客' : user.name.slice(0, 1)

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800/60">
        <Logo size={34} />
        <div className="leading-tight">
          <div className="text-white font-semibold text-[15px] tracking-wide">RoboClaw</div>
          <div className="text-slate-500 text-[11px]">机器人服务后台</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = current === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Icon name={item.icon} className={`w-[18px] h-[18px] ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
              {item.key === 'operation' && runningCount > 0 && (
                <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {runningCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Status */}
      <div className="px-5 py-3 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          企业账号已登录
        </div>
      </div>

      {/* User avatar + menu */}
      <div className="relative px-3 pb-3" ref={ref}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {avatarText}
          </div>
          <div className="text-left leading-tight flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user.isGuest ? '游客体验' : user.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.isGuest ? '游客模式' : user.role}</div>
          </div>
          <Icon name="chevron" className={`w-4 h-4 text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute bottom-[72px] left-3 right-3 bg-white rounded-xl shadow-raised border border-slate-200 overflow-hidden z-20">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-semibold text-slate-800">{user.isGuest ? '游客体验' : user.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{user.enterprise}</div>
            </div>
            <div className="px-4 py-3 space-y-2.5 text-xs border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">企业空间</span>
                <span className="text-slate-700 font-medium">{user.domain}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">当前角色</span>
                <span className="text-slate-700 font-medium">{user.isGuest ? '游客' : user.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">权限说明</span>
                <span className="text-slate-700 font-medium">
                  {user.isGuest ? '仅可体验，不可发布' : '方案配置 / 上线运营'}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Icon name="logout" className="w-4 h-4" />
              退出登录
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
