import {
  Industry,
  IndustryOption,
  Capability,
  MaterialItem,
  SystemConnection,
  MapPoint,
  VoiceOption,
  ServicePlan,
  VersionRecord,
  OperationKpi,
  AlertRecord,
  RunLog,
  ChecklistItem,
  ChatMessage
} from '../types'

// ===== 行业与场景 =====
export const INDUSTRIES: IndustryOption[] = [
  {
    value: 'hotel',
    label: '酒店',
    desc: '适用于酒店大堂、客房、餐厅等场景，提供迎宾接待、住客咨询、入住/退房说明和设施介绍。',
    scenarios: ['前台接待', '设施咨询', '客房引导', '夜间值守']
  },
  {
    value: 'mall',
    label: '商场',
    desc: '适用于商场、门店、零售场景，提供商品介绍、活动讲解、商品推荐和区域带路。',
    scenarios: ['商品导购', '活动讲解', '区域带路', '售后咨询']
  },
  {
    value: 'exhibition',
    label: '展厅',
    desc: '适用于企业展厅、科技馆、博物馆，提供展品讲解、路线导览、参观接待和问答。',
    scenarios: ['展品讲解', '路线导览', '参观接待', '会议引导']
  },
  {
    value: 'reception',
    label: '迎宾',
    desc: '适用于企业前台、会议中心、政务大厅，提供访客接待、信息咨询和身份确认。',
    scenarios: ['访客接待', '信息咨询', '身份确认', '会议引导']
  }
]

export const INDUSTRY_LABEL: Record<Industry, string> = {
  hotel: '酒店',
  mall: '商场',
  exhibition: '展厅',
  reception: '迎宾'
}

// ===== 能力列表 =====
export const CAPABILITIES: Capability[] = [
  { id: 'welcome', name: '主动欢迎', desc: '识别客人靠近后主动问候，并引导对话开始。', category: '交流服务', recommended: true, defaultOn: true },
  { id: 'answer', name: '回答问题', desc: '根据已导入资料回答营业时间、价格、位置和规则。', category: '交流服务', recommended: true, defaultOn: true },
  { id: 'multi-turn', name: '多轮交流', desc: '在连续追问中保留上下文，减少重复确认。', category: '交流服务', recommended: true, defaultOn: true },
  { id: 'hotel-intro', name: '酒店介绍', desc: '介绍酒店品牌、房型、设施和前台服务流程。', category: '业务服务', recommended: true, defaultOn: true },
  { id: 'product-intro', name: '商品介绍', desc: '介绍商品或展品的卖点、价格、活动和适用人群。', category: '业务服务', recommended: false, defaultOn: false, recommendFor: '导览导购推荐' },
  { id: 'query', name: '信息查询', desc: '连接已有系统后查询会员、房态、库存或活动信息。', category: '业务服务', recommended: true, defaultOn: true },
  { id: 'recommend', name: '商品推荐', desc: '根据用户需求推荐商品、展品或活动路线。', category: '业务服务', recommended: false, defaultOn: false, recommendFor: '导览导购推荐' },
  { id: 'guide', name: '地点指引', desc: '告诉用户目标地点的位置和前往方式。', category: '行动服务', recommended: true, defaultOn: true },
  { id: 'lead', name: '带路服务', desc: '机器人带领用户前往指定地点，到达后自动返回。', category: '行动服务', recommended: false, defaultOn: false, recommendFor: '导览导购推荐' },
  { id: 'charge', name: '自动充电', desc: '电量低于阈值时自动返回充电桩，充电完成后继续服务。', category: '行动服务', recommended: true, defaultOn: true },
  { id: 'queue', name: '排队安抚', desc: '排队等候时主动安抚客人情绪并告知预计等待时间。', category: '业务服务', recommended: false, defaultOn: false },
  { id: 'human', name: '转人工提醒', desc: '无法回答或客人主动要求时呼叫人工服务。', category: '交流服务', recommended: true, defaultOn: true }
]

