'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, DollarSign } from 'lucide-react';
import { showToast } from '@/components/ui/toast-custom';

interface SellPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlant?: any; // For edit mode
}

export default function SellPlantModal({ isOpen, onClose, editingPlant }: SellPlantModalProps) {
  const { locale } = useAppStore();
  const [isClosing, setIsClosing] = useState(false);
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameKh: '',
    category: '',
    price: '',
    stock: '',
    tagline: '',
    taglineKh: '',
    description: '',
    descriptionKh: '',
    waterFreq: '',
    waterFreqKh: '',
    lightReq: '',
    lightReqKh: '',
    tempRange: '',
    difficulty: '',
    difficultyKh: '',
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Populate form if editing
  useEffect(() => {
    if (editingPlant) {
      setFormData({
        nameEn: editingPlant.nameEn || '',
        nameKh: editingPlant.nameKh || '',
        category: editingPlant.category || '',
        price: editingPlant.price?.toString() || '',
        stock: editingPlant.stock?.toString() || '',
        tagline: editingPlant.tagline || '',
        taglineKh: editingPlant.taglineKh || '',
        description: editingPlant.description || '',
        descriptionKh: editingPlant.descriptionKh || '',
        waterFreq: editingPlant.waterFreq || '',
        waterFreqKh: editingPlant.waterFreqKh || '',
        lightReq: editingPlant.lightReq || '',
        lightReqKh: editingPlant.lightReqKh || '',
        tempRange: editingPlant.tempRange || '',
        difficulty: editingPlant.difficulty || '',
        difficultyKh: editingPlant.difficultyKh || '',
      });
    }
  }, [editingPlant]);

  const commission = formData.price ? (parseFloat(formData.price) * 0.05).toFixed(2) : '0.00';
  const netEarnings = formData.price ? (parseFloat(formData.price) * 0.95).toFixed(2) : '0.00';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxFiles = 5;
    const currentCount = uploadedImages.length;
    const remainingSlots = maxFiles - currentCount;

    if (remainingSlots <= 0) {
      showToast('error', locale === 'kh' 
        ? 'អ្នកអាចបញ្ចូលរូបភាពបានតែ 5 ប៉ុណ្ណោះ' 
        : 'You can only upload up to 5 photos'
      );
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('error', locale === 'kh'
          ? 'រូបភាពធំពេក (អតិបរមា 5MB)'
          : 'Image too large (max 5MB)'
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // Reset form
      setFormData({
        nameEn: '', nameKh: '', category: '', price: '', stock: '',
        tagline: '', taglineKh: '', description: '', descriptionKh: '',
        waterFreq: '', waterFreqKh: '', lightReq: '', lightReqKh: '',
        tempRange: '', difficulty: '', difficultyKh: '',
      });
      setUploadedImages([]);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nameEn || !formData.price || !formData.category) {
      showToast('error', locale === 'kh' ? 'សូមបំពេញព័ត៌មានចាំបាច់' : 'Please fill in required fields');
      return;
    }

    // TODO: API call to create/update plant
    const action = editingPlant ? 'updated' : 'listed';
    showToast('success', locale === 'kh' 
      ? `រុក្ខជាតិត្រូវបាន${action === 'updated' ? 'កែប្រែ' : 'បញ្ចូល'}ដោយជោគជ័យ!`
      : `Plant ${action} successfully!`
    );
    
    handleClose();
    // Navigate to seller dashboard
    // useAppStore.getState().setScreen('seller-dashboard');
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`
          fixed inset-0 z-[90] bg-black/45 backdrop-blur-md
          transition-opacity duration-300
          ${isClosing ? 'opacity-0' : 'opacity-100'}
        `}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            pointer-events-auto
            bg-background rounded-3xl shadow-2xl
            w-full max-w-2xl max-h-[90vh] overflow-y-auto
            transition-all duration-300 ease-out
            ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-2xl font-bold text-forest dark:text-pale-green">
              {editingPlant 
                ? (locale === 'kh' ? 'កែសម្រួលរុក្ខជាតិ' : 'Edit Plant')
                : (locale === 'kh' ? 'លក់រុក្ខជាតិ' : 'Sell a Plant')
              }
            </h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Plant Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameEn" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ឈ្មោះ (English)' : 'Plant Name (English)'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g., Monstera Deliciosa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nameKh" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ឈ្មោះ (ខ្មែរ)' : 'Plant Name (Khmer)'}
                </Label>
                <Input
                  id="nameKh"
                  value={formData.nameKh}
                  onChange={(e) => setFormData({ ...formData, nameKh: e.target.value })}
                  placeholder="ឈ្មោះរុក្ខជាតិជាភាសាខ្មែរ"
                />
              </div>
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ប្រភេទ' : 'Category'} <span className="text-destructive">*</span>
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">{locale === 'kh' ? 'ជ្រើសរើសប្រភេទ' : 'Select category'}</option>
                  <option value="Indoor">{locale === 'kh' ? 'ក្នុងផ្ទះ' : 'Indoor'}</option>
                  <option value="Outdoor">{locale === 'kh' ? 'ខាងក្រៅ' : 'Outdoor'}</option>
                  <option value="Flowering">{locale === 'kh' ? 'ផ្កា' : 'Flowering'}</option>
                  <option value="Succulents">{locale === 'kh' ? 'Succulents' : 'Succulents'}</option>
                  <option value="Trees">{locale === 'kh' ? 'ដើមឈើ' : 'Trees'}</option>
                  <option value="Rare">{locale === 'kh' ? 'កម្រ' : 'Rare'}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="price" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'តម្លៃ (USD)' : 'Price (USD)'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Commission Display */}
            {formData.price && parseFloat(formData.price) > 0 && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{locale === 'kh' ? 'តម្លៃបញ្ជី' : 'List Price'}:</span>
                  <span className="font-semibold">${formData.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{locale === 'kh' ? 'ថ្លៃសេវា (5%)' : 'Platform Fee (5%)'}:</span>
                  <span className="text-destructive">-${commission}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-accent-green">
                  <span>{locale === 'kh' ? 'អ្នកទទួលបាន' : 'You Earn'}:</span>
                  <span>${netEarnings}</span>
                </div>
              </div>
            )}

            {/* Stock */}
            <div>
              <Label htmlFor="stock" className="text-sm font-medium mb-1.5 block">
                {locale === 'kh' ? 'បរិមាណស្តុក' : 'Stock Quantity'}
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>

            {/* Taglines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tagline" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ពាក្យស្លោក (English)' : 'Tagline (English)'}
                </Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Short catchy description"
                />
              </div>
              <div>
                <Label htmlFor="taglineKh" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ពាក្យស្លោក (ខ្មែរ)' : 'Tagline (Khmer)'}
                </Label>
                <Input
                  id="taglineKh"
                  value={formData.taglineKh}
                  onChange={(e) => setFormData({ ...formData, taglineKh: e.target.value })}
                  placeholder="ពណ៌នាខ្លីៗ"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ការពិពណ៌នា (English)' : 'Description (English)'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed plant description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="descriptionKh" className="text-sm font-medium mb-1.5 block">
                  {locale === 'kh' ? 'ការពិពណ៌នា (ខ្មែរ)' : 'Description (Khmer)'}
                </Label>
                <Textarea
                  id="descriptionKh"
                  value={formData.descriptionKh}
                  onChange={(e) => setFormData({ ...formData, descriptionKh: e.target.value })}
                  placeholder="ការពិពណ៌នាលម្អិត..."
                  rows={3}
                />
              </div>
            </div>

            {/* Care Instructions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{locale === 'kh' ? 'ការថែទាំ' : 'Care Instructions'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waterFreq" className="text-sm font-medium mb-1.5 block">
                    {locale === 'kh' ? 'ប្រេកង់ស្រោចទឹក' : 'Watering Frequency'}
                  </Label>
                  <Input
                    id="waterFreq"
                    value={formData.waterFreq}
                    onChange={(e) => setFormData({ ...formData, waterFreq: e.target.value })}
                    placeholder="e.g., Weekly"
                  />
                </div>
                <div>
                  <Label htmlFor="lightReq" className="text-sm font-medium mb-1.5 block">
                    {locale === 'kh' ? 'តម្រូវការពន្លឺ' : 'Light Requirements'}
                  </Label>
                  <Input
                    id="lightReq"
                    value={formData.lightReq}
                    onChange={(e) => setFormData({ ...formData, lightReq: e.target.value })}
                    placeholder="e.g., Bright Indirect"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempRange" className="text-sm font-medium mb-1.5 block">
                    {locale === 'kh' ? 'ជួរសីតុណ្ហភាព' : 'Temperature Range'}
                  </Label>
                  <Input
                    id="tempRange"
                    value={formData.tempRange}
                    onChange={(e) => setFormData({ ...formData, tempRange: e.target.value })}
                    placeholder="e.g., 18-30°C"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty" className="text-sm font-medium mb-1.5 block">
                    {locale === 'kh' ? 'កម្រិតលំបាក' : 'Difficulty Level'}
                  </Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{locale === 'kh' ? 'ជ្រើសរើស' : 'Select'}</option>
                    <option value="Very Easy">{locale === 'kh' ? 'ងាយបំផុត' : 'Very Easy'}</option>
                    <option value="Easy">{locale === 'kh' ? 'ងាយ' : 'Easy'}</option>
                    <option value="Moderate">{locale === 'kh' ? 'មធ្យម' : 'Moderate'}</option>
                    <option value="Advanced">{locale === 'kh' ? 'កម្រិតខ្ពស់' : 'Advanced'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                {locale === 'kh' ? 'រូបភាព' : 'Photos'}
              </Label>
              
              {/* Upload Area */}
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                max={5}
                className="hidden"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="photo-upload"
                className="border-2 border-dashed rounded-xl p-8 text-center hover:border-accent-green transition-colors cursor-pointer block"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'kh' ? 'ចុចដើម្បីបញ្ចូលរូបភាព' : 'Click to upload photos'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'kh' ? 'អតិបរមា 5 រូបភាព' : 'Maximum 5 photos'}
                </p>
              </label>

              {/* Preview Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs hover:bg-destructive/90"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                {locale === 'kh' ? 'បោះបង់' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent-green hover:bg-forest-mid text-white"
              >
                {editingPlant 
                  ? (locale === 'kh' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')
                  : (locale === 'kh' ? 'បញ្ចូលរុក្ខជាតិ' : 'List Plant')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Lock body scroll when modal is open */}
      <style jsx global>{`
        body {
          overflow: ${isOpen && !isClosing ? 'hidden' : 'auto'};
        }
      `}</style>
    </>
  );
}
