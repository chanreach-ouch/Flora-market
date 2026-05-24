// Mock data for Flora Market demo
import { v4 as uuid } from 'uuid';

export interface MockPlant {
  id: string;
  sellerId: string;
  nameKh: string;
  nameEn: string;
  category: string;
  price: number;
  stock: number;
  tagline: string;
  taglineKh: string;
  images: string[];
  pros: string[];
  prosKh: string[];
  cons: string[];
  consKh: string[];
  waterFreq: string;
  waterFreqKh: string;
  lightReq: string;
  lightReqKh: string;
  tempRange: string;
  difficulty: string;
  difficultyKh: string;
  totalSold: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isActive: boolean;
}

export interface MockSeller {
  id: string;
  nurseryName: string;
  nurseryNameKh: string;
  description: string;
  descriptionKh: string;
  location: string;
  district: string;
  city: string;
  coverPhoto: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  totalOrders: number;
  totalPlants: number;
  yearJoined: number;
  specialties: string[];
  specialtiesKh: string[];
}

export interface MockReview {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  plantId: string;
  plantNameKh: string;
  plantNameEn: string;
  rating: number;
  comment: string;
  commentKh: string;
  date: string;
}

export interface MockOrder {
  id: string;
  buyerName: string;
  plantNameKh: string;
  plantNameEn: string;
  quantity: number;
  total: number;
  status: 'pending' | 'preparing' | 'completed';
  timestamp: string;
  sellerId: string;
}

// SELLERS
export const sellers: MockSeller[] = [
  {
    id: 'seller-1',
    nurseryName: 'Green Paradise Nursery',
    nurseryNameKh: 'Green Paradise Nursery',
    description: 'A family-run nursery specializing in tropical indoor plants. We take pride in growing healthy, well-rooted plants that thrive in Cambodian homes.',
    descriptionKh: 'សំណាក់ចម្ការគ្រួសារមួយដែលមានជំនាញក្នុងការដាំរុក្ខជាតិក្នុងផ្ទះត្រូពិក។ យើងខ្ញុំមានមោទនភាពលើការដាំរុក្ខជាតិដែលមានសុខភាពល្អ។',
    location: 'Street 240, Khan Chamkarmon',
    district: 'Chamkarmon',
    city: 'Phnom Penh',
    coverPhoto: '/images/shops/green-paradise-cover.jpg',
    avatar: '',
    isVerified: true,
    rating: 4.8,
    totalOrders: 342,
    totalPlants: 56,
    yearJoined: 2021,
    specialties: ['Tropical Plants', 'Indoor Specialists', 'Family Run'],
    specialtiesKh: ['រុក្ខជាតិត្រូពិក', 'ជំនាញក្នុងផ្ទះ', 'ដំណើរការដោយគ្រួសារ'],
  },
  {
    id: 'seller-2',
    nurseryName: 'Bloom Garden Center',
    nurseryNameKh: 'Bloom Garden Center',
    description: 'Premium flowering plants and outdoor garden specimens. Over 15 years of experience bringing color to Cambodian gardens.',
    descriptionKh: 'រុក្ខជាតិផ្កាល្អឥតខ្ចោះ និងដើមឈើសម្រាប់សួនច្បារខាងក្រៅ។ មានបទពិសោធន៍ជាង ១៥ ឆ្នាំ។',
    location: 'Russian Market Area, Khan Tuol Kork',
    district: 'Tuol Kork',
    city: 'Phnom Penh',
    coverPhoto: '/images/shops/bloom-garden-cover.jpg',
    avatar: '',
    isVerified: true,
    rating: 4.6,
    totalOrders: 218,
    totalPlants: 43,
    yearJoined: 2020,
    specialties: ['Flowering Plants', 'Outdoor Gardens', 'Rare Species'],
    specialtiesKh: ['រុក្ខជាតិផ្កា', 'សួនច្បារខាងក្រៅ', 'ប្រភេទកម្រ'],
  },
  {
    id: 'seller-3',
    nurseryName: 'Succulent House Phnom Penh',
    nurseryNameKh: 'Succulent House Phnom Penh',
    description: 'The largest collection of succulents and cacti in Cambodia. Each plant is carefully acclimatized to local conditions.',
    descriptionKh: 'ប្រមូលផ្តុំរុក្ខជាតិទឹកកក និងកាក់ធីធំបំផុតនៅកម្ពុជា។ រុក្ខជាតិនីមួយៗត្រូវបានធ្វើឱ្យសមស្របនឹងស្ថានភាពមូលដ្ឋាន។',
    location: 'Street 606, Khan Sen Sok',
    district: 'Sen Sok',
    city: 'Phnom Penh',
    coverPhoto: '/images/shops/succulent-house-cover.jpg',
    avatar: '',
    isVerified: true,
    rating: 4.9,
    totalOrders: 567,
    totalPlants: 89,
    yearJoined: 2019,
    specialties: ['Succulents', 'Cacti', 'Minimalist Plants'],
    specialtiesKh: ['រុក្ខជាតិទឹកកក', 'កាក់ធី', 'រុក្ខជាតិសាមញ្ញ'],
  },
];