// ===== 资料项 (按行业) =====
export const MATERIALS: Record<Industry, MaterialItem[]> = {
  hotel: [
    { id: 'hotel-intro', name: '酒店介绍', desc: '酒店品牌故事、定位、星级、主要特色', status: 'done', size: '2.4 MB', parseResult: '解析成功，可用于机器人回答。' },
    { id: 'room-type', name: '房型信息', desc: '房型名称、面积、配置、价格区间', status: 'done', size: '1.8 MB', parseResult: '解析成功，可用于机器人回答。' },
    { id: 'facility', name: '设施信息', desc: '餐厅、健身房、会议室、停车场等设施营业时间与位置', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'faq', name: '常见问题', desc: '入住退房规则、发票、会员权益、交通指引等高频问题', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'service-flow', name: '前台服务流程', desc: '入住办理、退房、行李寄存、叫醒服务等流程说明', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'night-rule', name: '白天/夜间服务规则', desc: '夜间值班说明、安静模式、紧急联系等规则', status: 'pending', desc2: '', parseResult: '' } as MaterialItem
  ],
  mall: [
    { id: 'product-info', name: '商品资料', desc: '商品名称、分类、卖点、适用人群', status: 'done', size: '5.2 MB', parseResult: '解析成功，可用于机器人回答。' },
    { id: 'product-price', name: '商品价格', desc: '价格、促销价、会员价信息', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'product-sell', name: '商品卖点', desc: '核心卖点、推荐话术、对比优势', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'stock', name: '库存信息', desc: '库存状态、补货周期、缺货替代方案', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'promotion', name: '促销活动', desc: '满减、折扣、赠品、限时活动规则', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'faq-mall', name: '常见问题', desc: '退换货、会员、停车、营业时间等', status: 'pending', desc2: '', parseResult: '' } as MaterialItem
  ],
  exhibition: [
    { id: 'exhibit-info', name: '展品信息', desc: '展品名称、背景、亮点、讲解词', status: 'done', size: '8.1 MB', parseResult: '解析成功，可用于机器人回答。' },
    { id: 'exhibit-sell', name: '展品亮点', desc: '核心亮点、互动内容、推荐路线', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'route', name: '参观路线', desc: '推荐参观路线、时长、必看展品', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'activity', name: '活动安排', desc: '讲解时间、互动活动、专题展览', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'faq-exh', name: '常见问题', desc: '门票、导览器、拍照、寄存等', status: 'pending', desc2: '', parseResult: '' } as MaterialItem
  ],
  reception: [
    { id: 'visitor-rule', name: '访客规则', desc: '登记流程、来访时间、通行区域', status: 'done', size: '1.2 MB', parseResult: '解析成功，可用于机器人回答。' },
    { id: 'company-intro', name: '企业介绍', desc: '企业简介、组织架构、业务范围', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'meeting-room', name: '会议室信息', desc: '会议室位置、容量、设备、预约规则', status: 'pending', desc2: '', parseResult: '' } as MaterialItem,
    { id: 'faq-rec', name: '常见问题', desc: '停车、就餐、洗手间、WiFi等', status: 'pending', desc2: '', parseResult: '' } as MaterialItem
  ]
}

// ===== 系统连接 (按行业) =====
export const SYSTEMS: Record<Industry, SystemConnection[]> = {
  hotel: [
    { id: 'pms', name: '酒店管理系统', desc: '连接后可读取房态、入住流程、房务信息', connected: true, status: '连接正常' },
    { id: 'member', name: '会员系统', desc: '连接后可查询会员等级、积分、权益', connected: false, status: '点击模拟连接' },
    { id: 'ticket', name: '工单/客服系统', desc: '连接后可转接人工客服和创建工单', connected: false, status: '点击模拟连接' }
  ],
  mall: [
    { id: 'product', name: '商品系统', desc: '连接后可同步商品状态和价格', connected: true, status: '连接正常' },
    { id: 'stock', name: '库存系统', desc: '连接后可查询实时库存和到货信息', connected: false, status: '点击模拟连接' },
    { id: 'crm', name: 'CRM系统', desc: '连接后可读取用户画像和偏好', connected: false, status: '点击模拟连接' },
    { id: 'promo', name: '活动系统', desc: '连接后可同步促销活动和优惠券', connected: false, status: '点击模拟连接' }
  ],
  exhibition: [
    { id: 'exhibit-sys', name: '展品管理系统', desc: '连接后可同步展品信息和讲解内容', connected: true, status: '连接正常' },
    { id: 'ticket-sys', name: '票务系统', desc: '连接后可查询门票和预约信息', connected: false, status: '点击模拟连接' }
  ],
  reception: [
    { id: 'visitor-sys', name: '访客管理系统', desc: '连接后可登记访客和发放通行码', connected: true, status: '连接正常' },
    { id: 'meeting-sys', name: '会议预定系统', desc: '连接后可查询会议室和预约状态', connected: false, status: '点击模拟连接' }
  ]
}

