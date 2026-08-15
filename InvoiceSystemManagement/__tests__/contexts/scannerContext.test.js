import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Context, Provider } from '../../src/contexts/scannerContext';
import axiosApi from '../../src/services/axiosApi';
import { saveInvoice, getAllInvoices, deleteInvoice } from '../../src/db/database';
import { navigate, goBack } from '../../src/navigation/navigationRef';

// Mock axios instance
jest.mock('../../src/services/axiosApi', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock SQLite database methods
jest.mock('../../src/db/database', () => ({
  saveInvoice: jest.fn(),
  getAllInvoices: jest.fn(),
  deleteInvoice: jest.fn(),
}));

// Mock navigation
jest.mock('../../src/navigation/navigationRef', () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
}));

const TestComponent = () => {
  const {
    state,
    geminiScan,
    clearScan,
    handleScanCancel,
    handleScanAccept,
    acceptInvoice,
    rejectScan,
    fetchInvoices,
    selectInvoice,
    backToList,
    deleteInvoiceRecord,
  } = useContext(Context);

  return (
    <View>
      <Text testID="errorMessage">{state.errorMessage || 'null'}</Text>
      <Text testID="scannedUri">{state.scannedUri || 'null'}</Text>
      <Text testID="invoicesCount">{state.invoices ? state.invoices.length : 0}</Text>
      <Text testID="selectedInvoiceId">{state.selectedInvoice ? state.selectedInvoice.id : 'null'}</Text>
      <Text testID="resultVendor">{state.result ? state.result.vendorName : 'null'}</Text>

      <Button testID="clearScanBtn" title="ClearScan" onPress={clearScan} />
      <Button testID="cancelBtn" title="Cancel" onPress={handleScanCancel} />
      
      <Button testID="acceptScanBtn" title="AcceptScan" onPress={() => handleScanAccept('file://scanned.jpg')} />
      
      <Button testID="geminiScanBtn" title="GeminiScan" onPress={() => geminiScan({
        fileToUpload: { uri: 'file://img.jpg', name: 'img.jpg', type: 'image/jpeg' }
      })} />
      
      <Button testID="acceptInvoiceBtn" title="AcceptInvoice" onPress={() => acceptInvoice({ id: 10, vendorName: 'Vendor X' })} />
      
      <Button testID="rejectScanBtn" title="RejectScan" onPress={rejectScan} />
      
      <Button testID="fetchInvoicesBtn" title="Fetch" onPress={fetchInvoices} />
      
      <Button testID="selectBtn" title="Select" onPress={() => selectInvoice({ id: 99, vendorName: 'Target' })} />
      
      <Button testID="backBtn" title="Back" onPress={backToList} />
      
      <Button testID="deleteBtn" title="Delete" onPress={() => deleteInvoiceRecord(99)} />
    </View>
  );
};

describe('ScannerContext integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = async () => {
    return await render(
      <Provider>
        <TestComponent />
      </Provider>
    );
  };

  it('should initialize with default states', async () => {
    const { getByTestId } = await renderWithProvider();
    expect(getByTestId('errorMessage').props.children).toBe('null');
    expect(getByTestId('scannedUri').props.children).toBe('null');
    expect(getByTestId('invoicesCount').props.children).toBe(0); // number assertion
    expect(getByTestId('selectedInvoiceId').props.children).toBe('null');
  });

  it('should handle scan cancellation flow', async () => {
    const { getByTestId } = await renderWithProvider();
    await fireEvent.press(getByTestId('cancelBtn'));
    expect(navigate).toHaveBeenCalledWith('Home');
  });

  it('should handle scan acceptance and navigate to Preview', async () => {
    const { getByTestId } = await renderWithProvider();
    await fireEvent.press(getByTestId('acceptScanBtn'));
    expect(getByTestId('scannedUri').props.children).toBe('file://scanned.jpg');
    expect(navigate).toHaveBeenCalledWith('Preview');
  });

  it('should upload to Gemini scan API and save scan result', async () => {
    const mockApiResponse = {
      data: {
        vendorName: 'Costco Wholesale',
        total: 150.0,
      },
    };
    axiosApi.post.mockResolvedValueOnce(mockApiResponse);

    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('geminiScanBtn'));

    expect(axiosApi.post).toHaveBeenCalledWith('/api/scan', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(getByTestId('resultVendor').props.children).toBe('Costco Wholesale');
    expect(navigate).toHaveBeenCalledWith('GeminiResult');
  });

  it('should accept final invoice, save to database and redirect to Home', async () => {
    saveInvoice.mockResolvedValueOnce(10);
    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('acceptInvoiceBtn'));

    expect(saveInvoice).toHaveBeenCalledWith({ id: 10, vendorName: 'Vendor X' });
    expect(navigate).toHaveBeenCalledWith('Home');
  });

  it('should fetch invoices from SQLite and update list state', async () => {
    const mockInvoices = [
      { id: 1, vendorName: 'Vendor 1' },
      { id: 2, vendorName: 'Vendor 2' },
    ];
    getAllInvoices.mockResolvedValueOnce(mockInvoices);

    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('fetchInvoicesBtn'));

    expect(getAllInvoices).toHaveBeenCalled();
    expect(getByTestId('invoicesCount').props.children).toBe(2); // number assertion
  });

  it('should select an invoice and navigate to Details', async () => {
    const { getByTestId } = await renderWithProvider();
    await fireEvent.press(getByTestId('selectBtn'));
    expect(getByTestId('selectedInvoiceId').props.children).toBe(99); // number assertion
    expect(navigate).toHaveBeenCalledWith('Details');
  });

  it('should trigger goBack on backToList', async () => {
    const { getByTestId } = await renderWithProvider();
    await fireEvent.press(getByTestId('backBtn'));
    expect(goBack).toHaveBeenCalled();
  });

  it('should delete invoice from database, refresh list and navigate back', async () => {
    deleteInvoice.mockResolvedValueOnce();
    getAllInvoices.mockResolvedValueOnce([{ id: 1, vendorName: 'Vendor 1' }]);

    const { getByTestId } = await renderWithProvider();

    await fireEvent.press(getByTestId('deleteBtn'));

    expect(deleteInvoice).toHaveBeenCalledWith(99);
    expect(getAllInvoices).toHaveBeenCalled();
    expect(goBack).toHaveBeenCalled();
  });
});