// PLANTS
export const plants: MockPlant[] = [
  {
    id: 'plant-1',
    sellerId: 'seller-1',
    nameKh: 'Monstera Deliciosa',
    nameEn: 'Monstera Deliciosa',
    category: 'Indoor',
    price: 25.00,
    stock: 14,
    tagline: 'Iconic split-leaf beauty',
    taglineKh: 'សម្បសិការ័ត្នជាមួយស្លឹកឆ្នាំង',
    images: ['/images/plants/monstera.jpg'],
    pros: ['Stunning tropical look', 'Easy to care for', 'Purifies indoor air', 'Grows quickly with proper care'],
    prosKh: ['រូបរាងត្រូពិកស្រស់ស្អាត', 'ងាយស្រួលថែទាំ', 'ជម្រះអាកាសក្នុងផ្ទះ', 'លូតលាស់រហ័ស'],
    cons: ['Needs bright indirect light', 'Toxic to pets', 'Can grow quite large', 'Sensitive to overwatering'],
    consKh: ['ត្រូវការពន្លឺមិនផ្ទាល់', 'មានគ្រោះថ្នាក់ដល់សត្វចិញ្ចឹម', 'អាចលូតធំណាស់', 'រងគ្រោះពីការដំអែនឹងទឹក'],
    waterFreq: 'Weekly',
    waterFreqKh: 'សប្តាហ៍ម្តង',
    lightReq: 'Bright Indirect',
    lightReqKh: 'ពន្លឺមិនផ្ទាល់',
    tempRange: '18-30°C',
    difficulty: 'Easy',
    difficultyKh: 'ងាយ',
    totalSold: 128,
    rating: 4.8,
    reviewCount: 45,
    isNew: true,
    isActive: true,
  },
  {
    id: 'plant-2',
    sellerId: 'seller-1',
    nameKh: 'Golden Pothos',
    nameEn: 'Golden Pothos',
    category: 'Indoor',
    price: 8.00,
    stock: 30,
    tagline: 'Perfect beginner plant',
    taglineKh: 'រុក្ខជាតិសម្រាប់អ្នកចាប់ផ្តើម',
    images: ['/images/plants/golden-pothos.jpg'],
    pros: ['Nearly indestructible', 'Grows in low light', 'Trailing vines look great', 'Affordable'],
    prosKh: ['គ្មានរលួយបាន', 'លូតនៅកន្លែងងងឹត', 'ស្លឹកវាលោងស្អាត', 'តម្លៃសមរម្យ'],
    cons: ['Toxic if ingested', 'Can become leggy without pruning', 'Common plant - not unique'],
    consKh: ['មានគ្រោះថ្នាក់ប្រសិនបើលេប', 'អាចវែងបើមិនកាត់', 'រុក្ខជាតិទូទៅ'],
    waterFreq: 'Every 1-2 weeks',
    waterFreqKh: '១-២ សប្តាហ៍ម្តង',
    lightReq: 'Low to Bright Indirect',
    lightReqKh: 'ងងឹតទៅពន្លឺមិនផ្ទាល់',
    tempRange: '15-30°C',
    difficulty: 'Very Easy',
    difficultyKh: 'ងាយបំផុត',
    totalSold: 256,
    rating: 4.6,
    reviewCount: 78,
    isNew: false,
    isActive: true,
  },
  {
    id: 'plant-3',
    sellerId: 'seller-2',
    nameKh: 'Hibiscus Rosa',
    nameEn: 'Hibiscus Rosa',
    category: 'Flowering',
    price: 15.00,
    stock: 22,
    tagline: 'Vibrant tropical bloom',
    taglineKh: 'ផ្កាត្រូពិកភ្លឺស្វាង',
    images: ['/images/plants/hibiscus.jpg'],
    pros: ['Beautiful large flowers', 'Attracts butterflies', 'Blooms year-round in warm climate', 'Can be grown as hedge'],
    prosKh: ['ផ្កាធំស្រស់ស្អាត', 'ទាក់ទាញផ្កាយប៉ី', 'ផ្កាឆ្នាំងពេញបរិវេណ', 'អាចដាំជារបង'],
    cons: ['Needs full sun', 'Attracts pests', 'Requires regular fertilizing', 'Sensitive to cold'],
    consKh: ['ត្រូវការពន្លឺព្រះអាទិត្យផ្ទាល់', 'ទាក់ទាញសត្វល្អិត', 'ត្រូវការជីអីៗ', 'រងគ្រោះពីត្រជាក់'],
    waterFreq: '2-3 times weekly',
    waterFreqKh: '២-៣ ដងក្នុងសប្តាហ៍',
    lightReq: 'Full Sun',
    lightReqKh: 'ពន្លឺព្រះអាទិត្យផ្ទាល់',
    tempRange: '20-35°C',
    difficulty: 'Moderate',
    difficultyKh: 'មធ្យម',
    totalSold: 89,
    rating: 4.5,
    reviewCount: 32,
    isNew: true,
    isActive: true,
  },
  {
    id: 'plant-4',
    sellerId: 'seller-3',
    nameKh: 'Barrel Cactus',
    nameEn: 'Barrel Cactus',
    category: 'Succulents',
    price: 18.00,
    stock: 8,
    tagline: 'Low-maintenance desert gem',
    taglineKh: 'រុក្ខជាតិវាលខ្សាច់ងាយថែទាំ',
    images: ['/images/plants/barrel-cactus.jpg'],
    pros: ['Virtually no watering needed', 'Unique sculptural shape', 'Lives for decades', 'Great conversation piece'],
    prosKh: ['គ្មានត្រូវការស្រោចទឹក', 'រូបរាងពិសេដ្ឋារម្ម', 'រស់បានជាច្រើនទសវត្ស', 'គួរឱ្យចាប់អារម្មណ៍'],
    cons: ['Sharp spines - handle with care', 'Very slow growing', 'Can rot if overwatered', 'Needs excellent drainage'],
    consKh: ['ម្ខាស់មុត - ត្រូវប្រុងប្រយ័ត្ន', 'លូតយឺតណាស់', 'អាចរលួយបើដំអែនឹងទឹក', 'ត្រូវការការរាំងទឹកល្អ'],
    waterFreq: 'Monthly',
    waterFreqKh: 'ខែម្តង',
    lightReq: 'Full Sun',
    lightReqKh: 'ពន្លឺព្រះអាទិត្យផ្ទាល់',
    tempRange: '10-40°C',
    difficulty: 'Easy',
    difficultyKh: 'ងាយ',
    totalSold: 45,
    rating: 4.7,
    reviewCount: 18,
    isNew: false,
    isActive: true,
  },
  {
    id: 'plant-5',
    sellerId: 'seller-2',
    nameKh: 'Frangipani (Plumeria)',
    nameEn: 'Frangipani (Plumeria)',
    category: 'Trees',
    price: 35.00,
    stock: 6,
    tagline: 'Fragrant temple flower',
    taglineKh: 'ផ្កាវត្តក្រអូប',
    images: ['/images/plants/frangipani.jpg'],
    pros: ['Incredibly fragrant flowers', 'Cultural significance in Cambodia', 'Drought tolerant once established', 'Beautiful bare branching pattern'],
    prosKh: ['ផ្កាក្រអូបខ្លាំង', 'មានសារៈសំខាន់វប្បធម៌', 'ធន់នឹងភាពស្ងួត', 'រូបរាងស្លឹកស្អាត'],
    cons: ['Deciduous - loses leaves in dry season', 'Slow to establish', 'Milky sap is irritating', 'Needs space to grow'],
    consKh: ['ជ្រោះស្លឹករដូវប្រាំង', 'យឺតក្នុងការលូត', 'ទឹកដោះរ៉ស់រមាស់ស្បែក', 'ត្រូវការកន្លែងទូលាយ'],
    waterFreq: 'Weekly in growing season',
    waterFreqKh: 'សប្តាហ៍ម្តងក្នុងរដូវលូត',
    lightReq: 'Full Sun',
    lightReqKh: 'ពន្លឺព្រះអាទិត្យផ្ទាល់',
    tempRange: '20-38°C',
    difficulty: 'Moderate',
    difficultyKh: 'មធ្យម',
    totalSold: 67,
    rating: 4.9,
    reviewCount: 28,
    isNew: false,
    isActive: true,
  },
  {
    id: 'plant-6',
    sellerId: 'seller-3',
    nameKh: 'Aloe Vera',
    nameEn: 'Aloe Vera',
    category: 'Succulents',
    price: 6.00,
    stock: 45,
    tagline: 'Natural first aid plant',
    taglineKh: 'រុក្ខជាតិសង្គ្រោះបឋមធម្មជាតិ',
    images: ['/images/plants/aloe-vera.jpg'],
    pros: ['Medicinal gel for burns', 'Very easy to grow', 'Produces baby plants (pups)', 'Air purifying'],
    prosKh: ['ជែលព្យាបាលការរលាក', 'ងាយស្រួលដាំ', 'បង្កើតរុក្ខជាតិតូច', 'ជម្រះអាកាស'],
    cons: ['Needs well-draining soil', 'Can spread aggressively', 'Gel tastes bitter', 'Not frost tolerant'],
    consKh: ['ត្រូវការដីរាំងទឹកល្អ', 'អាចរីករាលដាល', 'ជែលមានរសជាតិខ្លាញ់', 'មិនធន់នឹងរលើង'],
    waterFreq: 'Every 2-3 weeks',
    waterFreqKh: '២-៣ សប្តាហ៍ម្តង',
    lightReq: 'Bright Indirect to Full Sun',
    lightReqKh: 'ពន្លឺមិនផ្ទាល់ទៅព្រះអាទិត្យផ្ទាល់',
    tempRange: '13-35°C',
    difficulty: 'Very Easy',
    difficultyKh: 'ងាយបំផុត',
    totalSold: 312,
    rating: 4.5,
    reviewCount: 95,
    isNew: false,
    isActive: true,
  },
  {
    id: 'plant-7',
    sellerId: 'seller-1',
    nameKh: 'Boston Fern',
    nameEn: 'Boston Fern',
    category: 'Indoor',
    price: 12.00,
    stock: 19,
    tagline: 'Lush air purifier',
    taglineKh: 'ជម្រះអាកាសបៃតង',
    images: ['/images/plants/boston-fern.jpg'],
    pros: ['Excellent air purifier', 'Beautiful cascading fronds', 'Non-toxic to pets', 'Thrives in humidity'],
    prosKh: ['ជម្រះអាកាសល្អបំផុត', 'ស្លឹករលកស្អាត', 'មិនមានគ្រោះថ្នាក់ដល់សត្វ', 'លូតល្អនៅទីសើម'],
    cons: ['Needs constant moisture', 'Drops leaves if too dry', 'Requires regular misting', 'Can be messy'],
    consKh: ['ត្រូវការសំណើមជានិច្ច', 'រលុះស្លឹកបើស្ងួត', 'ត្រូវការប្រោះទឹកជាប្រចាំ', 'អាចវឹមវ៉ាយ'],
    waterFreq: '2-3 times weekly',
    waterFreqKh: '២-៣ ដងក្នុងសប្តាហ៍',
    lightReq: 'Bright Indirect',
    lightReqKh: 'ពន្លឺមិនផ្ទាល់',
    tempRange: '16-24°C',
    difficulty: 'Moderate',
    difficultyKh: 'មធ្យម',
    totalSold: 134,
    rating: 4.3,
    reviewCount: 41,
    isNew: true,
    isActive: true,
  },
  {
    id: 'plant-8',
    sellerId: 'seller-2',
    nameKh: 'Pink Orchid (Dendrobium)',
    nameEn: 'Pink Orchid (Dendrobium)',
    category: 'Flowering',
    price: 28.00,
    stock: 11,
    tagline: 'Elegant long-lasting blooms',
    taglineKh: 'ផ្កាស្រស់យូរអង្វែង',
    images: ['/images/plants/pink-orchid.jpg'],
    pros: ['Blooms last 2-3 months', 'Elegant and sophisticated', 'Compact size', 'Re-blooms annually'],
    prosKh: ['ផ្ការក្សាយូរ ២-៣ ខែ', 'ស្រស់ស្អាតថ្លៃថ្ន', 'ទំហំតូច', 'ផ្ការាលីក្នុងមួយឆ្នាំ'],
    cons: ['Sensitive to overwatering', 'Needs specific orchid fertilizer', 'Requires good air circulation', 'Not beginner-friendly'],
    consKh: ['រងគ្រោះពីការដំអែនឹងទឹក', 'ត្រូវការជីផ្កាពិសេស', 'ត្រូវការខ្យល់ចេញចូលល្អ', 'មិនសមរម្យអ្នកចាប់ផ្តើម'],
    waterFreq: 'Weekly (soak and drain)',
    waterFreqKh: 'សប្តាហ៍ម្តង (ត្រាំនិងលិច)',
    lightReq: 'Bright Indirect',
    lightReqKh: 'ពន្លឺមិនផ្ទាល់',
    tempRange: '18-28°C',
    difficulty: 'Advanced',
    difficultyKh: 'កម្រិតខ្ពស់',
    totalSold: 56,
    rating: 4.8,
    reviewCount: 22,
    isNew: true,
    isActive: true,
  },
  {
    id: 'plant-9',
    sellerId: 'seller-3',
    nameKh: 'Echeveria Elegans',
    nameEn: 'Echeveria Elegans',
    category: 'Succulents',
    price: 5.00,
    stock: 60,
    tagline: 'Perfect rosette succulent',
    taglineKh: 'រុក្ខជាតិទឹកកករូបផ្កាថ្ម',
    images: ['/images/plants/echeveria.jpg'],
    pros: ['Stunning rosette shape', 'Changes color in sun', 'Produces many offsets', 'Great for arrangements'],
    prosKh: ['រូបរាងផ្កាថ្មស្រស់ស្អាត', 'ប្តូរពណ៌នៅពន្លឺ', 'បង្កើតរុក្ខជាតិតូចៗ', 'ល្អសម្រាប់ការរៀបចំ'],
    cons: ['Easily overwatered', 'Stretchy without enough light', 'Delicate leaves can scar', 'Attracts mealybugs'],
    consKh: ['ងាយត្រូវដំអែនឹងទឹក', 'បន្លាៗបើគ្មានពន្លឺ', 'ស្លឹកផុយអាចបាក់', 'ទាក់ទាញសត្វល្អិត'],
    waterFreq: 'Every 2 weeks',
    waterFreqKh: '២ សប្តាហ៍ម្តង',
    lightReq: 'Full Sun to Bright Indirect',
    lightReqKh: 'ព្រះអាទិត្យផ្ទាល់ទៅពន្លឺមិនផ្ទាល់',
    tempRange: '10-35°C',
    difficulty: 'Easy',
    difficultyKh: 'ងាយ',
    totalSold: 423,
    rating: 4.6,
    reviewCount: 112,
    isNew: false,
    isActive: true,
  },
  {
    id: 'plant-10',
    sellerId: 'seller-1',
    nameKh: 'Areca Palm',
    nameEn: 'Areca Palm',
    category: 'Outdoor',
    price: 22.00,
    stock: 16,
    tagline: 'Air-purifying palm tree',
    taglineKh: 'ដើមត្នោតជម្រះអាកាស',
    images: ['/images/plants/areca-palm.jpg'],
    pros: ['Top air purifying plant', 'Tropical ambiance', 'Pet-friendly', 'Grows well in containers'],
    prosKh: ['ជម្រះអាកាសល្អបំផុត', 'បរិយាកាសត្រូពិក', 'មិនមានគ្រោះថ្នាក់សត្វ', 'លូតល្អក្នុងធុង'],
    cons: ['Needs consistent watering', 'Brown tips from dry air', 'Can attract spider mites', 'Gets tall - needs space'],
    consKh: ['ត្រូវការទឹកជាប្រចាំ', 'កំពូស្ងួតពីខ្យល់ស្ងួត', 'អាចមានសត្វល្អិត', 'លូតខ្ពស់ - ត្រូវការកន្លែង'],
    waterFreq: 'Twice weekly',
    waterFreqKh: 'សប្តាហ៍ពីរដង',
    lightReq: 'Bright Indirect to Partial Sun',
    lightReqKh: 'ពន្លឺមិនផ្ទាល់ទៅព្រះអាទិត្យមួយចំហៀង',
    tempRange: '18-30°C',
    difficulty: 'Easy',
    difficultyKh: 'ងាយ',
    totalSold: 98,
    rating: 4.4,
    reviewCount: 36,
    isNew: false,
    isActive: true,
  },
];

