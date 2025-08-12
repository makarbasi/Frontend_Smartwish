import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/LanguageContext.jsx';

// Utility function to get base URL based on environment
const getBaseUrl = () => {
  // Use VITE_API_URL if defined
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback to previous logic
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || 5173}`;
  } else {
    // Check if we're on Render.com
    if (window.location.hostname.includes('onrender.com')) {
      return `${window.location.protocol}//${window.location.hostname}`;
    } else {
      return import.meta.env.VITE_PRODUCTION_URL || 'https://app.smartwish.us';
    }
  }
};

const PrinterSelectionModal = ({ isOpen, onClose, onPrinterSelect, isPrinting }) => {
  const { t } = useLanguage();
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPrinters();
    }
  }, [isOpen]);

  const fetchPrinters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getBaseUrl()}/get-printers`);
      if (!response.ok) {
        throw new Error('Failed to fetch printers');
      }
      const data = await response.json();
      
      // Check if we're in a cloud environment that requires local print agent
      if (data.requiresLocalAgent) {
        setPrinters([]);
        setError(data.message || 'Printer access requires local print agent. Please run the local print agent on your computer to access printers.');
        return;
      }
      
      setPrinters(data.printers || []);
      
      // Auto-select first printer if available
      if (data.printers && data.printers.length > 0) {
        setSelectedPrinter(data.printers[0].name);
      }
    } catch (err) {
      console.error('Error fetching printers:', err);
      setError('Failed to load printers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (selectedPrinter) {
      onPrinterSelect(selectedPrinter);
      onClose();
    }
  };

  const handleRefresh = () => {
    fetchPrinters();
  };

  if (!isOpen) return null;

  return (
    <div className="printer-selection-modal">
      <div className="printer-selection-content">
        <h3>{t('selectPrinter') || 'Select Printer'}</h3>
        
        {loading && (
          <div className="loading-printers">
            <p>{t('loadingPrinters') || 'Loading printers...'}</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRefresh} className="refresh-btn">
              {t('refresh') || 'Refresh'}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {printers.length === 0 ? (
              <div className="no-printers">
                <p>{t('noPrintersFound') || 'No printers found. Please check your printer connections.'}</p>
                <button onClick={handleRefresh} className="refresh-btn">
                  {t('refresh') || 'Refresh'}
                </button>
              </div>
            ) : (
              <>
                <div className="printer-list">
                  {printers.map((printer, index) => (
                    <div 
                      key={index} 
                      className={`printer-option ${selectedPrinter === printer.name ? 'selected' : ''}`}
                      onClick={() => setSelectedPrinter(printer.name)}
                    >
                      <input
                        type="radio"
                        name="printer"
                        value={printer.name}
                        checked={selectedPrinter === printer.name}
                        onChange={() => setSelectedPrinter(printer.name)}
                      />
                      <label>{printer.name}</label>
                    </div>
                  ))}
                </div>

                <div className="printer-actions">
                  <button
                    onClick={handlePrint}
                    disabled={!selectedPrinter || isPrinting}
                    className="print-btn"
                  >
                    {isPrinting ? (t('printing') || 'Printing...') : (t('print') || 'Print')}
                  </button>
                  <button onClick={onClose} className="cancel-btn">
                    {t('cancel') || 'Cancel'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrinterSelectionModal; 