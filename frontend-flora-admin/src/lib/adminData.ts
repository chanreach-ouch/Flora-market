// Rich mock data for the admin panel — used until real API endpoints are wired
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller';
  status: 'active' | 'suspended';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  avatar: string;
}

export interface AdminOrder {
  id: string;
  buyerName: string;
  sellerName: string;
  plantNameEn: string;
  plantNameKh: string;
  quantity: number;
  total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  timestamp: string;
  commission: number;
  category: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  orders: number;
  commission: number;
  newUsers: number;
}

export interface CategoryRevenue {
  name: string;
  value: number;
  color: string;
}

export const adminUsers: AdminUser[] = [
  { id: 'u-001', name: 'Sokha Chan', email: 'sokha.chan@email.com', phone: '012 345 678', role: 'buyer', status: 'active', joinDate: '2025-09-12', totalOrders: 14, totalSpent: 312.50, avatar: '' },
  { id: 'u-002', name: 'Vannak Soeun', email: 'vannak.s@email.com', phone: '011 234 567', role: 'buyer', status: 'active', joinDate: '2025-10-03', totalOrders: 8, totalSpent: 185.00, avatar: '' },
  { id: 'u-003', name: 'Mony Rotha', email: 'mony.rotha@email.com', phone: '015 678 901', role: 'seller', status: 'active', joinDate: '2025-08-20', totalOrders: 342, totalSpent: 0, avatar: '' },
  { id: 'u-004', name: 'Chansreypich Lon', email: 'chan.lon@email.com', phone: '016 789 012', role: 'buyer', status: 'active', joinDate: '2025-11-15', totalOrders: 5, totalSpent: 97.00, avatar: '' },
  { id: 'u-005', name: 'Piseth Khut', email: 'piseth.k@email.com', phone: '017 890 123', role: 'buyer', status: 'active', joinDate: '2025-12-01', totalOrders: 22, totalSpent: 440.00, avatar: '' },
  { id: 'u-006', name: 'Ratha Pov', email: 'ratha.pov@email.com', phone: '092 112 233', role: 'seller', status: 'active', joinDate: '2025-07-10', totalOrders: 218, totalSpent: 0, avatar: '' },
  { id: 'u-007', name: 'Sreyleak Heng', email: 'sreyleak.h@email.com', phone: '096 334 455', role: 'buyer', status: 'suspended', joinDate: '2025-09-28', totalOrders: 2, totalSpent: 38.00, avatar: '' },
  { id: 'u-008', name: 'Dara Neak', email: 'dara.neak@email.com', phone: '098 556 677', role: 'buyer', status: 'active', joinDate: '2026-01-05', totalOrders: 11, totalSpent: 267.50, avatar: '' },
  { id: 'u-009', name: 'Bopha Keo', email: 'bopha.keo@email.com', phone: '093 778 899', role: 'seller', status: 'active', joinDate: '2025-06-15', totalOrders: 567, totalSpent: 0, avatar: '' },
  { id: 'u-010', name: 'Visal Chheng', email: 'visal.c@email.com', phone: '012 998 877', role: 'buyer', status: 'active', joinDate: '2026-02-14', totalOrders: 7, totalSpent: 156.00, avatar: '' },
  { id: 'u-011', name: 'Kalyan Sim', email: 'kalyan.sim@email.com', phone: '011 776 654', role: 'buyer', status: 'active', joinDate: '2026-02-28', totalOrders: 3, totalSpent: 54.00, avatar: '' },
  { id: 'u-012', name: 'Sophea Tan', email: 'sophea.tan@email.com', phone: '015 554 332', role: 'buyer', status: 'active', joinDate: '2026-03-10', totalOrders: 9, totalSpent: 213.00, avatar: '' },
  { id: 'u-013', name: 'Chenda Ly', email: 'chenda.ly@email.com', phone: '016 332 210', role: 'seller', status: 'suspended', joinDate: '2025-10-22', totalOrders: 45, totalSpent: 0, avatar: '' },
  { id: 'u-014', name: 'Rithy Phal', email: 'rithy.phal@email.com', phone: '017 210 098', role: 'buyer', status: 'active', joinDate: '2026-04-01', totalOrders: 1, totalSpent: 25.00, avatar: '' },
  { id: 'u-015', name: 'Sreymom Oun', email: 'sreymom.o@email.com', phone: '092 876 543', role: 'buyer', status: 'active', joinDate: '2026-04-15', totalOrders: 4, totalSpent: 88.00, avatar: '' },
];