// REVIEWS
export const reviews: MockReview[] = [
  {
    id: 'review-1',
    buyerId: 'buyer-1',
    buyerName: 'Sokha Chan',
    buyerAvatar: '',
    sellerId: 'seller-1',
    plantId: 'plant-1',
    plantNameKh: 'Monstera Deliciosa',
    plantNameEn: 'Monstera Deliciosa',
    rating: 5,
    comment: 'Beautiful healthy plant! Arrived in perfect condition. The leaves are huge and gorgeous.',
    commentKh: 'រុក្ខជាតិស្អាតមានសុខភាពល្អ! មកដល់ក្នុងស្ថានភាពល្អឥតខ្ចោះ។',
    date: '2026-04-15',
  },
  {
    id: 'review-2',
    buyerId: 'buyer-2',
    buyerName: 'Vannak Soeun',
    buyerAvatar: '',
    sellerId: 'seller-1',
    plantId: 'plant-2',
    plantNameKh: 'Golden Pothos',
    plantNameEn: 'Golden Pothos',
    rating: 4,
    comment: 'Good plant, healthy roots. Delivery was a bit slow but the plant is thriving now.',
    commentKh: 'រុក្ខជាតិល្អ ឫសមានសុខភាព។ ការដឹកជញ្ជូនយឺតបន្តិចប៉ុន្តែរុក្ខជាតិលូតល្អហើយ។',
    date: '2026-04-10',
  },
  {
    id: 'review-3',
    buyerId: 'buyer-3',
    buyerName: 'Mony Rotha',
    buyerAvatar: '',
    sellerId: 'seller-3',
    plantId: 'plant-4',
    plantNameKh: 'Barrel Cactus',
    plantNameEn: 'Barrel Cactus',
    rating: 5,
    comment: 'Exactly as described. The cons section was honest - spines are sharp! But I love it.',
    commentKh: 'ដូចការពិពណ៌នាពិតជាក់។ គុណវិបត្តិជាក់ស្តែង - ម្ខាស់មុត! ប៉ុន្តែខ្ញុំចូលចិត្ត។',
    date: '2026-04-08',
  },
  {
    id: 'review-4',
    buyerId: 'buyer-4',
    buyerName: 'Chansreypich Lon',
    buyerAvatar: '',
    sellerId: 'seller-2',
    plantId: 'plant-3',
    plantNameKh: 'Hibiscus Rosa',
    plantNameEn: 'Hibiscus Rosa',
    rating: 4,
    comment: 'Lovely hibiscus with vibrant flowers. Wish there were more color options available.',
    commentKh: 'ផ្កាកុងស្កីស្រស់ស្អាត។ សង្ឃឹមថាមានជម្រើសពណ៌កាន់តែច្រើន។',
    date: '2026-04-05',
  },
  {
    id: 'review-5',
    buyerId: 'buyer-5',
    buyerName: 'Piseth Khut',
    buyerAvatar: '',
    sellerId: 'seller-3',
    plantId: 'plant-9',
    plantNameKh: 'Echeveria Elegans',
    plantNameEn: 'Echeveria Elegans',
    rating: 5,
    comment: 'Perfect little succulent. The color change in sunlight is amazing. Already producing babies!',
    commentKh: 'រុក្ខជាតិទឹកកកតូចល្អឥតខ្ចោះ។ ការប្តូរពណ៌នៅពន្លឺព្រះអាទិត្យគឺអស្ចារ្យណាស់!',
    date: '2026-04-02',
  },
];