// ===== 语音选项 =====
export const VOICES: VoiceOption[] = [
  { id: 'warm-female', name: '亲切稳重女声', style: '亲切、稳重', selected: true },
  { id: 'gentle-male', name: '温和礼貌男声', style: '温和、礼貌', selected: false },
  { id: 'soft-night', name: '夜间柔和女声', style: '柔和、低沉', selected: false },
  { id: 'lively-female', name: '热情活力女声', style: '热情、有活力', selected: false },
  { id: 'clear-male', name: '清晰专业男声', style: '清晰、专业', selected: false }
]

export const DEFAULT_WELCOME: Record<Industry, string> = {
  hotel: '您好，欢迎来到悦澜酒店。我可以为您介绍酒店设施、回答入住问题，也可以指引您前往目标地点。',
  mall: '您好，欢迎光临！我可以为您介绍商品、推荐好物，也可以带您前往指定区域，请问有什么可以帮您？',
  exhibition: '您好，欢迎参观！我可以为您讲解展品、推荐参观路线，也可以带您前往感兴趣的展区。',
  reception: '您好，欢迎来访！我可以帮您登记访客信息、查询会议室位置，请告诉我您需要什么帮助。'
}

// ===== 默认地图点位 =====
export const DEFAULT_POINTS: MapPoint[] = [
  { id: 'p1', name: '大堂入口', type: '入口', x: 15, y: 80 },
  { id: 'p2', name: '服务台', type: '服务点', x: 45, y: 50 },
  { id: 'p3', name: '餐厅', type: '关键地点', x: 75, y: 30 }
]

// ===== 服务方案列表 =====
export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'plan-1',
    name: '悦澜酒店前台接待',
    industry: 'hotel',
    scenario: '前台接待',
    status: 'running',
    progress: 100,
    lastModified: '刚刚',
    onlineDuration: '12天',
    serviceCount: 36,
    satisfaction: 4.7,
    currentStep: 7,
    robotId: 'RoboClaw-A01'
  },
  {
    id: 'plan-2',
    name: '星环展厅展品讲解',
    industry: 'exhibition',
    scenario: '展品讲解',
    status: 'running',
    progress: 100,
    lastModified: '昨天 16:18',
    onlineDuration: '5天',
    serviceCount: 28,
    satisfaction: 4.5,
    currentStep: 7,
    robotId: 'RoboClaw-E02'
  },
  {
    id: 'plan-3',
    name: '一层商场商品导购',
    industry: 'mall',
    scenario: '商品导购',
    status: 'abnormal',
    progress: 78,
    lastModified: '周一 09:30',
    currentStep: 5,
    robotId: 'RoboClaw-D01'
  }
]

// ===== 运营 KPI =====
export const OPERATION_KPIS: OperationKpi[] = [
  { label: '今日服务次数', value: '36', trend: [28, 32, 30, 35, 33, 38, 36] },
  { label: '接待人数', value: '128', trend: [100, 115, 108, 130, 122, 140, 128] },
  { label: '对话次数', value: '96', trend: [80, 88, 85, 92, 90, 100, 96] },
  { label: '服务完成率', value: '91', unit: '%', trend: [88, 90, 89, 92, 91, 93, 91] },
  { label: '导航成功率', value: '88', unit: '%', trend: [85, 86, 87, 88, 86, 89, 88] },
  { label: '用户满意度', value: '4.7', unit: '分', trend: [4.5, 4.6, 4.5, 4.7, 4.6, 4.8, 4.7] },
  { label: '异常次数', value: '1', trend: [3, 2, 4, 2, 1, 2, 1], alert: true }
]

