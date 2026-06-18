'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getUsers, updateUserStatus, deleteUser } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, UserCheck, UserX, Search,
  MoreHorizontal, Ban, CheckCircle, Trash2, Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ApiUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

type RoleFilter = 'all' | 'customer' | 'seller';
type StatusFilter = 'all' | 'active' | 'suspended';

export default function UsersScreen() {
  const { locale } = useAppStore();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    getUsers({ limit: 200 })
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const name = u.full_name || u.email;
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const totalBuyers = users.filter(u => u.role === 'customer').length;
  const totalSellers = users.filter(u => u.role === 'seller').length;
  const totalSuspended = users.filter(u => !u.is_active).length;

  const toggleStatus = async (user: ApiUser) => {
    try {
      await updateUserStatus(user.id, !user.is_active);
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
    } catch { /* ignore */ }
  };

  const removeUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { /* ignore */ }
  };

  const roleColors: Record<string, string> = {
    customer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    seller:   'bg-forest/10 text-forest dark:bg-accent-green/10 dark:text-accent-green',
    admin:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    manager:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const roleLabel = (role: string) => {
    if (role === 'customer') return locale === 'kh' ? 'អ្នកទិញ' : 'buyer';
    if (role === 'seller') return locale === 'kh' ? 'អ្នកលក់' : 'seller';
    return role;
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'អ្នកទិញ' : 'Buyers'}</p>
              <p className="text-xl font-bold">{totalBuyers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-forest/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-forest dark:text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'អ្នកលក់' : 'Sellers'}</p>
              <p className="text-xl font-bold">{totalSellers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <UserX className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'ត្រូវបានផ្អាក' : 'Suspended'}</p>
              <p className="text-xl font-bold">{totalSuspended}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-semibold flex-1">
              {locale === 'kh' ? 'អ្នកប្រើប្រាស់ទាំងអស់' : 'All Users'}
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {/* Role filter */}
              <div className="flex rounded-lg border overflow-hidden text-xs">
                {(['all', 'customer', 'seller'] as RoleFilter[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 font-medium transition-colors
                      ${roleFilter === r ? 'bg-forest text-white' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {r === 'all' ? (locale === 'kh' ? 'ទាំងអស់' : 'All')
                      : r === 'customer' ? (locale === 'kh' ? 'អ្នកទិញ' : 'Buyers')
                      : (locale === 'kh' ? 'អ្នកលក់' : 'Sellers')}
                  </button>
                ))}
              </div>
              {/* Status filter */}
              <div className="flex rounded-lg border overflow-hidden text-xs">
                {(['all', 'active', 'suspended'] as StatusFilter[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 font-medium transition-colors capitalize
                      ${statusFilter === s ? 'bg-forest text-white' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {s === 'all' ? (locale === 'kh' ? 'ទាំងអស់' : 'All') : s}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'kh' ? 'ស្វែងរក...' : 'Search users...'}
                className="pl-8 h-8 text-xs w-48"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                      {locale === 'kh' ? 'អ្នកប្រើ' : 'User'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      {locale === 'kh' ? 'ព័ត៌មានទំនាក់ទំនង' : 'Contact'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                      {locale === 'kh' ? 'តួនាទី' : 'Role'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      {locale === 'kh' ? 'ចូលរួមថ្ងៃ' : 'Joined'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                      {locale === 'kh' ? 'ស្ថានភាព' : 'Status'}
                    </th>
                    <th className="py-2.5 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const displayName = user.full_name || user.email.split('@')[0];
                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-forest dark:text-accent-green">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-xs">{displayName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <div>
                            <p className="text-xs">{user.email}</p>
                            <p className="text-[10px] text-muted-foreground">{user.phone || '—'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColors[user.role] ?? ''}`}>
                            {roleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                            ${user.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                            {user.is_active
                              ? (locale === 'kh' ? 'សកម្ម' : 'Active')
                              : (locale === 'kh' ? 'ផ្អាក' : 'Suspended')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => toggleStatus(user)}>
                                {user.is_active
                                  ? <><Ban className="mr-2 h-3.5 w-3.5" />{locale === 'kh' ? 'ផ្អាកគណនី' : 'Suspend'}</>
                                  : <><CheckCircle className="mr-2 h-3.5 w-3.5" />{locale === 'kh' ? 'ធ្វើឱ្យសកម្ម' : 'Activate'}</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => removeUser(user.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                {locale === 'kh' ? 'លុបចោល' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  {locale === 'kh' ? 'រកមិនឃើញ' : 'No users found'}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t mt-2">
                <p className="text-xs text-muted-foreground">
                  {locale === 'kh'
                    ? `បង្ហាញ ${filtered.length} / ${users.length}`
                    : `Showing ${filtered.length} of ${users.length} users`}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