// MOCK ORDERS (for seller dashboard)
export const mockOrders: MockOrder[] = [
  { id: 'ORD-001', buyerName: 'Sokha Chan', plantNameKh: 'Monstera Deliciosa', plantNameEn: 'Monstera Deliciosa', quantity: 1, total: 25.00, status: 'pending', timestamp: '2026-04-29 10:30', sellerId: 'seller-1' },
  { id: 'ORD-002', buyerName: 'Vannak Soeun', plantNameKh: 'Golden Pothos', plantNameEn: 'Golden Pothos', quantity: 3, total: 24.00, status: 'preparing', timestamp: '2026-04-29 09:15', sellerId: 'seller-1' },
  { id: 'ORD-003', buyerName: 'Mony Rotha', plantNameKh: 'Boston Fern', plantNameEn: 'Boston Fern', quantity: 2, total: 24.00, status: 'preparing', timestamp: '2026-04-28 16:45', sellerId: 'seller-1' },
  { id: 'ORD-004', buyerName: 'Piseth Khut', plantNameKh: 'Hibiscus Rosa', plantNameEn: 'Hibiscus Rosa', quantity: 1, total: 15.00, status: 'pending', timestamp: '2026-04-29 08:00', sellerId: 'seller-2' },
  { id: 'ORD-005', buyerName: 'Chansreypich Lon', plantNameKh: 'Aloe Vera', plantNameEn: 'Aloe Vera', quantity: 4, total: 24.00, status: 'completed', timestamp: '2026-04-27 14:20', sellerId: 'seller-3' },
];

