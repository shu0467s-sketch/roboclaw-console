import {
  Industry,
  IndustryOption,
  Capability,
  KnowledgeFormSection,
  SystemConnection,
  MapPoint,
  VoiceOption,
  ServicePlan,
  VersionRecord,
  OperationKpi,
  AlertRecord,
  RunLog,
  ChecklistItem,
  CollaborativeRobot
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
// 默认能力（isDefault: true）不可关闭；可调能力可由用户开关
export const CAPABILITIES: Capability[] = [
  // --- 默认能力 ---
  { id: 'welcome', name: '主动欢迎', desc: '识别客人靠近后主动问候，引导对话开始。', category: '交流服务', recommended: true, defaultOn: true, isDefault: true },
  { id: 'answer', name: '基础问答', desc: '根据已配置的知识库回答营业时间、价格、位置和规则。', category: '交流服务', recommended: true, defaultOn: true, isDefault: true },
  { id: 'multi-turn', name: '多轮交流', desc: '在连续追问中保留上下文，减少重复确认。', category: '交流服务', recommended: true, defaultOn: true, isDefault: true },
  { id: 'kb-answer', name: '知识库回答', desc: '优先从知识库配置内容中提取准确回答。', category: '业务服务', recommended: true, defaultOn: true, isDefault: true },
  { id: 'safety', name: '安全兜底回复', desc: '无法回答时礼貌告知并引导联系人工，避免胡乱回答。', category: '交流服务', recommended: true, defaultOn: true, isDefault: true },
  // --- 可调能力 ---
  { id: 'guide', name: '地点指引', desc: '告诉客人目标地点的位置和前往方式。', category: '行动服务', recommended: true, defaultOn: true },
  { id: 'lead', name: '带路服务', desc: '机器人带领客人前往指定地点，到达后自动返回。', category: '行动服务', recommended: false, defaultOn: false, recommendFor: '导览导购推荐' },
  { id: 'recommend', name: '商品推荐', desc: '根据客人需求推荐商品、展品或活动路线。', category: '业务服务', recommended: false, defaultOn: false, recommendFor: '导览导购推荐' },
  { id: 'activity', name: '活动介绍', desc: '介绍当前促销活动、专题展览或限时优惠。', category: '业务服务', recommended: false, defaultOn: false, recommendFor: '导览导购推荐' },
  { id: 'human', name: '转人工提醒', desc: '无法回答或客人主动要求时呼叫人工服务。', category: '交流服务', recommended: true, defaultOn: true },
  { id: 'queue', name: '排队安抚', desc: '排队等候时主动安抚客人情绪并告知预计等待时间。', category: '业务服务', recommended: false, defaultOn: false },
  { id: 'charge', name: '自动充电提醒', desc: '电量低于阈值时自动返回充电桩，充电完成后继续服务。', category: '行动服务', recommended: true, defaultOn: true }
]

// 需要空间配置的能力
export const SPACE_RELATED_CAPABILITIES = ['guide', 'lead']

// ===== 知识库表单定义 (按行业) =====
export const KNOWLEDGE_FORMS: Record<Industry, KnowledgeFormSection[]> = {
  hotel: [
    {
      id: 'hotel-basic',
      title: '酒店基础信息',
      desc: '酒店名称、品牌、地址等基础资料',
      fields: [
        { key: 'hotelName', label: '酒店名称', type: 'text', placeholder: '如：悦澜酒店', required: true },
        { key: 'starLevel', label: '酒店星级', type: 'select', options: ['五星', '四星', '三星', '精品酒店', '经济型'] },
        { key: 'address', label: '酒店地址', type: 'text', placeholder: '详细地址' },
        { key: 'phone', label: '联系电话', type: 'text', placeholder: '如：0571-88888000', required: true },
        { key: 'intro', label: '酒店简介', type: 'textarea', placeholder: '品牌故事、定位、主要特色' }
      ]
    },
    {
      id: 'room-type',
      title: '房型信息',
      desc: '房型名称、床型、面积、价格等',
      fields: [
        { key: 'roomName', label: '房型名称', type: 'text', placeholder: '如：豪华大床房' },
        { key: 'bedType', label: '床型', type: 'select', options: ['单人床', '双人床', '大床', '双人标间', '套房'] },
        { key: 'area', label: '面积', type: 'number', unit: '㎡' },
        { key: 'breakfast', label: '是否含早餐', type: 'toggle' },
        { key: 'guestCount', label: '可住人数', type: 'select', options: ['1人', '2人', '3人', '4人'] },
        { key: 'nonSmoking', label: '是否禁烟', type: 'toggle' },
        { key: 'priceRange', label: '价格区间', type: 'text', placeholder: '如：380-680元/晚' }
      ]
    },
    {
      id: 'facility',
      title: '设施服务',
      desc: '健身房、餐厅、停车场等设施信息',
      fields: [
        { key: 'hasGym', label: '是否有健身房', type: 'toggle' },
        { key: 'gymTime', label: '健身房开放时间', type: 'conditional', conditionKey: 'hasGym', placeholder: '如：06:00-22:00' },
        { key: 'gymFloor', label: '健身房所在楼层', type: 'conditional', conditionKey: 'hasGym' },
        { key: 'hasRestaurant', label: '是否有餐厅', type: 'toggle' },
        { key: 'restaurantTime', label: '餐厅营业时间', type: 'conditional', conditionKey: 'hasRestaurant', placeholder: '如：07:00-10:00, 11:30-14:00, 17:30-21:00' },
        { key: 'restaurantFloor', label: '餐厅所在楼层', type: 'conditional', conditionKey: 'hasRestaurant' },
        { key: 'restaurantDesc', label: '菜系/服务说明', type: 'conditional', conditionKey: 'hasRestaurant', placeholder: '如：中餐、自助餐' },
        { key: 'hasParking', label: '是否有停车场', type: 'toggle' },
        { key: 'parkingRule', label: '停车场收费规则', type: 'conditional', conditionKey: 'hasParking', placeholder: '如：免费/10元/小时' },
        { key: 'parkingEntrance', label: '停车场入口位置', type: 'conditional', conditionKey: 'hasParking' }
      ]
    },
    {
      id: 'service-time',
      title: '营业时间',
      desc: '前台服务、入住退房时间',
      fields: [
        { key: 'frontDeskTime', label: '前台服务时间', type: 'text', placeholder: '如：24小时' },
        { key: 'checkInTime', label: '入住时间', type: 'text', placeholder: '如：14:00后' },
        { key: 'checkOutTime', label: '退房时间', type: 'text', placeholder: '如：12:00前' }
      ]
    },
    {
      id: 'faq-hotel',
      title: '常见问题',
      desc: '入住退房规则、发票、会员、交通',
      fields: [
        { key: 'checkInRule', label: '入住退房规则', type: 'textarea', placeholder: '入住证件要求、退房流程等' },
        { key: 'invoiceRule', label: '发票政策', type: 'textarea', placeholder: '发票开具说明' },
        { key: 'memberRule', label: '会员权益', type: 'textarea', placeholder: '会员等级、积分、权益' },
        { key: 'trafficInfo', label: '交通指引', type: 'textarea', placeholder: '地铁、公交、自驾路线' }
      ]
    },
    {
      id: 'emergency',
      title: '紧急联系人',
      desc: '夜间值班、紧急情况联系人',
      fields: [
        { key: 'emergencyName', label: '紧急联系人姓名', type: 'text', required: true },
        { key: 'emergencyPhone', label: '联系电话', type: 'text', required: true },
        { key: 'dutyTime', label: '值班时间段', type: 'text', placeholder: '如：22:00-08:00' }
      ]
    },
    {
      id: 'service-rule',
      title: '服务规则',
      desc: '夜间服务、安静模式等特殊规则',
      fields: [
        { key: 'nightService', label: '夜间服务说明', type: 'textarea', placeholder: '夜间值班模式说明' },
        { key: 'quietTime', label: '安静模式时间', type: 'text', placeholder: '如：22:00-07:00' },
        { key: 'specialRule', label: '特殊服务说明', type: 'textarea', placeholder: '其他需要机器人遵守的规则' }
      ]
    }
  ],
  mall: [
    {
      id: 'mall-basic',
      title: '商场基础信息',
      desc: '商场名称、地址、营业时间',
      fields: [
        { key: 'mallName', label: '商场名称', type: 'text', required: true },
        { key: 'address', label: '商场地址', type: 'text' },
        { key: 'phone', label: '客服电话', type: 'text' },
        { key: 'openHours', label: '营业时间', type: 'text', placeholder: '如：10:00-22:00' },
        { key: 'intro', label: '商场简介', type: 'textarea' }
      ]
    },
    {
      id: 'product-info',
      title: '商品基础信息',
      desc: '商品名称、分类、卖点',
      fields: [
        { key: 'productName', label: '商品名称', type: 'text' },
        { key: 'category', label: '商品分类', type: 'select', options: ['服装', '数码', '美妆', '食品', '家居', '其他'] },
        { key: 'sellPoint', label: '商品卖点', type: 'textarea', placeholder: '核心卖点、推荐话术' }
      ]
    },
    {
      id: 'price-promo',
      title: '价格活动信息',
      desc: '价格、促销、会员价',
      fields: [
        { key: 'price', label: '商品价格', type: 'text', placeholder: '如：299元' },
        { key: 'promoPrice', label: '促销价', type: 'text', placeholder: '如：活动价199元' },
        { key: 'promoDesc', label: '促销活动说明', type: 'textarea', placeholder: '满减、折扣、赠品等' }
      ]
    },
    {
      id: 'stock-info',
      title: '库存状态说明',
      desc: '库存状态、补货说明',
      fields: [
        { key: 'stockStatus', label: '库存状态', type: 'select', options: ['充足', '紧张', '缺货'] },
        { key: 'restockNote', label: '补货说明', type: 'text', placeholder: '如：预计3天后到货' }
      ]
    },
    {
      id: 'faq-mall',
      title: '常见问题',
      desc: '退换货、会员、停车',
      fields: [
        { key: 'returnRule', label: '退换货政策', type: 'textarea' },
        { key: 'memberRule', label: '会员权益', type: 'textarea' },
        { key: 'parkingInfo', label: '停车信息', type: 'textarea' }
      ]
    },
    {
      id: 'service-rule-mall',
      title: '服务规则',
      desc: '特殊服务说明',
      fields: [
        { key: 'specialRule', label: '特殊服务说明', type: 'textarea', placeholder: '其他需要机器人遵守的规则' }
      ]
    }
  ],
  exhibition: [
    {
      id: 'exh-basic',
      title: '展厅基础信息',
      desc: '展厅名称、地址、开放时间',
      fields: [
        { key: 'exhName', label: '展厅名称', type: 'text', required: true },
        { key: 'address', label: '展厅地址', type: 'text' },
        { key: 'openHours', label: '开放时间', type: 'text', placeholder: '如：09:00-17:00' },
        { key: 'intro', label: '展厅简介', type: 'textarea' }
      ]
    },
    {
      id: 'exhibit-info',
      title: '展品基础信息',
      desc: '展品名称、背景、亮点',
      fields: [
        { key: 'exhibitName', label: '展品名称', type: 'text' },
        { key: 'category', label: '展品分类', type: 'select', options: ['科技', '历史', '艺术', '自然', '其他'] },
        { key: 'highlight', label: '展品亮点', type: 'textarea', placeholder: '核心亮点、互动内容' }
      ]
    },
    {
      id: 'route-info',
      title: '推荐路线',
      desc: '参观路线、时长、必看展品',
      fields: [
        { key: 'routeName', label: '路线名称', type: 'text', placeholder: '如：经典路线' },
        { key: 'duration', label: '参观时长', type: 'text', placeholder: '如：约40分钟' },
        { key: 'routeDesc', label: '路线说明', type: 'textarea', placeholder: '推荐参观顺序和必看展品' }
      ]
    },
    {
      id: 'activity-exh',
      title: '活动信息',
      desc: '讲解时间、互动活动',
      fields: [
        { key: 'schedule', label: '讲解时间', type: 'text', placeholder: '如：10:00, 14:00, 16:00' },
        { key: 'activityDesc', label: '活动说明', type: 'textarea' }
      ]
    },
    {
      id: 'faq-exh',
      title: '常见问题',
      desc: '门票、导览器、拍照',
      fields: [
        { key: 'ticketInfo', label: '门票信息', type: 'textarea' },
        { key: 'guideInfo', label: '导览器说明', type: 'textarea' },
        { key: 'photoRule', label: '拍照规则', type: 'textarea' }
      ]
    },
    {
      id: 'service-rule-exh',
      title: '服务规则',
      desc: '特殊服务说明',
      fields: [
        { key: 'specialRule', label: '特殊服务说明', type: 'textarea' }
      ]
    }
  ],
  reception: [
    {
      id: 'company-info',
      title: '企业信息',
      desc: '企业简介、组织架构',
      fields: [
        { key: 'companyName', label: '企业名称', type: 'text', required: true },
        { key: 'address', label: '企业地址', type: 'text' },
        { key: 'intro', label: '企业简介', type: 'textarea' }
      ]
    },
    {
      id: 'visitor-rule',
      title: '访客规则',
      desc: '登记流程、来访时间、通行区域',
      fields: [
        { key: 'registerFlow', label: '登记流程', type: 'textarea', placeholder: '访客登记步骤' },
        { key: 'visitTime', label: '来访时间', type: 'text', placeholder: '如：09:00-18:00' },
        { key: 'accessArea', label: '通行区域', type: 'textarea', placeholder: '允许访客进入的区域' }
      ]
    },
    {
      id: 'meeting-room',
      title: '会议室信息',
      desc: '会议室位置、容量、设备',
      fields: [
        { key: 'roomName', label: '会议室名称', type: 'text', placeholder: '如：301会议室' },
        { key: 'capacity', label: '容纳人数', type: 'select', options: ['6人', '10人', '20人', '50人', '100人以上'] },
        { key: 'equipment', label: '设备配置', type: 'text', placeholder: '如：投影、音响、白板' },
        { key: 'floor', label: '所在楼层', type: 'text' }
      ]
    },
    {
      id: 'faq-rec',
      title: '常见问题',
      desc: '停车、就餐、WiFi',
      fields: [
        { key: 'parkingInfo', label: '停车信息', type: 'textarea' },
        { key: 'diningInfo', label: '就餐信息', type: 'textarea' },
        { key: 'wifiInfo', label: 'WiFi信息', type: 'text', placeholder: '如：Guest-WiFi / 密码12345678' }
      ]
    },
    {
      id: 'service-rule-rec',
      title: '服务规则',
      desc: '特殊服务说明',
      fields: [
        { key: 'specialRule', label: '特殊服务说明', type: 'textarea' }
      ]
    }
  ]
}

// ===== 已连接系统 (按行业) =====
export const SYSTEMS: Record<Industry, SystemConnection[]> = {
  hotel: [
    { id: 'pms', name: '酒店管理系统', desc: '已连接，可读取房态、入住流程、房务信息', connected: true, status: '连接正常', lastSync: '5分钟前' },
    { id: 'member', name: '会员系统', desc: '已连接，可查询会员等级、积分、权益', connected: true, status: '连接正常', lastSync: '12分钟前' },
    { id: 'ticket', name: '工单/客服系统', desc: '待连接', connected: false, status: '未连接' }
  ],
  mall: [
    { id: 'product', name: '商品管理系统', desc: '已连接，可同步商品状态和价格', connected: true, status: '连接正常', lastSync: '3分钟前' },
    { id: 'stock', name: '库存系统', desc: '已连接，可查询实时库存', connected: true, status: '连接正常', lastSync: '8分钟前' },
    { id: 'crm', name: 'CRM系统', desc: '待连接', connected: false, status: '未连接' },
    { id: 'promo', name: '活动系统', desc: '待连接', connected: false, status: '未连接' }
  ],
  exhibition: [
    { id: 'exhibit-sys', name: '展品管理系统', desc: '已连接，可同步展品信息和讲解内容', connected: true, status: '连接正常', lastSync: '6分钟前' },
    { id: 'ticket-sys', name: '票务系统', desc: '待连接', connected: false, status: '未连接' }
  ],
  reception: [
    { id: 'visitor-sys', name: '访客管理系统', desc: '已连接，可登记访客和发放通行码', connected: true, status: '连接正常', lastSync: '2分钟前' },
    { id: 'meeting-sys', name: '会议预定系统', desc: '已连接，可查询会议室和预约状态', connected: true, status: '连接正常', lastSync: '10分钟前' }
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

export const VOICE_RECOMMEND: Record<Industry, string> = {
  hotel: '亲切、稳重',
  mall: '热情、有活力',
  exhibition: '清晰、专业',
  reception: '礼貌、自然'
}

// ===== 默认地图点位 =====
export const DEFAULT_POINTS: MapPoint[] = [
  { id: 'p1', name: '大堂入口', type: '入口', x: 15, y: 80 },
  { id: 'p2', name: '服务台', type: '服务点', x: 45, y: 50 },
  { id: 'p3', name: '餐厅', type: '关键地点', x: 75, y: 30 }
]

// ===== 多机器人协同 =====
export const COLLABORATIVE_ROBOTS: CollaborativeRobot[] = [
  { id: 'RoboClaw-A01', name: 'RoboClaw-A01', location: '悦澜酒店大堂', status: 'online', currentPlan: '前台接待', selected: false },
  { id: 'RoboClaw-A02', name: 'RoboClaw-A02', location: '悦澜酒店餐厅', status: 'online', currentPlan: '未配置', selected: false },
  { id: 'RoboClaw-A03', name: 'RoboClaw-A03', location: '悦澜酒店三楼', status: 'busy', currentPlan: '设施咨询', selected: false }
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
    currentStep: 4,
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
    currentStep: 4,
    robotId: 'RoboClaw-E02'
  },
  {
    id: 'plan-3',
    name: '一层商场商品导购',
    industry: 'mall',
    scenario: '商品导购',
    status: 'abnormal',
    progress: 75,
    lastModified: '周一 09:30',
    currentStep: 3,
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
export function getChecklist(
  scenario: string,
  capabilities: string[],
  knowledgeForms: { status: string }[],
  points: { length: number },
  welcomeMsg: string,
  hasSpaceCapability: boolean,
  chatTested: boolean
): ChecklistItem[] {
  const doneForms = knowledgeForms.filter((f) => f.status === 'done').length
  const draftForms = knowledgeForms.filter((f) => f.status === 'draft').length
  return [
    { key: 'scenario', label: '业务场景', value: scenario ? '已选择' : '未选择', passed: !!scenario, required: true },
    { key: 'knowledge', label: '知识库配置', value: `${doneForms} 项已完成${draftForms > 0 ? `，${draftForms} 项填写中` : ''}`, passed: doneForms > 0, required: true },
    { key: 'capability', label: '能力配置', value: `已开启 ${capabilities.length} 项`, passed: capabilities.length > 0, required: true },
    { key: 'space', label: '空间配置', value: hasSpaceCapability ? `已设置 ${points.length} 个地点` : '未启用带路/地点指引，无需配置', passed: !hasSpaceCapability || points.length > 0, required: hasSpaceCapability },
    { key: 'voice', label: '语音配置', value: welcomeMsg ? '已配置' : '未配置', passed: !!welcomeMsg, required: true },
    { key: 'test', label: '测试验证', value: chatTested ? '已测试' : '未测试', passed: chatTested, required: false }
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
  '早餐在哪里？': { text: '早餐厅位于二楼，开放时间为早上7点到10点。我可以为您指引路线。', source: '设施服务', route: '服务台 → 餐厅' },
  '几点退房？': { text: '退房时间为中午12点。如需延迟退房，请联系前台或拨打内线8000。', source: '营业时间' },
  '健身房开放吗？': { text: '健身房位于三楼，全天24小时开放，刷房卡即可进入。', source: '设施服务' },
  '餐厅怎么走？': { text: '餐厅在二楼，从大堂乘坐电梯上二楼右转即到。我可以带您前往。', source: '设施服务', route: '大堂入口 → 餐厅' },
  '现在能办理入住吗？': { text: '可以，前台现在可以为您办理入住。请出示身份证和预订信息。', source: '服务规则' },
  '夜间有前台服务吗？': { text: '夜间22:00后前台转为无人值守模式，您可通过机器人办理入住、咨询或联系值班人员。', source: '服务规则' },
  '有什么新品？': { text: '本周新品有智能音箱Pro、无线降噪耳机和便携咖啡机，都在一楼新品区，我可以带您去看看。', source: '商品基础信息', route: '入口 → 新品区' },
  '帮我推荐适合送礼的商品': { text: '根据您的需求，推荐智能音箱Pro礼盒版，包装精美、适合商务送礼，原价899元，活动价799元。', source: '商品基础信息' },
  '今天有什么活动？': { text: '今天一楼中庭有品牌日满减活动，满500减50；二楼有会员专属抽奖。', source: '价格活动信息' },
  '带我去智能家居区': { text: '智能家居区在一楼B区，我来带您过去，大约需要1分钟。', source: '空间配置', route: '入口 → 智能家居区' },
  '这个展品有什么亮点？': { text: '这件展品是2026年最新研发的仿生机械臂，亮点是13自由度灵巧手和0.1mm精度力反馈，您可以体验一下互动演示。', source: '展品基础信息' },
  '参观路线是什么？': { text: '推荐路线：入口 → 科技展区 → 互动体验区 → 产品展示区 → 出口，全程约40分钟。我可以为您带路。', source: '推荐路线', route: '入口 → 科技展区' },
  '带我去科技展区': { text: '科技展区在二楼左侧，跟我来，大约需要2分钟到达。', source: '空间配置', route: '入口 → 科技展区' },
  '我要登记访客': { text: '好的，请告诉我您要拜访的部门或人员姓名，我来帮您登记并发放访客码。', source: '访客规则' },
  '会议室在哪里？': { text: '会议室在三楼，A区301-305为小型会议室，B区306-310为大型会议室。请告诉我您要去的会议室编号。', source: '会议室信息' }
}

export function getChatResponse(question: string): { text: string; source?: string; route?: string } {
  if (CHAT_RESPONSES[question]) return CHAT_RESPONSES[question]
  for (const key of Object.keys(CHAT_RESPONSES)) {
    if (question.includes(key) || key.includes(question)) return CHAT_RESPONSES[key]
  }
  return {
    text: '这个问题我暂时无法回答，可能需要补充相关知识库信息。您可以尝试完善知识库配置，或联系技术支持。',
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
