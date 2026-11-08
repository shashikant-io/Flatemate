import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon, CATEGORY_CONFIG } from '@/components/common/CategoryIcon';
import {
  Camera,
  CheckCircle2,
  Calendar,
  FileText,
  Package,
  Sparkles,
  ArrowLeft,
  X,
  Upload,
} from 'lucide-react';
import { useFlat } from '@/context/FlatContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  rupeesToPaise,
  validateExpenseInput,
} from '@flatmate/shared';
import { compressImage, uploadExpensePhoto } from '@/lib/storageUpload';
import { cn } from '@/lib/utils';

export function AddExpensePage() {
  const navigate = useNavigate();
  const { currentMemberId, addExpense } = useFlat();
  const { member: authMember } = useAuth();

  const activeViewer = (authMember || currentMemberId) as 'shashikant' | 'nitesh';

  const [amountStr, setAmountStr] = useState('');
  const [item, setItem] = useState('');
  const [paidBy, setPaidBy] = useState<'shashikant' | 'nitesh'>(activeViewer);
  const [type, setType] = useState<'shared' | 'personal'>('shared');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Quick suggestion chips for common flat purchases
  const QUICK_ITEMS: Array<{ name: string; category: ExpenseCategory }> = [
    { name: 'Milk & Curd', category: 'Dairy' },
    { name: 'Atta (Flour)', category: 'Groceries' },
    { name: 'Rice (5kg)', category: 'Groceries' },
    { name: 'Cooking Oil', category: 'Groceries' },
    { name: 'Vegetables', category: 'Vegetables' },
    { name: 'Electricity Bill', category: 'Utilities' },
    { name: 'Vim & Detergent', category: 'Cleaning' },
    { name: 'Water Cans', category: 'Utilities' },
  ];

  // Client-side image compression
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIDE = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIDE) {
            height = Math.round((height * MAX_SIDE) / width);
            width = MAX_SIDE;
          }
        } else {
          if (height > MAX_SIDE) {
            width = Math.round((width * MAX_SIDE) / height);
            height = MAX_SIDE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoPreview(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setErrors({});

    // 1. Validate amount
    let paise = 0;
    try {
      paise = rupeesToPaise(amountStr);
    } catch {
      setErrors((prev) => ({ ...prev, amount: 'Enter a valid amount (e.g. 150.50)' }));
      return;
    }

    // 2. Validate expense data
    const month = date.slice(0, 7);
    const validation = validateExpenseInput({
      item,
      amountPaise: paise,
      paidBy,
      type,
      category,
      date,
      month,
      validMemberIds: ['shashikant', 'nitesh'],
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    addExpense({
      item: item.trim(),
      amountPaise: paise,
      paidBy,
      type,
      category,
      date,
      month,
      quantity: quantity.trim() || undefined,
      notes: notes.trim() || undefined,
      imagePath: photoPreview || undefined,
    });

    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setAmountStr('');
    setItem('');
    setQuantity('');
    setNotes('');
    setPhotoPreview(null);
    setShowSuccess(false);
    setErrors({});
  };

  if (showSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-scale-in">
        <Card className="rounded-hero p-8 text-center max-w-sm w-full space-y-5 shadow-xl border-emerald-500/30">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="font-heading font-extrabold text-2xl text-foreground">
              Expense Recorded!
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Live split updated for Shashikant & Nitesh.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="saffron"
              size="lg"
              className="w-full font-bold shadow-raised"
              onClick={resetForm}
            >
              Add Another Expense
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/')}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-heading font-extrabold tracking-tight">
              Add Expense
            </h2>
            <p className="text-xs text-muted-foreground">Record item, amount, and payer</p>
          </div>
        </div>
      </div>

      {/* Hero Amount Field */}
      <Card className="rounded-card p-6 text-center space-y-2 border-2 border-amber-500/30 shadow-josh bg-card/95 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <label
          htmlFor="expense-amount"
          className="text-xs uppercase tracking-wider font-bold text-muted-foreground block"
        >
          Amount in Rupees
        </label>
        <div className="flex items-center justify-center text-4xl md:text-5xl font-heading font-black text-foreground">
          <span className="text-amber-500 mr-2 font-black">₹</span>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => {
              setAmountStr(e.target.value);
              if (errors.amount || errors.amountPaise) {
                setErrors((prev) => ({ ...prev, amount: '', amountPaise: '' }));
              }
            }}
            className="w-60 bg-transparent text-center focus:outline-none font-heading font-black tracking-tight placeholder:text-muted-foreground/30 text-foreground"
            autoFocus
          />
        </div>
        {(errors.amount || errors.amountPaise) && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.amount || errors.amountPaise}
          </p>
        )}
      </Card>

      {/* Main Details Card */}
      <Card className="rounded-card p-5 space-y-5 shadow-card">
        {/* Item Name Input & Chips */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">
            What was purchased? <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g. Atta, Milk, Cooking Oil, Veggies"
            value={item}
            onChange={(e) => {
              setItem(e.target.value);
              if (errors.item) setErrors((prev) => ({ ...prev, item: '' }));
            }}
            className="text-base"
          />
          {errors.item && <p className="text-xs text-destructive">{errors.item}</p>}

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_ITEMS.map((quick) => (
              <button
                key={quick.name}
                type="button"
                onClick={() => {
                  setItem(quick.name);
                  setCategory(quick.category);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border/60 hover:border-amber-500/40"
              >
                + {quick.name}
              </button>
            ))}
          </div>
        </div>

        {/* Paid By Segmented Control */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground block">
            Who paid?
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setPaidBy('shashikant')}
              className={cn(
                'py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px]',
                paidBy === 'shashikant'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-teal-glow'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Shashikant {activeViewer === 'shashikant' ? '(Me)' : ''}
            </button>
            <button
              type="button"
              onClick={() => setPaidBy('nitesh')}
              className={cn(
                'py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px]',
                paidBy === 'nitesh'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-plum-glow'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Nitesh {activeViewer === 'nitesh' ? '(Me)' : ''}
            </button>
          </div>
        </div>

        {/* Category Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              const Icon = config.icon;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all min-h-[58px]',
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-sm'
                      : 'border-border/70 bg-card hover:bg-muted text-muted-foreground'
                  )}
                >
                  <Icon size={16} className={cn('mb-1', isSelected ? 'text-amber-600 dark:text-amber-400' : '')} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expense Type (Shared vs Personal) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground block">
            Split Mode
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setType('shared')}
              className={cn(
                'py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px]',
                type === 'shared'
                  ? 'bg-forest-800 text-white dark:bg-forest-700 font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Shared (Split 50/50)
            </button>
            <button
              type="button"
              onClick={() => setType('personal')}
              className={cn(
                'py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px]',
                type === 'personal'
                  ? 'bg-forest-800 text-white dark:bg-forest-700 font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Personal (No Split)
            </button>
          </div>
        </div>

        {/* Date & Optional Quantity in 2 cols */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
              Quantity (Optional)
            </label>
            <Input
              placeholder="e.g. 5kg, 2L"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Notes (Optional)
          </label>
          <Input
            placeholder="e.g. Bought from Nature's Basket"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Photo / Receipt Capture */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" />
            Item Photo / Receipt (Auto-Compressed)
          </label>

          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border h-40 bg-black/5">
              <img
                src={photoPreview}
                alt="Receipt preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-border hover:bg-muted/50 cursor-pointer transition-colors min-h-[80px]">
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs font-medium text-foreground">
                Take photo or pick from gallery
              </span>
              <span className="text-[10px] text-muted-foreground">
                Compressed to &lt; 250KB before upload
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </label>
          )}
        </div>

        {/* Save Button */}
        <Button
          type="button"
          variant="saffron"
          size="huge"
          className="w-full font-black shadow-josh mt-2 text-slate-950 hover:scale-[1.01] active:scale-[0.98]"
          onClick={handleSave}
          disabled={isSubmitting || !amountStr.trim() || !item.trim()}
        >
          {isSubmitting ? 'Saving...' : 'Save Expense (One Tap)'}
        </Button>
      </Card>
    </div>
  );
}
