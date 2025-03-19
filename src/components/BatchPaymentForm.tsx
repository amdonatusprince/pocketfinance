import { useState } from 'react';
import { X, Upload, Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Recipient {
  address: string;
  amount: string;
  reason?: string;
}

interface BatchPaymentFormProps {
  onSubmit: (recipients: Recipient[]) => void;
  onCancel: () => void;
}

export default function BatchPaymentForm({ onSubmit, onCancel }: BatchPaymentFormProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentRecipient, setCurrentRecipient] = useState<Recipient>({
    address: '',
    amount: '',
    reason: ''
  });
  const [csvError, setCsvError] = useState<string>('');

  const handleAddRecipient = () => {
    if (editingIndex !== null) {
      // Update existing recipient
      const updatedRecipients = [...recipients];
      updatedRecipients[editingIndex] = currentRecipient;
      setRecipients(updatedRecipients);
      setEditingIndex(null);
    } else {
      // Add new recipient
      setRecipients([...recipients, currentRecipient]);
    }
    setCurrentRecipient({ address: '', amount: '', reason: '' });
  };

  const handleEditRecipient = (index: number) => {
    setEditingIndex(index);
    setCurrentRecipient(recipients[index]);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Skip header row and process data
        const newRecipients = lines.slice(1).map(line => {
          const [address, amount, reason] = line.split(',').map(item => item.trim());
          if (!address || !amount) throw new Error('Invalid CSV format');
          return { address, amount, reason };
        }).filter(recipient => recipient.address && recipient.amount);

        setRecipients([...recipients, ...newRecipients]);
        setCsvError('');
      } catch (error) {
        setCsvError('Invalid CSV format. Please use the correct format: address,amount,reason(optional)');
      }
    };
    reader.readAsText(file);
  };

  const totalAmount = recipients.reduce((sum, recipient) => {
    return sum + (parseFloat(recipient.amount) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* CSV Upload Section */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <div className="text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-[#007BFF] hover:text-[#0056b3]">Upload a CSV file</span>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: address,amount,reason(optional)
          </p>
          {csvError && (
            <p className="text-sm text-red-500 mt-2">{csvError}</p>
          )}
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={currentRecipient.address}
              onChange={(e) => setCurrentRecipient({ ...currentRecipient, address: e.target.value })}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={currentRecipient.amount}
              onChange={(e) => setCurrentRecipient({ ...currentRecipient, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason (Optional)
          </label>
          <input
            type="text"
            value={currentRecipient.reason}
            onChange={(e) => setCurrentRecipient({ ...currentRecipient, reason: e.target.value })}
            placeholder="Enter payment reason"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800"
          />
        </div>
        <button
          onClick={handleAddRecipient}
          disabled={!currentRecipient.address || !currentRecipient.amount}
          className="flex items-center gap-2 px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {editingIndex !== null ? 'Update Recipient' : 'Add Recipient'}
        </button>
      </div>

      {/* Recipients List */}
      {recipients.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recipients ({recipients.length})
          </h3>
          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {recipient.address}
                  </p>
                  <div className="flex items-center mt-1">
                    <Image src="/usd-coin.svg" alt="USDC" width={20} height={20} />
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                      {recipient.amount} USDC
                    </span>
                  </div>
                  {recipient.reason && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {recipient.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditRecipient(index)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveRecipient(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount:</span>
            <div className="flex items-center">
              <Image src="/usd-coin.svg" alt="USDC" width={25} height={25} />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                {totalAmount.toFixed(2)} USDC
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(recipients)}
              className="px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors"
            >
              Process Batch Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 