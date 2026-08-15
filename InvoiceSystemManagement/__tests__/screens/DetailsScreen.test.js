import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Context as ScannerContext } from '../../src/contexts/scannerContext';
import DetailsScreen from '../../src/screens/DetailsScreen';

describe('DetailsScreen component tests', () => {
  const mockBackToList = jest.fn();
  const mockDeleteInvoiceRecord = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderDetailsScreen = async (state) => {
    return await render(
      <ScannerContext.Provider value={{ state, backToList: mockBackToList, deleteInvoiceRecord: mockDeleteInvoiceRecord }}>
        <DetailsScreen />
      </ScannerContext.Provider>
    );
  };

  it('should render fallback empty state when no invoice is selected', async () => {
    const { getByText } = await renderDetailsScreen({ selectedInvoice: null });

    expect(getByText('No invoice selected.')).toBeTruthy();
    const backBtn = getByText('Back to List');
    expect(backBtn).toBeTruthy();

    await fireEvent.press(backBtn);
    expect(mockBackToList).toHaveBeenCalledTimes(1);
  });

  it('should render selected invoice details correctly', async () => {
    const selectedInvoice = {
      id: 5,
      vendorName: 'IGA Supermarket',
      abn: '55 123 456 789',
      invoiceNumber: 'IGA-99128',
      invoiceDate: '15/08/2026',
      currency: '$',
      subtotal: 90.0,
      tax: 9.0,
      total: 99.0,
      items: [
        { description: 'Fresh Apples', quantity: 3, amount: 45.0 },
        { description: 'Organic Milk', quantity: 2, amount: 15.0 }, // Different amount to make queries unique
      ],
    };

    const { getByText } = await renderDetailsScreen({ selectedInvoice });

    expect(getByText('Invoice Details')).toBeTruthy();
    expect(getByText('IGA Supermarket')).toBeTruthy();
    expect(getByText('ABN: 55 123 456 789')).toBeTruthy();
    expect(getByText('Invoice N° IGA-99128')).toBeTruthy();
    expect(getByText('15/08/2026')).toBeTruthy();

    // Check items
    expect(getByText('Fresh Apples')).toBeTruthy();
    expect(getByText('Quantity: 3')).toBeTruthy();
    expect(getByText('$ 45')).toBeTruthy();

    expect(getByText('Organic Milk')).toBeTruthy();
    expect(getByText('Quantity: 2')).toBeTruthy();
    expect(getByText('$ 15')).toBeTruthy();

    // Check pricing totals
    expect(getByText('Subtotal')).toBeTruthy();
    expect(getByText('$ 90')).toBeTruthy();
    expect(getByText('GST')).toBeTruthy();
    expect(getByText('$ 9')).toBeTruthy();
    expect(getByText('$ 99')).toBeTruthy();
  });

  it('should display confirmation dialog when "Delete Record" is clicked', async () => {
    const selectedInvoice = {
      id: 5,
      vendorName: 'IGA Supermarket',
      total: 99.0,
      items: [],
    };

    const { getByText } = await renderDetailsScreen({ selectedInvoice });

    const deleteBtn = getByText('Delete Record');
    expect(deleteBtn).toBeTruthy();

    await fireEvent.press(deleteBtn);

    // Verify Native Alert was shown with exact arguments
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: expect.any(Function),
        },
      ]
    );

    // Grab the onPress handler from the Mock call and execute it to verify delete deletion call
    const deleteButtonOption = Alert.alert.mock.calls[0][2][1];
    deleteButtonOption.onPress();

    expect(mockDeleteInvoiceRecord).toHaveBeenCalledWith(5);
  });

  it('should trigger backToList when Back to List button is pressed', async () => {
    const selectedInvoice = {
      id: 5,
      vendorName: 'IGA Supermarket',
      total: 99.0,
      items: [],
    };

    const { getByText } = await renderDetailsScreen({ selectedInvoice });

    const backBtn = getByText('Back to List');
    await fireEvent.press(backBtn);
    expect(mockBackToList).toHaveBeenCalledTimes(1);
  });
});