// Helper functions
export function getPlantById(id: string): MockPlant | undefined {
  return plants.find(p => p.id === id);
}

export function getSellerById(id: string): MockSeller | undefined {
  return sellers.find(s => s.id === id);
}

export function getPlantsBySeller(sellerId: string): MockPlant[] {
  return plants.filter(p => p.sellerId === sellerId);
}

export function getPlantsByCategory(category: string): MockPlant[] {
  if (category === 'All') return plants;
  return plants.filter(p => p.category === category);
}

export function getNewArrivals(): MockPlant[] {
  return plants.filter(p => p.isNew);
}

export function getReviewsBySeller(sellerId: string): MockReview[] {
  return reviews.filter(r => r.sellerId === sellerId);
}

export function getReviewsByPlant(plantId: string): MockReview[] {
  return reviews.filter(r => r.plantId === plantId);
}

export function getOrdersBySeller(sellerId: string): MockOrder[] {
  return mockOrders.filter(o => o.sellerId === sellerId);
}

export const categories = ['All', 'Indoor', 'Outdoor', 'Flowering', 'Succulents', 'Trees', 'Rare'];

// Plant emoji mapping for visual placeholders
export const plantEmojis: Record<string, string> = {
  'Indoor': '🪴',
  'Outdoor': '🌳',
  'Flowering': '🌺',
  'Succulents': '🌵',
  'Trees': '🌴',
  'Rare': '🌿',
};