// ===== 运营告警 =====
export const ALERTS: AlertRecord[] = [
  {
    id: 'a1',
    level: 'medium',
    message: '昨晚 22:15 导航任务被取消，建议检查"新品区"点位是否清晰。',
    time: '2小时前'
  }
]

// ===== 运行记录 =====
export const RUN_LOGS: RunLog[] = [
  { id: 'l1', time: '刚刚', message: '完成一次咨询服务，机器人在线，回答来源命中正常。', type: 'service' },
  { id: 'l2', time: '10分钟前', message: '机器人开始带路任务：服务台 → 餐厅，预计42秒到达。', type: 'service' },
  { id: 'l3', time: '1小时前', message: '电量低于30%，已自动返回充电桩。', type: 'service' },
  { id: 'l4', time: '2小时前', message: '导航任务取消：目的地"新品区"点位异常。', type: 'error' },
  { id: 'l5', time: '昨天 16:18', message: '版本 v1.2.0 发布上线，发布人：运营主管。', type: 'version' }
]

// ===== 版本记录 =====
export const VERSIONS: VersionRecord[] = [
  {
    id: 'v3',
    version: 'v1.2.0',
    publishedAt: '昨天 16:18',
    publisher: '运营主管',
    changes: '更新酒店介绍资料；新增"健身房开放时间"FAQ；调整欢迎语措辞。',
    isCurrent: true,
    serviceCount: 64,
    satisfaction: 4.7
  },
  {
    id: 'v2',
    version: 'v1.1.2',
    publishedAt: '7天前',
    publisher: '运营主管',
    changes: '修复餐厅点位导航路线；关闭"排队安抚"能力；音量从60调整到64。',
    isCurrent: false,
    serviceCount: 210,
    satisfaction: 4.6
  },
  {
    id: 'v1',
    version: 'v1.0.0',
    publishedAt: '12天前',
    publisher: '运营主管',
    changes: '首次发布上线。包含前台接待全部能力、酒店介绍/房型资料、3个地图点位、亲切稳重女声。',
    isCurrent: false,
    serviceCount: 180,
    satisfaction: 4.5
  }
]

// ===== 发布检查清单 =====
export function getChecklist(industry: Industry, capabilities: string[], materials: MaterialItem[], points: MapPoint[], welcomeMsg: string): ChecklistItem[] {
  const doneMaterials = materials.filter((m) => m.status === 'done').length
  return [
    { key: 'scenario', label: '业务场景', value: '已选择', passed: true, required: true },
    { key: 'capability', label: '能力配置', value: `已开启 ${capabilities.length} 项`, passed: capabilities.length > 0, required: true },
    { key: 'material', label: '业务资料', value: `${doneMaterials} 项已完成`, passed: doneMaterials > 0, required: true },
    { key: 'map', label: '空间配置', value: `已设置 ${points.length} 个地点`, passed: points.length > 0, required: industry !== 'hotel' },
    { key: 'voice', label: '欢迎语', value: welcomeMsg ? '已配置' : '未配置', passed: !!welcomeMsg, required: true }
  ]
}

// ===== 聊天测试预设 =====
export const CHAT_PRESETS: Record<string, string[]> = {
  hotel: ['早餐在哪里？', '几点退房？', '健身房开放吗？', '餐厅怎么走？', '现在能办理入住吗？', '夜间有前台服务吗？'],
  mall: ['有什么新品？', '帮我推荐适合送礼的商品', '今天有什么活动？', '带我去智能家居区', '这个商品多少钱？'],
  exhibition: ['这个展品有什么亮点？', '参观路线是什么？', '带我去科技展区', '今天有讲解活动吗？', '出口怎么走？'],
  reception: ['我要登记访客', '会议室在哪里？', '怎么连WiFi？', '停车怎么收费？', '帮我联系王经理']
}

