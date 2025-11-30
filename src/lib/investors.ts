import elonImage from '../assets/investor/elon_musk.jpg';
import shenImage from '../assets/investor/shennanpeng.webp';
import xuImage from '../assets/investor/xuxiaoping.jpg';
import zhangImage from '../assets/investor/zhanglei.png';
import paulImage from '../assets/investor/paul_graham.jpg';
import xiongImage from '../assets/investor/xiongxiaoge.jpg';
import maImage from '../assets/investor/mahuateng.jpg';

export interface Investor {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  image: string;
  style: string;
  description: string;
  color: string;
  email?: string;
}

export const INVESTORS: Investor[] = [
  { 
    id: 'elon', 
    name: 'Elon Musk', 
    role: '第一性原理导师', 
    company: 'Tesla / SpaceX',
    avatar: '🚀', 
    image: elonImage,
    style: '直击本质，物理学思维，关注数量级提升',
    description: '“我不在乎你的商业模式，我只关心这是否符合物理学定律。如果这在物理上是可能的，那就去做。” —— 关注硬科技、能源、太空与人类未来。',
    color: 'from-blue-600 to-indigo-900',
    email: 'elon@tesla.com'
  },
  { 
    id: 'sequoia', 
    name: '沈南鹏', 
    role: '全球执行合伙人', 
    company: '红杉中国',
    avatar: '🌲', 
    image: shenImage,
    style: '赛道赌手，关注市场天花板，唯快不破',
    description: '“Buy the track, not just the horse.” —— 专注于TMT、医疗健康、消费升级领域的赛道布局，寻找能够成为行业巨头的企业。',
    color: 'from-green-600 to-emerald-900',
    email: 'nanpeng@sequoiacap.com'
  },
  { 
    id: 'zhenfund', 
    name: '徐小平', 
    role: '创始人', 
    company: '真格基金',
    avatar: '💸', 
    image: xuImage,
    style: '关注创始团队特质，投人哲学，寻找独角兽',
    description: '“天使投资就是投人。我看重你的眼神、你的激情、你是否具备一种无法被击败的创业基因。” —— 寻找年轻、有梦想、有野心的创业者。',
    color: 'from-red-500 to-orange-600',
    email: 'xu@zhenfund.com'
  },
  { 
    id: 'hillhouse', 
    name: '张磊', 
    role: '创始人', 
    company: '高瓴资本',
    avatar: '⛰️', 
    image: zhangImage,
    style: '做时间的朋友，护城河，长期价值创造',
    description: '“流水不争先，争的是滔滔不绝。” —— 坚持长期主义，寻找具有宽阔护城河和长期复利效应的伟大企业。',
    color: 'from-blue-500 to-cyan-700',
    email: 'lei@hillhousecap.com'
  },
  { 
    id: 'ycombinator', 
    name: 'Paul Graham', 
    role: '创始人', 
    company: 'Y Combinator',
    avatar: '🔥', 
    image: paulImage,
    style: 'Make something people want，快速迭代，增长黑客',
    description: '“Live in the future, then build what\'s missing.” —— 关注产品是否真正解决了用户痛点，是否具备指数级增长的潜力。',
    color: 'from-orange-500 to-red-600',
    email: 'paul@ycombinator.com'
  },
  { 
    id: 'idg', 
    name: '熊晓鸽', 
    role: '全球董事长', 
    company: 'IDG资本',
    avatar: '🏛️', 
    image: xiongImage,
    style: '全球视野，本土经验，关注技术驱动',
    description: '“既要懂中国，又要懂世界。” —— 中国风投拓荒者，关注硬科技、企业服务与文化产业的结合。',
    color: 'from-blue-800 to-indigo-900',
    email: 'xiaoge@idgcapital.com'
  },
  { 
    id: 'tencent', 
    name: '马化腾', 
    role: '创始人', 
    company: '腾讯投资',
    avatar: '🐧', 
    image: maImage,
    style: '流量生态，连接一切，关注产品体验',
    description: '“在互联网时代，谁掌握了连接，谁就掌握了未来。” —— 关注互联网基础设施、数字内容与产业互联网。',
    color: 'from-blue-500 to-blue-700',
    email: 'pony@tencent.com'
  }
];
