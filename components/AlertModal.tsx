'use client'

import { useState } from 'react';
import { X } from 'lucide-react';
import { createAlert, updateAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from 'next/navigation';

export default function AlertModal({ 
  open, 
  setOpen, 
  symbol, 
  company,
  currentPrice,
  alertData,
  alertId
}: { 
  open: boolean; 
  setOpen: (open: boolean) => void;
  symbol: string;
  company: string;
  currentPrice?: number;
  alertData?: { alertName: string; alertType: 'upper' | 'lower'; threshold: number };
  alertId?: string;
}) {
  const [formData, setFormData] = useState({
    alertName: alertData?.alertName || '',
    alertType: (alertData?.alertType || 'upper') as 'upper' | 'lower',
    threshold: alertData?.threshold?.toString() || currentPrice?.toString() || '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = alertId
        ? await updateAlert(alertId, formData)
        : await createAlert({ symbol, company, ...formData });

      if (result.success) {
        toast.success(alertId ? 'Alert updated successfully' : 'Alert created successfully');
        setOpen(false);
        setFormData({ alertName: '', alertType: 'upper', threshold: '' });
        window.dispatchEvent(new CustomEvent('alertsChanged', { detail: result.alert }));
      } else {
        toast.error(result.error || 'Failed to save alert');
      }
    } catch (error) {
      toast.error('Failed to save alert');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">
            {alertId ? 'Edit Price Alert' : 'Create Price Alert'}
          </h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">
          {company} ({symbol})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="form-label mb-2 block">Alert Name</Label>
            <Input
              value={formData.alertName}
              onChange={(e) => setFormData({ ...formData, alertName: e.target.value })}
              placeholder="e.g., Buy Signal"
              required
              className="form-input"
            />
          </div>

          <div>
            <Label className="form-label mb-2 block">Alert Type</Label>
            <select
              value={formData.alertType}
              onChange={(e) => setFormData({ ...formData, alertType: e.target.value as 'upper' | 'lower' })}
              className="form-input w-full"
            >
              <option value="upper">Price Above</option>
              <option value="lower">Price Below</option>
            </select>
          </div>

          <div>
            <Label className="form-label mb-2 block">Threshold Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              placeholder="0.00"
              required
              className="form-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="yellow-btn flex-1">
              {loading ? 'Saving...' : alertId ? 'Update Alert' : 'Create Alert'}
            </Button>
            <Button 
              type="button" 
              onClick={() => setOpen(false)} 
              className="bg-gray-700 hover:bg-gray-600 text-white flex-1 h-12 rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
