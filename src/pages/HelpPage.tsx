import React, { useState } from 'react'
import { Icon } from '../components/shared/Icon'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'

export function HelpPage() {
  const [modal, setModal] = useState<'example' | 'sample' | 'contact' | null>(null)

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <span className="text-xs text-slate-400">RoboClaw 机器人服务管理平台</span>
          <h1 className="text-lg font-semibold text-slate-800">帮助支持</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            运行中
          </span>
          <span className="text-sm text-slate-600">运营主管</span>
        </div>
      </div>

      <div className="p-8 max-w-[1200px] mx-auto space-y-6">
        {/* Intro banner */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Icon name="help" className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">遇到问题时从这里继续</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                面向非技术运营人员，提供流程示例、资料样表、常见问题和技术支持入口，帮助你快速理解配置流程和解决问题。
              </p>
            </div>
          </div>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6" hover>
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
              <Icon name="book" className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">流程示例</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              查看酒店、商场、展厅和迎宾行业的推荐配置方式，了解每个步骤的具体操作。
            </p>
            <Button variant="outline" size="sm" onClick={() => setModal('example')}>
              查看示例
            </Button>
          </Card>

          <Card className="p-6" hover>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
              <Icon name="file" className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">资料样表</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              按照业务场景准备酒店资料、商品资料、常见问题和点位信息，确保资料格式正确。
            </p>
            <Button variant="outline" size="sm" onClick={() => setModal('sample')}>
              查看样表
            </Button>
          </Card>

          <Card className="p-6" hover>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
              <Icon name="phone" className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">联系支持</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              找不到合适业务场景、资料解析失败或发布受阻时，可以联系技术支持获取帮助。
            </p>
            <Button size="sm" onClick={() => setModal('contact')}>
              联系技术支持
            </Button>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">常见问题</h3>
          <div className="space-y-4">
            {[
              { q: '机器人为什么没有回答我的问题？', a: '可能是因为对应的业务资料尚未上传完成，或者问题不在已配置的 FAQ 范围内。请先检查「上传业务资料」步骤的资料状态。' },
              { q: '地图上的地点为什么不能导航？', a: '请确保地图上至少有两个地点，并点击「测试路线」验证路线可达。如果仍有问题，建议检查地点类型是否设置正确。' },
              { q: '发布后如何修改配置？', a: '在「上线运营」>「版本管理」中可以查看历史版本，并通过「恢复版本」回退到历史配置，也可以在「方案配置」中编辑当前方案后重新发布。' },
              { q: '游客模式和正常登录有什么区别？', a: '游客模式可以体验完整的配置流程和测试功能，但无法真实发布上线。如需正式部署机器人服务，请使用企业账号登录。' }
            ].map((item, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="text-sm font-semibold text-slate-700 mb-1.5">{item.q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={modal === 'example'} onClose={() => setModal(null)} title="流程示例" width="max-w-lg">
        <div className="space-y-3 text-sm text-slate-600">
          <p>以下为各行业的推荐配置流程概览：</p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">酒店 · 前台接待</div>
              <div className="text-xs">选择酒店 → 前台接待 → 开启欢迎/问答/酒店介绍 → 上传酒店介绍/房型/FAQ → 设置大堂/前台/餐厅点位 → 配置亲切稳重女声 → 测试发布后上线</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">商场 · 商品导购</div>
              <div className="text-xs">选择商场 → 商品导购 → 开启商品介绍/推荐/带路 → 上传商品资料/价格/FAQ → 设置入口/商品区/收银台 → 配置热情活力女声 → 测试发布后上线</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">展厅 · 展品讲解</div>
              <div className="text-xs">选择展厅 → 展品讲解 → 开启欢迎/展品介绍/路线导览 → 上传展品信息/路线 → 设置入口/展区/出口 → 配置清晰专业男声 → 测试发布后上线</div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'sample'} onClose={() => setModal(null)} title="资料样表" width="max-w-lg">
        <div className="space-y-3 text-sm text-slate-600">
          <p>各场景需要准备的核心资料如下：</p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">酒店资料</div>
              <div className="text-xs">酒店介绍（品牌、定位、特色）、房型信息、设施信息（餐厅/健身房/会议室）、入住/退房规则、常见问题（FAQ）</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">导购资料</div>
              <div className="text-xs">商品资料（名称、分类、卖点）、商品价格、商品卖点话术、库存信息、促销活动规则、常见问题</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">展厅资料</div>
              <div className="text-xs">展品信息（名称、背景、亮点）、展品卖点、参观路线、活动安排、常见问题</div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'contact'} onClose={() => setModal(null)} title="联系技术支持" width="max-w-sm">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Icon name="mail" className="w-5 h-5 text-brand-600" />
            <div>
              <div className="text-xs text-slate-500">邮箱</div>
              <div className="text-slate-800 font-medium">support@roboclaw.cn</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Icon name="phone" className="w-5 h-5 text-brand-600" />
            <div>
              <div className="text-xs text-slate-500">电话</div>
              <div className="text-slate-800 font-medium">400-888-8888</div>
            </div>
          </div>
          <p className="text-slate-500 text-xs">
            工作日 9:00-18:00 在线响应，非工作时间请留言，我们会在 24 小时内回复。
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default HelpPage
