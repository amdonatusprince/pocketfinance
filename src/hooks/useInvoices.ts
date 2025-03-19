import { useState, useEffect, useCallback } from 'react';
import { Invoice } from '@/types/invoice';
import { fetchInvoices, fetchInvoiceStats } from '@/services/invoiceService';

export function useInvoices(address?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      const [invoicesData, statsData] = await Promise.all([
        fetchInvoices(address),
        fetchInvoiceStats(address)
      ]);
      setInvoices(invoicesData);
      setStats(statsData.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { invoices, stats, loading, error, refetch: loadData };
} 