export const adminOrders: AdminOrder[] = [
  { id: 'ORD-001', buyerName: 'Sokha Chan', sellerName: 'Green Paradise Nursery', plantNameEn: 'Monstera Deliciosa', plantNameKh: 'Monstera Deliciosa', quantity: 1, total: 25.00, status: 'completed', timestamp: '2026-06-15 10:30', commission: 1.25, category: 'Indoor' },
  { id: 'ORD-002', buyerName: 'Vannak Soeun', sellerName: 'Green Paradise Nursery', plantNameEn: 'Golden Pothos', plantNameKh: 'Golden Pothos', quantity: 3, total: 24.00, status: 'completed', timestamp: '2026-06-15 09:15', commission: 1.20, category: 'Indoor' },
  { id: 'ORD-003', buyerName: 'Mony Rotha', sellerName: 'Green Paradise Nursery', plantNameEn: 'Boston Fern', plantNameKh: 'Boston Fern', quantity: 2, total: 24.00, status: 'preparing', timestamp: '2026-06-14 16:45', commission: 1.20, category: 'Indoor' },
  { id: 'ORD-004', buyerName: 'Piseth Khut', sellerName: 'Bloom Garden Center', plantNameEn: 'Hibiscus Rosa', plantNameKh: 'Hibiscus Rosa', quantity: 1, total: 15.00, status: 'pending', timestamp: '2026-06-16 08:00', commission: 0.75, category: 'Flowering' },
  { id: 'ORD-005', buyerName: 'Chansreypich Lon', sellerName: 'Succulent House', plantNameEn: 'Aloe Vera', plantNameKh: 'Aloe Vera', quantity: 4, total: 24.00, status: 'completed', timestamp: '2026-06-13 14:20', commission: 1.20, category: 'Succulents' },
  { id: 'ORD-006', buyerName: 'Dara Neak', sellerName: 'Bloom Garden Center', plantNameEn: 'Frangipani', plantNameKh: 'ផ្កាវត្ត', quantity: 1, total: 35.00, status: 'completed', timestamp: '2026-06-12 11:00', commission: 1.75, category: 'Trees' },
  { id: 'ORD-007', buyerName: 'Bopha Keo', sellerName: 'Succulent House', plantNameEn: 'Echeveria Elegans', plantNameKh: 'Echeveria Elegans', quantity: 6, total: 30.00, status: 'completed', timestamp: '2026-06-11 15:30', commission: 1.50, category: 'Succulents' },
  { id: 'ORD-008', buyerName: 'Visal Chheng', sellerName: 'Green Paradise Nursery', plantNameEn: 'Areca Palm', plantNameKh: 'ដើមត្នោត', quantity: 1, total: 22.00, status: 'preparing', timestamp: '2026-06-16 07:45', commission: 1.10, category: 'Outdoor' },
  { id: 'ORD-009', buyerName: 'Sophea Tan', sellerName: 'Bloom Garden Center', plantNameEn: 'Pink Orchid', plantNameKh: 'ផ្កាអក្នីស', quantity: 2, total: 56.00, status: 'pending', timestamp: '2026-06-16 12:15', commission: 2.80, category: 'Flowering' },
  { id: 'ORD-010', buyerName: 'Sreymom Oun', sellerName: 'Succulent House', plantNameEn: 'Barrel Cactus', plantNameKh: 'Barrel Cactus', quantity: 1, total: 18.00, status: 'cancelled', timestamp: '2026-06-10 09:00', commission: 0, category: 'Succulents' },
  { id: 'ORD-011', buyerName: 'Kalyan Sim', sellerName: 'Green Paradise Nursery', plantNameEn: 'Boston Fern', plantNameKh: 'Boston Fern', quantity: 1, total: 12.00, status: 'completed', timestamp: '2026-06-09 14:00', commission: 0.60, category: 'Indoor' },
  { id: 'ORD-012', buyerName: 'Rithy Phal', sellerName: 'Succulent House', plantNameEn: 'Aloe Vera', plantNameKh: 'Aloe Vera', quantity: 2, total: 12.00, status: 'completed', timestamp: '2026-06-08 16:20', commission: 0.60, category: 'Succulents' },
  { id: 'ORD-013', buyerName: 'Sokha Chan', sellerName: 'Bloom Garden Center', plantNameEn: 'Hibiscus Rosa', plantNameKh: 'Hibiscus Rosa', quantity: 2, total: 30.00, status: 'completed', timestamp: '2026-06-07 10:10', commission: 1.50, category: 'Flowering' },
  { id: 'ORD-014', buyerName: 'Vannak Soeun', sellerName: 'Green Paradise Nursery', plantNameEn: 'Monstera Deliciosa', plantNameKh: 'Monstera Deliciosa', quantity: 1, total: 25.00, status: 'completed', timestamp: '2026-06-06 13:45', commission: 1.25, category: 'Indoor' },
  { id: 'ORD-015', buyerName: 'Piseth Khut', sellerName: 'Succulent House', plantNameEn: 'Echeveria Elegans', plantNameKh: 'Echeveria Elegans', quantity: 10, total: 50.00, status: 'completed', timestamp: '2026-06-05 09:30', commission: 2.50, category: 'Succulents' },
];

