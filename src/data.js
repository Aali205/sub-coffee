// Items marked `sig` appear on @subcoffee1. The rest is a typical specialty line-up —
// confirm it against the real menu before going live.
export const menu = [
  {
    cat: 'espresso',
    icon: 'hot',
    ar: 'إسبريسو',
    en: 'Espresso',
    dAr: 'شوت مركّز من محصول اليوم',
    dEn: 'A focused shot of today’s crop',
  },
  {
    cat: 'espresso',
    icon: 'hot',
    ar: 'أمريكانو',
    en: 'Americano',
    dAr: 'إسبريسو وماي سخنة',
    dEn: 'Espresso, lengthened with hot water',
  },
  {
    cat: 'espresso',
    icon: 'hot',
    ar: 'كورتادو',
    en: 'Cortado',
    dAr: 'نص إسبريسو، نص حليب مبخّر',
    dEn: 'Equal parts espresso and steamed milk',
  },
  {
    cat: 'espresso',
    icon: 'hot',
    ar: 'فلات وايت',
    en: 'Flat White',
    dAr: 'حليب مخملي فوق دبل شوت',
    dEn: 'Velvet milk over a double shot',
  },
  {
    cat: 'espresso',
    icon: 'hot',
    ar: 'كابتشينو',
    en: 'Cappuccino',
    dAr: 'رغوة كثيفة وتوازن كلاسيكي',
    dEn: 'Deep foam, classic balance',
  },
  {
    cat: 'espresso',
    icon: 'hot',
    ar: 'سبانيش لاتيه',
    en: 'Spanish Latte',
    dAr: 'إسبريسو وحليب مكثّف محلّى',
    dEn: 'Espresso & sweetened condensed milk',
    sig: true,
  },
  {
    cat: 'brew',
    icon: 'filter',
    ar: 'V60',
    en: 'V60',
    dAr: 'تحضير يدوي يبيّن نكهة المحصول',
    dEn: 'Hand-poured to let the origin shine',
    sig: true,
  },
  {
    cat: 'brew',
    icon: 'filter',
    ar: 'كيمكس',
    en: 'Chemex',
    dAr: 'فلتر نظيف لكوبين',
    dEn: 'A clean filter brew for two',
  },
  {
    cat: 'brew',
    icon: 'hot',
    ar: 'قهوة تركية',
    en: 'Turkish Coffee',
    dAr: 'على الأصول، مع هيل أو بدون',
    dEn: 'The classic way, with or without cardamom',
  },
  {
    cat: 'iced',
    icon: 'iced',
    ar: 'آيس سبانيش لاتيه',
    en: 'Iced Spanish Latte',
    dAr: 'طبقات حلوة فوق التلج',
    dEn: 'Sweet layers over ice',
    sig: true,
  },
  {
    cat: 'iced',
    icon: 'iced',
    ar: 'آيس لاتيه',
    en: 'Iced Latte',
    dAr: 'دبل شوت، حليب بارد، وتلج',
    dEn: 'Double shot, cold milk, ice',
  },
  {
    cat: 'iced',
    icon: 'iced',
    ar: 'آيس أمريكانو',
    en: 'Iced Americano',
    dAr: 'منعش وقوي',
    dEn: 'Crisp and bold',
  },
  {
    cat: 'iced',
    icon: 'iced',
    ar: 'كولد برو',
    en: 'Cold Brew',
    dAr: 'منقوع بارد لساعات طويلة',
    dEn: 'Steeped cold for long hours',
  },
  {
    cat: 'fruity',
    icon: 'fruit',
    ar: 'سموذي مانغا',
    en: 'Mango Smoothie',
    dAr: 'منعش، كريمي، ومليان نكهة',
    dEn: 'Fresh, creamy, full of flavor',
    sig: true,
  },
  {
    cat: 'fruity',
    icon: 'fruit',
    ar: 'سموذي فريز',
    en: 'Strawberry Smoothie',
    dAr: 'فريز طازة ومنعشة',
    dEn: 'Fresh, bright strawberries',
  },
  {
    cat: 'fruity',
    icon: 'fruit',
    ar: 'ليمون ونعنع',
    en: 'Lemon & Mint',
    dAr: 'الكلاسيكية الشامية',
    dEn: 'The Damascene classic',
  },
  {
    cat: 'more',
    icon: 'shake',
    ar: 'ميلك شيك أوريو',
    en: 'Oreo Milkshake',
    dAr: 'كريمي وغني',
    dEn: 'Thick, creamy, indulgent',
    sig: true,
  },
  {
    cat: 'more',
    icon: 'hot',
    ar: 'هوت شوكليت',
    en: 'Hot Chocolate',
    dAr: 'شوكولا غنية وحليب مبخّر',
    dEn: 'Rich chocolate, steamed milk',
  },
  {
    cat: 'more',
    icon: 'sweet',
    ar: 'تارت اليوم',
    en: 'Tart of the Day',
    dAr: 'اسأل الباريستا عن حلو اليوم',
    dEn: 'Ask your barista what’s fresh today',
  },
];

export const categories = ['all', 'espresso', 'brew', 'iced', 'fruity', 'more'];

// Liquid layers are [color, share of the cup], bottom to top.
export const signature = [
  {
    bg: '#0E2B28',
    accent: '#D9A57A',
    ice: true,
    straw: false,
    steam: false,
    layers: [
      ['#F4E7D6', 0.42],
      ['#C18A5E', 0.2],
      ['#5B3321', 0.24],
    ],
  },
  {
    bg: '#0A4F53',
    accent: '#FFE3CB',
    ice: false,
    straw: false,
    steam: true,
    layers: [
      ['#3A190B', 0.5],
      ['#4E2410', 0.18],
      ['#8A4A22', 0.04],
    ],
  },
  {
    bg: '#3D2A0A',
    accent: '#FFC23D',
    ice: false,
    straw: true,
    steam: false,
    layers: [
      ['#EE9E12', 0.42],
      ['#F6B52C', 0.3],
      ['#FFD978', 0.1],
    ],
  },
];

export const instagram = [
  {
    url: 'https://www.instagram.com/subcoffee1/reel/DdyjxyYCwOE/',
    key: 'ig.1',
    art: 'mango',
  },
  {
    url: 'https://www.instagram.com/subcoffee1/reel/DdwzHDkqBrL/',
    key: 'ig.2',
    art: 'v60',
  },
  {
    url: 'https://www.instagram.com/subcoffee1/reel/DdpAw0BiC4N/',
    key: 'ig.3',
    art: 'latte',
  },
  {
    url: 'https://www.instagram.com/subcoffee1/reel/DdWuCV7qYsN/',
    key: 'ig.4',
    art: 'logo',
  },
  {
    url: 'https://www.instagram.com/subcoffee1/reel/DdCdkbDCLGs/',
    key: 'ig.5',
    art: 'clock',
  },
  { url: 'https://www.instagram.com/subcoffee1/', key: 'ig.6', art: 'beans' },
];

export const MAPS = {
  dam:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Sub Coffee ساحة المحافظة دمشق'),
  homs:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Sub Coffee المزينة حمص'),
};
