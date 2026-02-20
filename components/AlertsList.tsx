'use client'

import { useState } from 'react';
import { Trash2, Edit, Bell, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import { deleteAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';
import AlertModal from './AlertModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Alert {
  _id: string;
  alertName: string;
  symbol: string;
  company: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  triggered: boolean;
  createdAt: string;
}

export default function AlertsList({ alerts, setAlerts }: { alerts: Alert[]; setAlerts?: (alerts: Alert[]) => void }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; alert?: Alert }>({ open: false });
  const router = useRouter();

  const handleDelete = async (alertId: string) => {
    setDeleting(alertId);
    if (setAlerts) {
      setAlerts(alerts.filter(a => a._id !== alertId));
    }
    try {
      const result = await deleteAlert(alertId);
      if (result.success) {
        toast.success('Alert deleted successfully');
        window.dispatchEvent(new Event('alertsChanged'));
      } else {
        toast.error(result.error || 'Failed to delete alert');
        if (setAlerts) {
          window.dispatchEvent(new Event('alertsChanged'));
        }
      }
    } catch (error) {
      toast.error('Failed to delete alert');
      if (setAlerts) {
        window.dispatchEvent(new Event('alertsChanged'));
      }
    } finally {
      setDeleting(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
          <Bell className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">No Active Alerts</h3>
        <p className="text-xs text-gray-600">Add alerts from your watchlist</p>
      </div>
    );
  }

  const activeAlerts = alerts.filter(alert => !alert.triggered);

  if (activeAlerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
          <Bell className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">No Active Alerts</h3>
        <p className="text-xs text-gray-600">All alerts have been triggered</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {activeAlerts.map((alert) => (
          <div
            key={alert._id}
            className="group relative overflow-hidden rounded-xl border transition-all hover:shadow-lg bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700/50 hover:border-yellow-500/30"
          >
            {/* Accent Bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${
                alert.alertType === 'upper' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />

            <div className="p-4 pl-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="font-semibold text-gray-100 text-sm uppercase">{alert.alertName}</span>
                  </div>
                  <Link
                    href={`/stocks/${alert.symbol}`}
                    className="text-xs text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {alert.company} ({alert.symbol})
                  </Link>
                </div>
              </div>

              {/* Price Info */}
              <div className="flex items-center gap-3 mb-3 p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {alert.alertType === 'upper' ? (
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-red-500/10 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">
                    {alert.alertType === 'upper' ? 'Price Above' : 'Price Below'}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      alert.alertType === 'upper' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    ${alert.threshold.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(alert.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditModal({ open: true, alert })}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-yellow-500"
                    title="Edit alert"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert._id)}
                    disabled={deleting === alert._id}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50"
                    title="Delete alert"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editModal.open && editModal.alert && (
        <AlertModal
          open={editModal.open}
          setOpen={(open) => setEditModal({ open, alert: undefined })}
          symbol={editModal.alert.symbol}
          company={editModal.alert.company}
          alertData={editModal.alert}
          alertId={editModal.alert._id}
        />
      )}
    </>
  );
}
