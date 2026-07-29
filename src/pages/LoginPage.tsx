import React, { useState } from 'react'
import { Icon } from '../components/shared/Icon'
import { Logo } from '../components/shared/Logo'
import { STEP_LABELS } from '../components/shared/Stepper'

interface LoginPageProps {
  onLogin: (guest: boolean) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'account' | 'sms'>('account')
  const [domain, setDomain] = useState('hotel-demo.roboclaw.cn')
  const [account, setAccount] = useState('运营主管')
  const [password, setPassword] = useState('roboclaw123')
  const [phone, setPhone] = useState('138 0000 0000')
  const [code, setCode] = useState('')
  const [sentCode, setSentCode] = useState(false)

  const canSubmit = mode === 'account' ? domain && account && password : domain && phone && code.length === 6

  return (
    <div className="min-h-screen w-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[56%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003a97 0%, #0058f5 60%, #1e6bff 100%)' }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px, 64px 64px'
        }} />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(88,212,255,0.25) 0%, transparent 70%)' }} />
        <div className="absolute -left-16 bottom-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,197,44,0.18) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <Logo size={44} />
          <div>
            <div className="text-white font-bold text-xl tracking-wide">RoboClaw</div>
            <div className="text-brand-200 text-xs">旋玑智能 · VoxInsight 客户端</div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative max-w-xl">
          <h1 className="text-white text-[34px] font-bold leading-tight mb-4">
            新建和管理机器人服务
          </h1>
          <p className="text-brand-100 text-base leading-relaxed mb-8">
            面向酒店、商场、展厅等场景的一线运营人员，提供从行业选择到上线运营的统一配置流程，无需技术背景即可完成机器人服务搭建。
          </p>
          <div className="flex flex-wrap gap-2">
            {STEP_LABELS.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-white text-xs font-medium border border-white/15">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i + 1}</span>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-brand-200/70 text-xs">
          © 2026 旋玑智能 · RoboClaw 机器人服务管理平台
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <Logo size={40} />
            <div className="text-slate-800 font-bold text-xl">RoboClaw</div>
          </div>

          <div className="bg-white rounded-2xl shadow-raised border border-slate-100 p-8">
            <div className="mb-6">
              <div className="text-xs text-slate-400 mb-1">企业空间</div>
              <h2 className="text-2xl font-bold text-slate-800">登录 RoboClaw</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">企业域名</label>
                <div className="relative">
                  <Icon name="globe" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="input pl-9"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="your-company.roboclaw.cn"
                  />
                </div>
              </div>

              {/* Mode tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setMode('account')}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'account' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
                >
                  账号登录
                </button>
                <button
                  onClick={() => setMode('sms')}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'sms' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
                >
                  验证码登录
                </button>
              </div>

              {mode === 'account' ? (
                <>
                  <div>
                    <label className="label">企业账号</label>
                    <div className="relative">
                      <Icon name="user" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input className="input pl-9" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="请输入账号" />
                    </div>
                  </div>
                  <div>
                    <label className="label">登录密码</label>
                    <div className="relative">
                      <Icon name="lock" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="password" className="input pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">手机号</label>
                    <div className="relative">
                      <Icon name="phone" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input className="input pl-9" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" />
                    </div>
                  </div>
                  <div>
                    <label className="label">验证码</label>
                    <div className="flex gap-2">
                      <input className="input flex-1" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6位验证码" />
                      <button
                        onClick={() => setSentCode(true)}
                        disabled={sentCode}
                        className="btn-outline whitespace-nowrap"
                      >
                        {sentCode ? '已发送' : '获取验证码'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => onLogin(false)}
                disabled={!canSubmit}
                className="btn-primary w-full py-2.5 text-base mt-2"
              >
                进入后台
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">或</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <button
                onClick={() => onLogin(true)}
                className="btn-white w-full py-2.5"
              >
                <Icon name="eye" className="w-4 h-4" />
                游客体验
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6 text-xs text-slate-400">
              <button className="hover:text-brand-600">忘记密码</button>
              <span>·</span>
              <button className="hover:text-brand-600">联系管理员</button>
              <span>·</span>
              <button className="hover:text-brand-600">查看企业域名示例</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
