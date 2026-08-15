import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Mail } from 'lucide-react-native';
import ExportReportModal from './exportReportModal';

const ExportReportButton = ({ invoices, dateRange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        className="flex-row items-center justify-center px-3.5 py-3 rounded-2xl shadow-sm self-start"
        style={{ backgroundColor: '#ef4444' }}
      >
        <Mail size={18} color="#ffffff" />
        <Text className="ml-1.5 font-bold text-xs text-white">Export</Text>
      </TouchableOpacity>

      <ExportReportModal
        visible={visible}
        invoices={invoices}
        dateRange={dateRange}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

export default ExportReportButton;