export const CHAT_RESPONSES: Record<string, { text: string; source?: string; route?: string }> = {
  '早餐在哪里？': { text: '早餐厅位于二楼，开放时间为早上7点到10点。我可以为您指引路线。', source: '设施信息', route: '服务台 → 餐厅' },
  '几点退房？': { text: '退房时间为中午12点。如需延迟退房，请联系前台或拨打内线8000。', source: '常见问题' },
  '健身房开放吗？': { text: '健身房位于三楼，全天24小时开放，刷房卡即可进入。', source: '设施信息' },
  '餐厅怎么走？': { text: '餐厅在二楼，从大堂乘坐电梯上二楼右转即到。我可以带您前往。', source: '设施信息', route: '大堂入口 → 餐厅' },
  '现在能办理入住吗？': { text: '可以，前台现在可以为您办理入住。请出示身份证和预订信息。', source: '前台服务流程' },
  '夜间有前台服务吗？': { text: '夜间22:00后前台转为无人值守模式，您可通过机器人办理入住、咨询或联系值班人员。', source: '夜间服务规则' },
  '有什么新品？': { text: '本周新品有智能音箱Pro、无线降噪耳机和便携咖啡机，都在一楼新品区，我可以带您去看看。', source: '商品资料', route: '入口 → 新品区' },
  '帮我推荐适合送礼的商品': { text: '根据您的需求，推荐智能音箱Pro礼盒版，包装精美、适合商务送礼，原价899元，活动价799元。', source: '商品资料' },
  '今天有什么活动？': { text: '今天一楼中庭有品牌日满减活动，满500减50；二楼有会员专属抽奖。', source: '促销活动' },
  '带我去智能家居区': { text: '智能家居区在一楼B区，我来带您过去，大约需要1分钟。', source: '空间配置', route: '入口 → 智能家居区' },
  '这个展品有什么亮点？': { text: '这件展品是2026年最新研发的仿生机械臂，亮点是13自由度灵巧手和0.1mm精度力反馈，您可以体验一下互动演示。', source: '展品信息' },
  '参观路线是什么？': { text: '推荐路线：入口 → 科技展区 → 互动体验区 → 产品展示区 → 出口，全程约40分钟。我可以为您带路。', source: '参观路线', route: '入口 → 科技展区' },
  '带我去科技展区': { text: '科技展区在二楼左侧，跟我来，大约需要2分钟到达。', source: '空间配置', route: '入口 → 科技展区' },
  '我要登记访客': { text: '好的，请告诉我您要拜访的部门或人员姓名，我来帮您登记并发放访客码。', source: '访客规则' },
  '会议室在哪里？': { text: '会议室在三楼，A区301-305为小型会议室，B区306-310为大型会议室。请告诉我您要去的会议室编号。', source: '会议室信息' }
}

export function getChatResponse(question: string): { text: string; source?: string; route?: string } {
  // 精确匹配
  if (CHAT_RESPONSES[question]) return CHAT_RESPONSES[question]
  // 模糊匹配
  for (const key of Object.keys(CHAT_RESPONSES)) {
    if (question.includes(key) || key.includes(question)) return CHAT_RESPONSES[key]
  }
  // 默认回复
  return {
    text: '这个问题我暂时无法回答，可能需要补充相关业务资料。您可以尝试上传更多资料，或联系技术支持。',
    source: '未命中'
  }
}

// ===== 机器人设备 =====
export const ROBOTS = [
  { id: 'RoboClaw-A01', name: 'RoboClaw-A01', location: '悦澜酒店大堂', status: 'online' },
  { id: 'RoboClaw-A02', name: 'RoboClaw-A02', location: '悦澜酒店餐厅', status: 'online' },
  { id: 'RoboClaw-D01', name: 'RoboClaw-D01', location: '一层商场入口', status: 'warning' },
  { id: 'RoboClaw-E02', name: 'RoboClaw-E02', location: '星环展厅', status: 'online' }
]
