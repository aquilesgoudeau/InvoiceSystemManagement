import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Context as ExportContext } from '../../src/contexts/exportContext';
import ExportReportModal from '../../src/components/landingPageComponent/exportReportModal';

describe('ExportReportModal Component Tests', () => {
  const mockLoadLastEmail = jest.fn();
  const mockSendReport = jest.fn();
  const mockResetExportState = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = async (exportState, customProps = {}) => {
    const defaultProps = {
      visible: true,
      invoices: [{ id: 1, vendorName: 'Coles', total: 100 }],
      dateRange: { startDate: new Date('2026-08-01'), endDate: new Date('2026-08-15') },
      onClose: mockOnClose,
    };

    return await render(
      <ExportContext.Provider
        value={{
          state: exportState,
          loadLastEmail: mockLoadLastEmail,
          sendReport: mockSendReport,
          resetExportState: mockResetExportState,
        }}
      >
        <ExportReportModal {...defaultProps} {...customProps} />
      </ExportContext.Provider>
    );
  };

  it('should call resetExportState and loadLastEmail when visible is set to true', async () => {
    const state = { sending: false, error: null, success: false, lastEmail: 'user@test.com' };
    await renderModal(state);

    expect(mockResetExportState).toHaveBeenCalledTimes(1);
    expect(mockLoadLastEmail).toHaveBeenCalledTimes(1);
  });

  it('should initialize input field with lastEmail value from context state', async () => {
    const state = { sending: false, error: null, success: false, lastEmail: 'saved@email.com' };
    const { getByPlaceholderText } = await renderModal(state);

    const input = getByPlaceholderText('Email del destinatario');
    expect(input.props.value).toBe('saved@email.com');
  });

  it('should show local error if user clicks Send with empty or invalid email format', async () => {
    const state = { sending: false, error: null, success: false, lastEmail: '' };
    const { getByPlaceholderText, getByText } = await renderModal(state);

    const input = getByPlaceholderText('Email del destinatario');
    await fireEvent.changeText(input, 'invalid-email');

    const sendBtn = getByText('Send');
    await fireEvent.press(sendBtn);

    expect(getByText('Ingresa un email válido')).toBeTruthy();
    expect(mockSendReport).not.toHaveBeenCalled();
  });

  it('should show local error if there are no invoices to export', async () => {
    const state = { sending: false, error: null, success: false, lastEmail: 'test@domain.com' };
    const { getByText } = await renderModal(state, { invoices: [] });

    const sendBtn = getByText('Send');
    await fireEvent.press(sendBtn);

    expect(getByText('No hay facturas para exportar en este período')).toBeTruthy();
    expect(mockSendReport).not.toHaveBeenCalled();
  });

  it('should invoke sendReport action with correct arguments on valid input', async () => {
    const invoices = [{ id: 1, total: 100 }];
    const dateRange = { startDate: new Date('2026-08-01'), endDate: new Date('2026-08-15') };
    const state = { sending: false, error: null, success: false, lastEmail: 'test@test.com' };

    const { getByText } = await renderModal(state, { invoices, dateRange });

    const sendBtn = getByText('Send');
    await fireEvent.press(sendBtn);

    expect(mockSendReport).toHaveBeenCalledWith({
      invoices,
      dateRange,
      email: 'test@test.com',
    });
  });

  it('should display ActivityIndicator instead of text when sending is true', async () => {
    const state = { sending: true, error: null, success: false, lastEmail: 'user@email.com' };
    const { getByPlaceholderText, queryByText } = await renderModal(state);

    // Should disable input and button
    const input = getByPlaceholderText('Email del destinatario');
    expect(input.props.editable).toBe(false);

    // Button should be disabled
    expect(queryByText('Send')).toBeNull(); // Text replaced by ActivityIndicator
  });

  it('should render success message when report succeeds and close modal after timeout', async () => {
    jest.useFakeTimers();
    const state = { sending: false, error: null, success: true, lastEmail: 'user@email.com' };

    const { getByText } = await renderModal(state);

    expect(getByText('Report sent successfully')).toBeTruthy();

    // Fast-forward timers
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('should show error banner when report fails', async () => {
    const state = { sending: false, error: 'Network Error', success: false, lastEmail: 'user@email.com' };
    const { getByText } = await renderModal(state);

    expect(getByText('Network Error')).toBeTruthy();
  });

  it('should trigger onClose when clicking close cross icon', async () => {
    const state = { sending: false, error: null, success: false, lastEmail: '' };
    const { getByTestId } = await renderModal(state);

    const closeBtn = getByTestId('LucideX').parent;
    await fireEvent.press(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
