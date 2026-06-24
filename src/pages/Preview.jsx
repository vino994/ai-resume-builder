import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import ResumeTemplate from '../components/ResumeTemplate';

const IS_DEV = window.location.hostname === 'localhost';
const PRODUCTION_BACKEND_URL = "https://resume-elet.onrender.com";
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
      showNotification('Resume template viewport not found. Please try again.', 'error');
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
      pdf.save(`${safeName}_Jtech_Resume.pdf`);
      showNotification('PDF downloaded successfully!', 'success');
    } catch (err) {
      showNotification('PDF rendering failed. Please try again.', 'error');
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
      showNotification('Unable to load payment gateway connection.', 'error');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const orderData = await response.json();

      if (!orderData.success) throw new Error(orderData.error || 'Payment gateway order failed.');

      const checkoutOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jtech ResumeAI',
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
            showNotification('Payment verified! Welcome to Jtech ResumeAI Premium.', 'success');
            triggerPDFDownload();
          } else {
            showNotification('Verification error: ' + verifyResult.error, 'error');
          }
        },
        prefill: {
          name: data.name || 'Candidate',
          email: data.email || 'candidate@example.com',
          contact: data.phone || '9999999999'
        },
        theme: { color: '#6366f1' }
      };

      const rzp = new window.Razorpay(checkoutOptions);
      rzp.open();
    } catch (err) {
      showNotification('Checkout error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', padding: '40px 20px', position: 'relative', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Toast notifications */}
      {notification && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px',
          background: notification.type === 'error' ? '#ef4444' : '#10b981', color: '#ffffff',
          zIndex: 999999, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)', fontWeight: '600',
          transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {notification.type === 'error' ? '❌' : '✨'} {notification.msg}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px' }}>
        {hasPaid ? (
          <span style={{ color: '#10b981', fontWeight: 'bold', letterSpacing: '0.05em' }}>🌟 Jtech Premium Access Unlocked</span>
        ) : (
          <span style={{ color: '#a1a1aa' }}>
            Free Downloads Used:{' '}
            <strong style={{ color: downloadCount >= 3 ? '#ef4444' : '#ffffff' }}>
              {downloadCount}/3
            </strong>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button className="btn-secondary" style={{ background: '#27272a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate('/builder')}>← Edit Resume</button>
        <button className="btn-primary" style={{ background: '#6366f1', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleDownloadClick}>⬇️ Download PDF</button>
        <button className="btn-secondary" style={{ background: '#27272a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate('/tailor')}>🎯 Tailor with Jtech AI</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div ref={resumeRef} style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
          <ResumeTemplate data={data} />
        </div>
      </div>

      {}
      {showPaywallModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 99999, padding: '20px'
        }}>
          <div style={{
            background: '#18181b', border: '1px solid #3f3f46', borderRadius: '24px',
            width: '100%', maxWidth: '440px', padding: '36px',
            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
            textAlign: 'center', color: '#ffffff'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>⚡</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.025em' }}>
              Unlock Jtech ResumeAI Premium
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '28px' }}>
              You've utilized all 3 free trial resume downloads. Upgrade to enjoy unlimited resume creation and tailoring.
            </p>

            <div style={{
              background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '16px', padding: '20px', marginBottom: '28px'
            }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#818cf8', fontWeight: 'bold', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>
                One-Time Payment
              </span>
              <span style={{ fontSize: '36px', fontWeight: '900' }}>
                ₹39 <span style={{ fontSize: '16px', color: '#a1a1aa', fontWeight: 'normal' }}>only</span>
              </span>
            </div>

            <button
              onClick={handlePaymentCheckout}
              disabled={isProcessing}
              style={{
                width: '100%', background: isProcessing ? '#4338ca' : '#6366f1',
                color: '#ffffff', border: 'none', padding: '16px', borderRadius: '12px',
                fontWeight: 'bold', fontSize: '16px', cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)', transition: 'all 0.2s',
                letterSpacing: '0.02em'
              }}
            >
              {isProcessing ? 'Connecting...' : 'Pay ₹39 with UPI / Card'}
            </button>

            <button
              onClick={() => setShowPaywallModal(false)}
              style={{
                marginTop: '20px', background: 'transparent', color: '#a1a1aa',
                border: 'none', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline'
              }}
            >
              Cancel & Keep Editing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
