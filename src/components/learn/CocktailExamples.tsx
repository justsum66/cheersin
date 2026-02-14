'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Award, ShoppingCart, Flame } from 'lucide-react';

interface CocktailExample {
  id: string;
  name: string;
  originalName: string;
  category: '經典' | '現代' | '熱帶' | '古典' | '創意' | '地區特色';
  baseSpirit: string;
  ingredients: string[];
  garnish: string;
  preparation: string;
  glassware: string;
  strength: '輕盈' | '中等' | '濃烈';
  complexity: '簡單' | '中等' | '複雜';
  flavorProfile: string[];
  occasion: string[];
  rating: number;
  price: number;
  description: string;
  origin: string;
  popularity: number;
  isOnProwine: boolean;
  prowineUrl?: string;
  tags: string[];
  availability: '普遍' | '地區性' | '限量' | '季節性';
  servingTemp: string;
  history: string;
  funFact: string;
}

const COCKTAIL_EXAMPLES: CocktailExample[] = [
  {
    id: 'manhattan',
    name: '曼哈頓',
    originalName: 'Manhattan',
    category: '古典',
    baseSpirit: '黑麥威士忌',
    ingredients: ['黑麥威士忌', '甜苦艾酒', '安格斯特拉苦精'],
    garnish: '馬拉斯奇諾櫻桃',
    preparation: '將所有材料與冰塊放入調酒杯中攪拌，過濾倒入馬丁尼杯中，以櫻桃裝飾。',
    glassware: '馬丁尼杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['濃郁', '甜潤', '香料味', '複雜'],
    occasion: ['正式晚宴', '雞尾酒時光', '浪漫約會'],
    rating: 4.8,
    price: 450,
    description: '起源於19世紀末紐約曼哈頓俱樂部的經典調酒，以其濃郁複雜的風味聞名。',
    origin: '美國紐約',
    popularity: 92,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/manhattan-kit',
    tags: ['經典', '威士忌', '甜味', '苦精'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '曼哈頓調酒據說是為了紀念紐約曼哈頓俱樂部的創始人而命名，1870年代首次出現於美國酒吧。',
    funFact: '最初的曼哈頓配方使用義大利苦艾酒，後來改為甜苦艾酒。'
  },
  {
    id: 'margarita',
    name: '瑪格麗特',
    originalName: 'Margarita',
    category: '經典',
    baseSpirit: '龍舌蘭',
    ingredients: ['龍舌蘭', '橙味利口酒', '青檸汁'],
    garnish: '鹽邊、青檸角',
    preparation: '將杯緣沾濕後蘸鹽，將所有材料與冰塊放入搖酒器中搖和，過濾倒入杯中。',
    glassware: '瑪格麗特杯',
    strength: '中等',
    complexity: '中等',
    flavorProfile: ['酸甜', '清新', '柑橘', '平衡'],
    occasion: ['派對', '海灘度假', '夏日聚會'],
    rating: 4.7,
    price: 420,
    description: '墨西哥最具代表性的調酒之一，以其完美的酸甜平衡和鹽邊風味聞名。',
    origin: '墨西哥',
    popularity: 95,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/margarita-set',
    tags: ['龍舌蘭', '酸甜', '鹽邊', '清新'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '關於瑪格麗特的起源有多種說法，最流行的是為了紀念一位名叫瑪格麗特的女孩而創作。',
    funFact: '瑪格麗特是世界上最暢銷的調酒之一，每年消費量超過百萬杯。'
  },
  {
    id: 'negroni',
    name: '內格羅尼',
    originalName: 'Negroni',
    category: '經典',
    baseSpirit: '琴酒',
    ingredients: ['琴酒', '金巴利', '甜苦艾酒'],
    garnish: '橙皮',
    preparation: '將所有材料與冰塊放入岩石杯中攪拌，加入大冰塊，以橙皮裝飾。',
    glassware: '岩石杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['苦甜', '草本', '複雜', '平衡'],
    occasion: ['餐前酒', '下班放鬆', '品味時光'],
    rating: 4.6,
    price: 480,
    description: '義大利經典調酒，以其完美的苦甜平衡和草本風味聞名。',
    origin: '義大利佛羅倫斯',
    popularity: 88,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/negroni-gin',
    tags: ['琴酒', '苦甜', '草本', '餐前酒'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '1919年由義大利伯爵卡amillo Negroni要求調酒師強化他的Americano而誕生。',
    funFact: '內格羅尼的比例永遠是1:1:1，這是不可改變的調酒規則。'
  },
  {
    id: 'mojito',
    name: '莫希托',
    originalName: 'Mojito',
    category: '熱帶',
    baseSpirit: '白朗姆酒',
    ingredients: ['白朗姆酒', '青檸汁', '糖', '薄荷葉', '蘇打水'],
    garnish: '薄荷枝、青檸角',
    preparation: '在杯中搗碎薄荷葉和糖，加入青檸汁和朗姆酒，加冰攪拌，倒入蘇打水，以薄荷枝裝飾。',
    glassware: '高球杯',
    strength: '輕盈',
    complexity: '中等',
    flavorProfile: ['清新', '薄荷', '柑橘', '氣泡'],
    occasion: ['夏日派對', '海灘', '輕鬆聚會'],
    rating: 4.5,
    price: 380,
    description: '古巴最具代表性的調酒，以其清新薄荷風味和氣泡感聞名。',
    origin: '古巴哈瓦那',
    popularity: 90,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/mojito-kit',
    tags: ['朗姆酒', '薄荷', '清新', '夏日'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '起源於16世紀古巴，最初是水手們的健康飲料，後來成為世界知名的調酒。',
    funFact: '莫希托是海明威最喜歡的調酒之一，他曾在古巴的La Bodeguita del Medio酒吧留下名言。'
  },
  {
    id: 'old-fashioned',
    name: '古典',
    originalName: 'Old Fashioned',
    category: '古典',
    baseSpirit: '波本威士忌',
    ingredients: ['波本威士忌', '方糖', '水', '安格斯特拉苦精'],
    garnish: '橙皮',
    preparation: '在岩石杯中溶解方糖於水中，加入苦精，倒入威士忌和冰塊，以橙皮裝飾。',
    glassware: '岩石杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['濃郁', '甜潤', '橡木', '溫暖'],
    occasion: ['正式場合', '下班放鬆', '品味威士忌'],
    rating: 4.7,
    price: 460,
    description: '美國最古老的調酒之一，以其純粹的威士忌風味和經典調製方法聞名。',
    origin: '美國肯塔基州',
    popularity: 87,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/old-fashioned-set',
    tags: ['威士忌', '古典', '濃郁', '純粹'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '1800年代中期首次出現，被認為是最原始的調酒形式之一。',
    funFact: '古典調酒的名稱是因為調酒師需要用這種方式來"調和"劣質威士忌的味道。'
  },
  {
    id: 'cosmopolitan',
    name: '都會',
    originalName: 'Cosmopolitan',
    category: '現代',
    baseSpirit: '伏特加',
    ingredients: ['伏特加', '蔓越莓汁', '青檸汁', '君度橙酒'],
    garnish: '青檸片',
    preparation: '將所有材料與冰塊放入搖酒器中搖和，過濾倒入馬丁尼杯中，以青檸片裝飾。',
    glassware: '馬丁尼杯',
    strength: '中等',
    complexity: '中等',
    flavorProfile: ['酸甜', '果味', '清新', '女性化'],
    occasion: ['女孩之夜', '時尚派對', '都市生活'],
    rating: 4.4,
    price: 430,
    description: '1970年代調製的現代經典，因影集「慾望城市」而風靡全球。',
    origin: '美國康乃狄克州',
    popularity: 85,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/cosmopolitan-vodka',
    tags: ['伏特加', '果味', '女性', '時尚'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '雖然被認為是1970年代的創作，但實際上它的原型可能更早存在於歐洲。',
    funFact: '都會調酒在1990年代因「慾望城市」而成為最流行的女性調酒。'
  },
  {
    id: 'maitai',
    name: '邁泰',
    originalName: 'Mai Tai',
    category: '熱帶',
    baseSpirit: '白朗姆酒',
    ingredients: ['白朗姆酒', '黑朗姆酒', '杏仁糖漿', '青檸汁', '橙味利口酒'],
    garnish: '鳳梨片、薄荷枝',
    preparation: '將所有材料與冰塊放入搖酒器中搖和，倒入柯林斯杯中加冰，以鳳梨片和薄荷枝裝飾。',
    glassware: '柯林斯杯',
    strength: '中等',
    complexity: '複雜',
    flavorProfile: ['熱帶', '果味', '平衡', '複雜'],
    occasion: ['海灘派對', '度假', '夏威夷風格'],
    rating: 4.5,
    price: 480,
    description: '提基文化的代表調酒，以其複雜的朗姆酒風味和熱帶風情聞名。',
    origin: '美國加州',
    popularity: 82,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/tiki-cocktail',
    tags: ['朗姆酒', '熱帶', '複雜', '提基'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '1944年由維克多·伯傑隆在加州奧克蘭的Trader Vic餐廳創作。',
    funFact: '邁泰在大溪地語中意為「好」或「出色」，反映了其卓越的風味。'
  },
  {
    id: 'sidecar',
    name: '邊車',
    originalName: 'Sidecar',
    category: '古典',
    baseSpirit: '白蘭地',
    ingredients: ['白蘭地', '君度橙酒', '檸檬汁'],
    garnish: '糖邊',
    preparation: '將杯緣沾檸檬汁後蘸糖，將所有材料與冰塊放入搖酒器中搖和，過濾倒入杯中。',
    glassware: '邊車杯',
    strength: '濃烈',
    complexity: '中等',
    flavorProfile: ['酸甜', '柑橘', '烈酒', '平衡'],
    occasion: ['正式晚宴', '餐後酒', '品味時光'],
    rating: 4.6,
    price: 470,
    description: '以完美酸甜平衡聞名的經典調酒，是白蘭地調酒的典範。',
    origin: '法國巴黎',
    popularity: 78,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/brandy-cocktails',
    tags: ['白蘭地', '酸甜', '經典', '平衡'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '起源於第一次世界大戰期間的巴黎，可能是為了紀念某位騎著摩托車的顧客而命名。',
    funFact: '邊車調酒的糖邊裝飾增加了口感的層次和視覺的美感。'
  },
  {
    id: 'bloody-mary',
    name: '血腥瑪麗',
    originalName: 'Bloody Mary',
    category: '創意',
    baseSpirit: '伏特加',
    ingredients: ['伏特加', '番茄汁', '檸檬汁', '伍斯特醬', '塔巴斯科醬', '胡椒', '鹽'],
    garnish: '芹菜棒、青檸角',
    preparation: '將所有材料與冰塊放入調酒器中攪拌，倒入高球杯中，以芹菜棒和青檸角裝飾。',
    glassware: '高球杯',
    strength: '中等',
    complexity: '複雜',
    flavorProfile: ['鹹味', '辛辣', '蔬菜', '早餐風'],
    occasion: ['早午餐', '解宿醉', '週末放鬆'],
    rating: 4.3,
    price: 400,
    description: '以其複雜的調料組合和獨特風味聞名的早餐調酒。',
    origin: '法國巴黎',
    popularity: 80,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/breakfast-cocktails',
    tags: ['伏特加', '鹹味', '辛辣', '早餐'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '1920年代由法蘭克·雷德在巴黎的哈利酒吧創作。',
    funFact: '血腥瑪麗曾被譽為「調酒界的阿斯匹靈」，因為它被認為可以治療宿醉。'
  },
  {
    id: 'whiskey-sour',
    name: '威士忌酸',
    originalName: 'Whiskey Sour',
    category: '古典',
    baseSpirit: '波本威士忌',
    ingredients: ['波本威士忌', '檸檬汁', '糖漿', '蛋白(可選)'],
    garnish: '檸檬片、紅櫻桃',
    preparation: '將所有材料放入搖酒器中乾搖(不加冰)，再加冰搖和，過濾倒入岩石杯中，以檸檬片和櫻桃裝飾。',
    glassware: '岩石杯',
    strength: '中等',
    complexity: '中等',
    flavorProfile: ['酸甜', '威士忌', '平衡', '綿密'],
    occasion: ['餐後酒', '品味威士忌', '輕鬆聚會'],
    rating: 4.6,
    price: 440,
    description: '酸甜平衡的經典威士忌調酒，以其綿密的蛋白質感聞名。',
    origin: '美國肯塔基州',
    popularity: 84,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/whiskey-sour-kit',
    tags: ['威士忌', '酸甜', '蛋白', '平衡'],
    availability: '普遍',
    servingTemp: '冰鎮',
    history: '1800年代首次出現，是美國最經典的威士忌調酒之一。',
    funFact: '蛋白的加入創造了獨特的綿密口感和泡沫質感。'
  },
  {
    id: 'martini',
    name: '馬丁尼',
    originalName: 'Martini',
    category: '古典',
    baseSpirit: '琴酒',
    ingredients: ['琴酒', '乾苦艾酒'],
    garnish: '橄欖或檸檬皮',
    preparation: '將所有材料與冰塊放入調酒杯中攪拌，過濾倒入冰凍的馬丁尼杯中，以橄欖或檸檬皮裝飾。',
    glassware: '馬丁尼杯',
    strength: '濃烈',
    complexity: '簡單',
    flavorProfile: ['清爽', '草本', '乾淨', '經典'],
    occasion: ['正式場合', '浪漫約會', '商務聚會'],
    rating: 4.8,
    price: 490,
    description: '世界上最著名的調酒之一，以其極簡主義和經典風味聞名。',
    origin: '美國加州',
    popularity: 96,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/martini-gin',
    tags: ['琴酒', '經典', '清爽', '正式'],
    availability: '普遍',
    servingTemp: '冰凍',
    history: '1860年代首次出現，經過多次改良成為今天的經典配方。',
    funFact: '詹姆斯·龐德要求「搖晃而非攪拌」的馬丁尼在傳統調酒界引起了爭議。'
  },
  {
    id: 'daiquiri',
    name: '黛綺莉',
    originalName: 'Daiquiri',
    category: '古典',
    baseSpirit: '白朗姆酒',
    ingredients: ['白朗姆酒', '青檸汁', '糖漿'],
    garnish: '青檸片',
    preparation: '將所有材料與冰塊放入搖酒器中搖和，過濾倒入冰凍的馬丁尼杯中，以青檸片裝飾。',
    glassware: '馬丁尼杯',
    strength: '中等',
    complexity: '簡單',
    flavorProfile: ['酸甜', '清新', '柑橘', '清爽'],
    occasion: ['夏日派對', '海灘', '輕鬆時光'],
    rating: 4.4,
    price: 390,
    description: '古巴最著名的調酒之一，以其清新的酸甜平衡聞名。',
    origin: '古巴',
    popularity: 81,
    isOnProwine: true,
    prowineUrl: 'https://www.prowine.com.tw/daiquiri-rum',
    tags: ['朗姆酒', '酸甜', '清新', '經典'],
    availability: '普遍',
    servingTemp: '冰凍',
    history: '1896年由美國工程師詹寧斯·考克斯在古巴的達奇里小鎮創作。',
    funFact: '黛綺莉是美國總統肯尼迪最喜歡的調酒之一。'
  }
];

export function CocktailExamples() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedStrength, setSelectedStrength] = useState('全部');
  const [selectedOccasion, setSelectedOccasion] = useState('全部');
  const [selectedExample, setSelectedExample] = useState<CocktailExample | null>(null);
  const [showProwineOnly, setShowProwineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price'>('popularity');

  const categories = ['全部', '經典', '現代', '熱帶', '古典', '創意', '地區特色'];
  const strengths = ['全部', '輕盈', '中等', '濃烈'];
  const occasions = ['全部', '正式晚宴', '派對', '夏日', '浪漫約會', '輕鬆聚會', '餐前酒', '餐後酒'];

  const filteredExamples = useMemo(() => {
    return COCKTAIL_EXAMPLES.filter(example => {
      const matchesSearch =
        example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
        example.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === '全部' || example.category === selectedCategory;
      const matchesStrength = selectedStrength === '全部' || example.strength === selectedStrength;
      const matchesOccasion = selectedOccasion === '全部' || example.occasion.includes(selectedOccasion);
      const matchesProwine = !showProwineOnly || example.isOnProwine;

      return matchesSearch && matchesCategory && matchesStrength && matchesOccasion && matchesProwine;
    });
  }, [searchTerm, selectedCategory, selectedStrength, selectedOccasion, showProwineOnly]);

  const sortedExamples = useMemo(() => {
    return [...filteredExamples].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [filteredExamples, sortBy]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
          <Star className="w-5 h-5 text-white" />
          <span className="text-white font-medium">代表性調酒實例</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Representative Cocktail Examples
        </h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          精選來自世界各地的代表性調酒，涵蓋經典與現代創作，展現調酒文化的豐富多樣性
        </p>
      </m.div>

      {/* 搜尋與篩選 */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="搜尋調酒..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {strengths.map(strength => (
                <option key={strength} value={strength} className="bg-gray-800">
                  {strength}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {occasions.map(occasion => (
                <option key={occasion} value={occasion} className="bg-gray-800">
                  {occasion}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prowine-only"
                checked={showProwineOnly}
                onChange={(e) => setShowProwineOnly(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="prowine-only" className="text-white/70 text-sm flex items-center gap-1">
                <Flame className="w-4 h-4 text-red-400" />
                僅顯示 prowine.com.tw 商品
              </label>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            >
              <option value="popularity" className="bg-gray-800">人氣排序</option>
              <option value="rating" className="bg-gray-800">評分排序</option>
              <option value="price" className="bg-gray-800">價格排序</option>
            </select>
          </div>
        </div>
      </m.div>

      {/* 統計資訊 */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-6 text-sm text-white/60"
      >
        <span>找到 {sortedExamples.length} 款調酒</span>
        <span>總計 {COCKTAIL_EXAMPLES.length} 款調酒</span>
      </m.div>

      {/* 調酒列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExamples.map((example, index) => (
          <m.div
            key={example.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${example.isOnProwine
              ? 'border-amber-500/50 hover:border-amber-500/70'
              : 'border-white/10 hover:border-amber-500/30'
              } cursor-pointer transition-all duration-300 group relative`}
            onClick={() => setSelectedExample(example)}
          >
            {example.isOnProwine && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" />
                ProWine
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {example.name}
                </h3>
                <p className="text-amber-300 text-sm">{example.originalName}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{example.rating}</span>
                </div>
                <div className="text-amber-400 text-sm font-bold">{example.price} TWD</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {example.category}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {example.strength}
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {example.complexity}
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                {example.origin}
              </span>
            </div>

            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {example.description}
            </p>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>{example.baseSpirit}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Award className="w-3 h-3" />
                  <span>{example.popularity}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {example.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>{example.availability}</span>
              </div>
              <div className="flex gap-2">
                {example.prowineUrl && (
                  <a
                    href={example.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(example.prowineUrl, '_blank');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-500/30 transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    購買
                  </a>
                )}
                <button className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20 transition-colors">
                  <span>詳情</span>
                </button>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* 詳細資訊彈窗 */}
      <AnimatePresence>
        {selectedExample && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExample(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedExample.isOnProwine && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        ProWine
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-white">{selectedExample.name}</h2>
                  </div>
                  <p className="text-amber-300 text-lg">{selectedExample.originalName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {selectedExample.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedExample.strength}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {selectedExample.complexity}
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      {selectedExample.origin}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExample(null)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    產品資訊
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">評分：</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white">{selectedExample.rating}/5.0</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">人氣指數：</span>
                      <span className="text-white">{selectedExample.popularity}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">基酒：</span>
                      <span className="text-white">{selectedExample.baseSpirit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">強度：</span>
                      <span className="text-white">{selectedExample.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">價格：</span>
                      <span className="text-amber-400 font-bold">{selectedExample.price} TWD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">產地：</span>
                      <span className="text-white">{selectedExample.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">可得性：</span>
                      <span className="text-white">{selectedExample.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">特色標籤</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-semibold text-white mb-3 mt-4">適合場合</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.occasion.map((occasion, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                      >
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">描述與特色</h3>
                <p className="text-white/80 leading-relaxed">{selectedExample.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">風味特徵</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExample.flavorProfile.map((flavor, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">調製方法</h3>
                  <p className="text-white/80 text-sm">{selectedExample.preparation}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">成分與裝飾</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">成分</h4>
                    <ul className="space-y-1">
                      {selectedExample.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-white/70 text-sm flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">裝飾</h4>
                    <p className="text-white/70 text-sm">{selectedExample.garnish}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">酒杯與服務</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">酒杯</h4>
                    <p className="text-white/70 text-sm">{selectedExample.glassware}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">飲用溫度</h4>
                    <p className="text-white/70 text-sm">{selectedExample.servingTemp}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">難度</h4>
                    <p className="text-white/70 text-sm">{selectedExample.complexity}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">歷史背景</h4>
                    <p className="text-white/70 text-sm">{selectedExample.history}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3">趣味知識</h3>
                <p className="text-white/80 leading-relaxed">{selectedExample.funFact}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                {selectedExample.prowineUrl && (
                  <a
                    href={selectedExample.prowineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>在 ProWine 購買 - {selectedExample.price} TWD</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedExample(null)}
                  className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  關閉
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}