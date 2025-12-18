
import { Gig, User, Order } from './types';

export const CATEGORIES = [
  'Graphics & Design',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'AI Services'
];

export const MOCK_USERS: Record<string, User> = {
  'u1': {
    id: 'u1',
    name: 'Ahmed Kamal',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    role: 'SELLER',
    location: 'Cairo, Egypt',
    joinedDate: 'Jan 2023',
    rating: 4.9,
    reviewCount: 124,
    balance: 4500,
    email: 'ahmed@example.com',
    status: 'ACTIVE'
  },
  'u2': {
    id: 'u2',
    name: 'Sara Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    role: 'SELLER',
    location: 'Alexandria, Egypt',
    joinedDate: 'Mar 2022',
    rating: 4.8,
    reviewCount: 89,
    balance: 12000,
    email: 'sara@example.com',
    status: 'ACTIVE'
  },
  'buyer1': {
    id: 'buyer1',
    name: 'John Business',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    role: 'BUYER',
    location: 'London, UK',
    joinedDate: 'May 2023',
    rating: 5.0,
    reviewCount: 12,
    balance: 500,
    email: 'john@business.com',
    status: 'ACTIVE'
  },
  'admin1': {
    id: 'admin1',
    name: 'Platform Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'ADMIN',
    location: 'Remote',
    joinedDate: 'Jan 2020',
    rating: 5.0,
    reviewCount: 0,
    balance: 0,
    email: 'admin@gigstream.com',
    status: 'ACTIVE'
  }
};

export const MOCK_GIGS: Gig[] = [
  {
    id: 'g1',
    sellerId: 'u1',
    title: 'I will design a professional logo for your startup',
    category: 'Graphics & Design',
    thumbnail: 'https://picsum.photos/seed/logo1/600/400',
    rating: 4.9,
    reviewCount: 84,
    startingPrice: 500,
    description: 'Looking for a clean, modern logo? I specialize in minimalist identity design that works across all platforms. My process includes detailed research and multiple concepts.',
    tags: ['Logo Design', 'Branding', 'Minimalist'],
    status: 'PUBLISHED',
    packages: {
      basic: { name: 'Basic', description: '1 Logo concept, PNG/JPG high quality files', price: 500, deliveryTime: 2, revisions: 1, features: ['High resolution', 'Logo transparency'] },
      standard: { name: 'Standard', description: '2 Logo concepts, Source File, Vector File', price: 1200, deliveryTime: 3, revisions: 3, features: ['Source file', 'Vector file', 'Logo transparency'] },
      premium: { name: 'Premium', description: '3 Concepts, Stationary, Social Media Kit', price: 2500, deliveryTime: 5, revisions: 99, features: ['Stationary designs', 'Social media kit', 'Source file'] }
    }
  },
  {
    id: 'g2',
    sellerId: 'u2',
    title: 'I will create a responsive Next.js web application',
    category: 'Programming & Tech',
    thumbnail: 'https://picsum.photos/seed/code/600/400',
    rating: 5.0,
    reviewCount: 42,
    startingPrice: 3500,
    description: 'Get a blazing fast web app built with the latest technologies including Tailwind CSS and TypeScript. I ensure SEO optimization and mobile-first design.',
    tags: ['Next.js', 'React', 'Web Development'],
    status: 'PUBLISHED',
    packages: {
      basic: { name: 'Basic', description: 'Landing Page', price: 3500, deliveryTime: 4, revisions: 2, features: ['1 Page', 'Responsive', 'Deploy help'] },
      standard: { name: 'Standard', description: 'Multi-page App with state management', price: 8000, deliveryTime: 10, revisions: 5, features: ['Up to 5 Pages', 'API integration', 'SEO setup'] },
      premium: { name: 'Premium', description: 'Full E-commerce solution with Dashboard', price: 25000, deliveryTime: 21, revisions: 10, features: ['Full backend', 'Payment integration', 'Admin panel'] }
    }
  },
  {
    id: 'g3',
    sellerId: 'u1',
    title: 'I will write SEO optimized blog posts for your niche',
    category: 'Writing & Translation',
    thumbnail: 'https://picsum.photos/seed/writing/600/400',
    rating: 4.7,
    reviewCount: 215,
    startingPrice: 300,
    description: 'High quality content that ranks on Google. 100% original and plagiarism-free. I cover topics ranging from technology to lifestyle.',
    tags: ['SEO Writing', 'Copywriting', 'Content Marketing'],
    status: 'PUBLISHED',
    packages: {
      basic: { name: 'Basic', description: '500 words article with 1 focus keyword', price: 300, deliveryTime: 1, revisions: 1, features: ['Keyword research', 'Focus keyword'] },
      standard: { name: 'Standard', description: '1500 words article with in-depth research', price: 750, deliveryTime: 3, revisions: 2, features: ['Topic research', 'Meta description'] },
      premium: { name: 'Premium', description: '3000 words + Competitor analysis + Internal links', price: 1500, deliveryTime: 5, revisions: 5, features: ['Full SEO audit', 'Image selection'] }
    }
  },
  {
    id: 'g4',
    sellerId: 'u2',
    title: 'I will develop custom AI Chatbots for your website',
    category: 'AI Services',
    thumbnail: 'https://picsum.photos/seed/ai/600/400',
    rating: 4.8,
    reviewCount: 15,
    startingPrice: 5000,
    description: 'Integrate GPT-4 or custom LLMs into your business flow to automate customer support and lead generation.',
    tags: ['AI', 'Chatbot', 'Automation'],
    status: 'PUBLISHED',
    packages: {
      basic: { name: 'Basic', description: 'Simple Q&A Bot', price: 5000, deliveryTime: 5, revisions: 2, features: ['100 FAQs', 'Web integration'] },
      standard: { name: 'Standard', description: 'Lead Gen Bot with CRM sync', price: 12000, deliveryTime: 14, revisions: 5, features: ['CRM integration', 'Custom personality'] },
      premium: { name: 'Premium', description: 'Enterprise Agent with Tool use', price: 45000, deliveryTime: 30, revisions: 99, features: ['Custom training', 'API tool use', 'Priority support'] }
    }
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    gigId: 'g1',
    buyerId: 'buyer1',
    sellerId: 'u1',
    status: 'ACTIVE',
    amount: 1200,
    packageName: 'Standard',
    createdAt: '2024-03-20T10:00:00Z',
    deadline: '2024-03-23T10:00:00Z',
    requirementsSubmitted: true
  },
  {
    id: 'o2',
    gigId: 'g2',
    buyerId: 'buyer1',
    sellerId: 'u2',
    status: 'COMPLETED',
    amount: 3500,
    packageName: 'Basic',
    createdAt: '2024-03-01T10:00:00Z',
    deadline: '2024-03-05T10:00:00Z',
    deliveredAt: '2024-03-04T15:00:00Z',
    requirementsSubmitted: true
  }
];
