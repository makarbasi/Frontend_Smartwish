import React from 'react';
import '../styles/ModalBase.css';
import '../styles/PaymentModal.css';
import { useLanguage } from '../hooks/LanguageContext.jsx';

const PaymentModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handlePaymentClick = (paymentMethod) => {
    // This would typically open the payment app or redirect to payment page
    console.log(`Opening ${paymentMethod} payment...`);
    // For now, just show an alert
    alert(`${t('payWith' + paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1))} - Payment functionality would be implemented here`);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>{t('paymentOptions')}</h2>
          <button className="payment-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="payment-modal-body">
          <p className="payment-description">{t('paymentDescription')}</p>
          
          <div className="payment-methods">
            <div className="payment-method" onClick={() => handlePaymentClick('zelle')}>
              <div className="payment-icon zelle-icon">
                <span>Z</span>
              </div>
              <div className="payment-info">
                <h3>{t('zelle')}</h3>
                <p>{t('payWithZelle')}</p>
              </div>
            </div>
            
            <div className="payment-method" onClick={() => handlePaymentClick('paypal')}>
              <div className="payment-icon paypal-icon">
                <span>P</span>
              </div>
              <div className="payment-info">
                <h3>{t('paypal')}</h3>
                <p>{t('payWithPayPal')}</p>
              </div>
            </div>
            
            <div className="payment-method" onClick={() => handlePaymentClick('venmo')}>
              <div className="payment-icon venmo-icon">
                <span>V</span>
              </div>
              <div className="payment-info">
                <h3>{t('venmo')}</h3>
                <p>{t('payWithVenmo')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 