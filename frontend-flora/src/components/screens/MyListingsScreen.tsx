'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plants, plantEmojis } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Edit, Trash2, Share2, Plus, Package } from 'lucide-react';
import SellPlantModal from '@/components/modals/SellPlantModal';
import { showToast } from '@/components/ui/toast-custom';

export default function MyListingsScreen() {
  const { locale, user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<any>(null);

  // TODO: Replace with actual user's listings from API
  // For now, using mock data filtered by seller
  const myListings = plants.filter(p => p.sellerId === 'seller-1'); // Replace with user.sellerId

  const filteredListings = myListings.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.nameEn.toLowerCase().includes(q) || p.nameKh.includes(q);
  });

  const handleEdit = (plant: any) => {
    setEditingPlant(plant);
    setSellModalOpen(true);
  };

  const handleDelete = (plant: any) => {
    // Show confirmation
    if (window.confirm(locale === 'kh' 
      ? 'តើអ្នកប្រាកដថាចង់លុបរុក្ខជាតិនេះ?' 
      : 'Are you sure you want to remove this plant?'
    )) {
      // TODO: API call to delete
      showToast('success', locale === 'kh' 
        ? 'រុក្ខជាតិត្រូវបានលុបដោយជោគជ័យ' 
        : 'Plant removed successfully'
      );
    }
  };

  const handleShare = (plant: any) => {
    const shareUrl = `floramarket.kh/plants/${plant.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('share', locale === 'kh'
      ? 'បានចម្លងតំណភ្ជាប់! 📋 ចែករំលែកនៅលើ Telegram ឬ Facebook'
      : 'Share link copied to clipboard! 📋 Share it on Telegram or Facebook'
    );
  };

  const handleAddNew = () => {
    setEditingPlant(null);
    setSellModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {locale === 'kh' ? 'រុក្ខជាតិរបស់ខ្ញុំ' : 'My Listings'} 🌿
        </h1>
        <p className="text-lg text-muted-foreground">
          {locale === 'kh' ? 'គ្រប់គ្រងរុក្ខជាតិដែលអ្នកកំពុងលក់' : 'Manage your plant listings'}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={locale === 'kh' ? 'ស្វែងរករុក្ខជាតិរបស់ខ្ញុំ...' : 'Search my plants...'}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-accent-green hover:bg-forest-mid text-white h-12 px-6 gap-2"
        >
          <Plus className="h-5 w-5" />
          {locale === 'kh' ? 'បន្ថែមរុក្ខជាតិថ្មី' : 'Add New Plant'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent-green">{myListings.length}</p>
            <p className="text-sm text-muted-foreground">{locale === 'kh' ? 'សរុប' : 'Total'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent-green">{myListings.filter(p => p.isActive).length}</p>
            <p className="text-sm text-muted-foreground">{locale === 'kh' ? 'សកម្ម' : 'Active'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{myListings.filter(p => p.stock < 10).length}</p>
            <p className="text-sm text-muted-foreground">{locale === 'kh' ? 'ស្តុកតិច' : 'Low Stock'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{myListings.reduce((sum, p) => sum + p.totalSold, 0)}</p>
            <p className="text-sm text-muted-foreground">{locale === 'kh' ? 'លក់បាន' : 'Sold'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">
            {locale === 'kh' ? 'មិនមានរុក្ខជាតិ' : 'No plants yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {locale === 'kh' ? 'ចាប់ផ្តើមលក់រុក្ខជាតិរបស់អ្នកថ្ងៃនេះ!' : 'Start selling your plants today!'}
          </p>
          <Button
            onClick={handleAddNew}
            className="bg-accent-green hover:bg-forest-mid text-white gap-2"
          >
            <Plus className="h-5 w-5" />
            {locale === 'kh' ? 'បន្ថែមរុក្ខជាតិដំបូង' : 'Add Your First Plant'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(plant => (
            <Card key={plant.id} className="card-shadow-hover transition-shadow overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center">
                <span className="text-6xl opacity-80">
                  {plantEmojis[plant.category] || '🌿'}
                </span>
                {!plant.isActive && (
                  <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground">
                    {locale === 'kh' ? 'អសកម្ម' : 'Inactive'}
                  </Badge>
                )}
                {plant.stock < 10 && plant.stock > 0 && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                    {locale === 'kh' ? 'ស្តុកតិច' : 'Low Stock'}
                  </Badge>
                )}
                {plant.stock === 0 && (
                  <Badge className="absolute top-2 right-2 bg-destructive text-white">
                    {locale === 'kh' ? 'អស់ស្តុក' : 'Out of Stock'}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-base mb-1 line-clamp-1">
                  {locale === 'kh' ? plant.nameKh : plant.nameEn}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {locale === 'kh' ? plant.taglineKh : plant.tagline}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-lg">${plant.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {plant.stock} {locale === 'kh' ? 'នៅសល់' : 'in stock'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {plant.totalSold} {locale === 'kh' ? 'លក់' : 'sold'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plant)}
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    {locale === 'kh' ? 'កែ' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(plant)}
                    className="gap-1"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plant)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sell Plant Modal */}
      <SellPlantModal
        isOpen={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setEditingPlant(null);
        }}
        editingPlant={editingPlant}
      />
    </div>
  );
}
