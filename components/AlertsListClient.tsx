'use client'

import { useState, useEffect } from 'react';
import AlertsList from './AlertsList';
import { getUserAlerts } from '@/lib/actions/alert.actions';

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

export default function AlertsListClient({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);

  const refreshAlerts = async () => {
    try {
      const updatedAlerts = await getUserAlerts();
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshAlerts, 30000);
    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const alert = customEvent.detail;
        setAlerts(prev => {
          const exists = prev.find(a => a._id === alert._id);
          if (exists) {
            return prev.map(a => a._id === alert._id ? alert : a);
          }
          return [alert, ...prev];
        });
      } else {
        refreshAlerts();
      }
    };
    window.addEventListener('alertsChanged', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('alertsChanged', handleRefresh);
    };
  }, []);

  return <AlertsList alerts={alerts} setAlerts={setAlerts} />;
}
