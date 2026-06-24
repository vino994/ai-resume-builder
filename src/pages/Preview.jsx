import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
// Ensure this path is correct based on your project structure
import ResumeTemplate from '../components/ResumeTemplate';

const IS_DEV = window.location.hostname === 'localhost';
const PRODUCTION_BACKEND_URL = "https://resume-ai-backend.onrender.com"; // ◄ UPDATE THIS with your Render URL!
const BACKEND_URL = IS_DEV ? "http://localhost:5000" : PRODUCTION_BACKEND_URL;

export const autoGenerateResume = async (basicInfo) => {
  const response = await fetch(`${BACKEND_URL}/generate-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ basicInfo })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Backend request failed');
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

export const tailorResume = async (resumeData, jobDescription) => {
  const response = await fetch(`${BACKEND_URL}/tailor-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeData, jobDescription })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Tailor request failed');
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
};

const Preview = () => {
  const navigate = useNavigate();
  const resumeRef = useRef();
  const data = JSON.parse(localStorage.getItem('resumeData') || '{}');

  const [downloadCount, setDownloadCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('resume_download_count') || '0', 10);
    const savedPaid = localStorage.getItem('resume_has_paid_premium') === 'true';
    setDownloadCount(savedCount);
    setHasPaid(savedPaid);
  }, []);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const triggerPDFDownload = async () => {
    const targetElement = document.getElementById('resume-template');
    if (!targetElement) {
      showNotification('Resume template not found. Please regenerate.', 'error');
      return;
    }
    
    const safeName = (data.name || 'Resume').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    
    try {
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${safeName}_Resume.pdf`);
    } catch (err) {
      showNotification('PDF generation failed', 'error');
    }
  };

  const handleDownloadClick = () => {
    if (hasPaid) {
      triggerPDFDownload();
      return;
    }

    if (downloadCount >= 3) {
      setShowPaywallModal(true);
    } else {
      const newCount = downloadCount + 1;
      localStorage.setItem('resume_download_count', newCount.toString());
      setDownloadCount(newCount);
      triggerPDFDownload();
    }
  };

  const handlePaymentCheckout = async () => {
    setIsProcessing(true);
    const sdkLoaded = await loadRazorpaySDK();

    if (!sdkLoaded) {
      showNotification('Failed to load payment gateway.', 'error');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const orderData = await response.json();

      if (!orderData.success) throw new Error(orderData.error || 'Order creation failed.');

      const checkoutOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ResumeAI Premium',
        description: 'Lifetime Unlimited ATS Resume Downloads',
        order_id: orderData.sandbox ? undefined : orderData.id,
        handler: async function (paymentResponse) {
          const verifyResponse = await fetch(`${BACKEND_URL}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sandbox: orderData.sandbox,
              razorpay_order_id: paymentResponse.razorpay_order_id || orderData.id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            })
          });
          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            localStorage.setItem('resume_has_paid_premium', 'true');
            setHasPaid(true);
            setShowPaywallModal(false);
            showNotification('Payment verified! Unlimited access unlocked.', 'success');
            triggerPDFDownload();
          } else {
            showNotification('Verification failed: ' + verifyResult.error, 'error');
          }
        },
        prefill: {
          name: data.name || 'Candidate',
          email: data.email || 'candidate@example.com',
          contact: data.phone || '9999999999'
        },
        theme: { color: '#4f46e5' }
      };

      const rzp = new window.Razorpay(checkoutOptions);
      rzp.open();
    } catch (err) {
      showNotification('Payment error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '40px 20px', position: 'relative' }}>
      
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', padding: '16px', borderRadius: '8px',
          background: notification.type === 'error' ? '#ef4444' : '#22c55e', color: '#fff',
          zIndex: 999999, boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          {notification.msg}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px' }}>
        {hasPaid ? (
          <span style={{ color: '#44df85', fontWeight: 'bold' }}>🌟 Premium Unlimited Access Unlocked</span>
        ) : (
          <span style={{ color: '#888' }}>
            Free Downloads Used:{' '}
            <strong style={{ color: downloadCount >= 3 ? '#ef4444' : '#ffffff' }}>
              {downloadCount}/3
            </strong>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={() => navigate('/builder')}>← Edit Resume</button>
        <button className="btn-primary" onClick={handleDownloadClick}>⬇️ Download PDF</button>
        <button className="btn-secondary" onClick={() => navigate('/tailor')}>🎯 Tailor to JD</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div ref={resumeRef} style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
          <ResumeTemplate data={data} />
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywallModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 99999, padding: '20px'
        }}>
          <div style={{
            background: '#1a1a2e', border: '2px solid #4f46e5', borderRadius: '16px',
            width: '100%', maxWidth: '450px', padding: '32px',
            boxShadow: '0 10px 30px rgba(79,70,229,0.25)',
            textAlign: 'center', color: '#ffffff', fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px' }}>
              Unlock Unlimited ATS PDF Downloads
            </h2>
            <p style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '1.6', marginBottom: '24px' }}>
              You've used all 3 free downloads. Get unlimited PDF downloads forever with a one-time payment.
            </p>

            <div style={{
              background: 'rgba(79,70,229,0.1)', border: '1.5px solid rgba(79,70,229,0.3)',
              borderRadius: '10px', padding: '16px', marginBottom: '24px'
            }}>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#818cf8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                One-Time Payment
              </span>
              <span style={{ fontSize: '32px', fontWeight: '900' }}>
                ₹39 <span style={{ fontSize: '16px', color: '#a0aec0', fontWeight: 'normal' }}>only</span>
              </span>
            </div>

            <button
              onClick={handlePaymentCheckout}
              disabled={isProcessing}
              style={{
                width: '100%', background: isProcessing ? '#3730a3' : '#4f46e5',
                color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px',
                fontWeight: 'bold', fontSize: '15px', cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.4)', transition: 'all 0.2s'
              }}
            >
              {isProcessing ? 'Connecting...' : 'Pay ₹39 with UPI / Card'}
            </button>

            <button
              onClick={() => setShowPaywallModal(false)}
              style={{
                marginTop: '16px', background: 'transparent', color: '#a0aec0',
                border: 'none', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;