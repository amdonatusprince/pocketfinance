import { Invoice } from '@/types/invoice';

export async function fetchInvoices(address?: string) {
  const url = new URL('/api/invoices', window.location.origin);
  if (address) {
    url.searchParams.append('address', address);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  const data = await response.json();
  return data.invoices as Invoice[];
}

export async function fetchInvoiceStats(address: string) {
  const invoices = await fetchInvoices(address);
  const totalInvoiced = invoices.reduce((sum, invoice) => {
    const amount = Number(invoice.amount);
    return sum + amount;
  }, 0);

  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, invoice) => {
    const amount = Number(invoice.amount);
    return sum + amount;
  }, 0);

  const overdueInvoices = invoices.filter(invoice => 
    invoice.status === 'pending' && invoice.dueDate && new Date(invoice.dueDate) < new Date()
  );

  // Filter pending invoices to exclude overdue ones
  const pendingInvoices = invoices.filter(invoice => 
    invoice.status === 'pending' && (!invoice.dueDate || new Date(invoice.dueDate) >= new Date())
  );
  
  const pendingAmount = invoices.reduce((sum, invoice) => {
    const amount = Number(invoice.amount);
    return sum + amount;
  }, 0);

  return {
    totalInvoiced,
    totalPaid,
    pendingAmount,
    stats: {
      totalInvoiced: {
        amount: totalInvoiced,
        transactions: invoices.length
      },
      totalPaid: {
        amount: totalPaid,
        transactions: paidInvoices.length
      },
      paidInvoices: {
        amount: totalPaid,
        transactions: paidInvoices.length
      },
      pendingAmount: {
        amount: pendingAmount,
        transactions: pendingInvoices.length
      },
      invoiceStatus: {
        pending: pendingInvoices.length,
        overdue: overdueInvoices.length
      }
    }
  };
} 