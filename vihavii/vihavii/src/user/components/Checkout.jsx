import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import { useToast } from '../../components/common/ToastContext';
import '../styles/Checkout.css';
import { ArrowLeft, ShieldCheck, CreditCard, Wallet, Landmark } from 'lucide-react';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const { event, selectedTickets, totalTickets, totalPrice } = location.state || {};

  if (!event) {
    return <div className="error-container">Invalid checkout session. <button onClick={() => navigate(-1)}>Go Back</button></div>;
  }

  const platformFee = 5.00;
  const taxes = parseFloat((totalPrice * 0.05).toFixed(2));
  const finalAmount = totalPrice + platformFee + taxes;

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulate Razorpay Delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newBooking = {
        eventName: event.name,
        date: event.date,
        venue: event.location,
        tickets: totalTickets,
        status: "upcoming",
        image: event.image
      };

      const result = await bookingService.createBooking(newBooking);
      navigate(`/user/confirmation/${result.id || Date.now()}`, { state: { booking: result, event, totalTickets, finalAmount } });
      
    } catch (error) {
      console.error("Payment failed", error);
      showToast("Payment failed. Please try again.", "error");
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      {/* Header */}
      <header className="checkout-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Secure Checkout</h2>
        <div style={{ width: 24 }}></div>
      </header>

      <main className="checkout-main">
        {/* Order Summary */}
        <div className="checkout-section summary-card">
          <div className="event-mini-info">
            <img src={event.image} alt={event.name} />
            <div>
              <h3>{event.name}</h3>
              <p>{event.date} • {event.location}</p>
            </div>
          </div>
          
          <div className="price-breakdown">
            <div className="price-row">
              <span>Tickets ({totalTickets})</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Platform Fee</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Taxes (5%)</span>
              <span>₹{taxes.toFixed(2)}</span>
            </div>
            <div className="price-divider"></div>
            <div className="price-row total-row">
              <span>Total Amount</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="checkout-section payment-methods">
          <h3>Payment Method</h3>
          
          <label className="payment-option selected">
            <div className="pay-icon-wrap"><CreditCard size={20} /></div>
            <div className="pay-info">
              <h4>Credit / Debit Card</h4>
              <p>Visa, Mastercard, Amex</p>
            </div>
            <input type="radio" name="payment" checked readOnly />
          </label>

          <label className="payment-option">
            <div className="pay-icon-wrap"><Wallet size={20} /></div>
            <div className="pay-info">
              <h4>UPI</h4>
              <p>Google Pay, PhonePe, Paytm</p>
            </div>
            <input type="radio" name="payment" disabled />
          </label>

          <label className="payment-option">
            <div className="pay-icon-wrap"><Landmark size={20} /></div>
            <div className="pay-info">
              <h4>Net Banking</h4>
              <p>All Indian banks supported</p>
            </div>
            <input type="radio" name="payment" disabled />
          </label>
        </div>

      </main>

      {/* Pay Button Sticky Bottom */}
      <div className="checkout-footer">
        <div className="secure-badge">
          <ShieldCheck size={16} color="#2e7d32" />
          <span>100% Secure Payment</span>
        </div>
        <button 
          className="btn-pay" 
          onClick={handlePayment} 
          disabled={processing}
        >
          {processing ? 'Processing Securely...' : `Pay ₹${finalAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