export const revenueData: RevenuePoint[] = [
  { month: 'Jul 25', revenue: 1240, orders: 48, commission: 62, newUsers: 23 },
  { month: 'Aug 25', revenue: 1580, orders: 61, commission: 79, newUsers: 31 },
  { month: 'Sep 25', revenue: 2100, orders: 82, commission: 105, newUsers: 45 },
  { month: 'Oct 25', revenue: 1890, orders: 74, commission: 94.5, newUsers: 38 },
  { month: 'Nov 25', revenue: 2450, orders: 95, commission: 122.5, newUsers: 52 },
  { month: 'Dec 25', revenue: 3200, orders: 128, commission: 160, newUsers: 67 },
  { month: 'Jan 26', revenue: 2800, orders: 110, commission: 140, newUsers: 58 },
  { month: 'Feb 26', revenue: 3100, orders: 122, commission: 155, newUsers: 64 },
  { month: 'Mar 26', revenue: 3650, orders: 145, commission: 182.5, newUsers: 79 },
  { month: 'Apr 26', revenue: 4200, orders: 168, commission: 210, newUsers: 92 },
  { month: 'May 26', revenue: 3900, orders: 156, commission: 195, newUsers: 84 },
  { month: 'Jun 26', revenue: 4580, orders: 183, commission: 229, newUsers: 101 },
];

export const categoryRevenue: CategoryRevenue[] = [
  { name: 'Indoor', value: 34, color: '#52b788' },
  { name: 'Succulents', value: 27, color: '#2d6a4f' },
  { name: 'Flowering', value: 19, color: '#c9a84c' },
  { name: 'Outdoor', value: 12, color: '#1a3a2a' },
  { name: 'Trees', value: 8, color: '#95d5b2' },
];

export const platformStats = {
  totalRevenue: 34690,
  revenueGrowth: 17.4,
  totalOrders: 1372,
  ordersGrowth: 12.8,
  totalUsers: 847,
  usersGrowth: 23.5,
  activeSellers: 38,
  sellersGrowth: 5.9,
  totalCommission: 1734.5,
  pendingOrders: 24,
  completedOrders: 1298,
  cancelledOrders: 50,
};
