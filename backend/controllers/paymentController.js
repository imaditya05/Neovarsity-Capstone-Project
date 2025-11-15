const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance lazily
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

const checkRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    checkRazorpayConfig();
    const razorpayInstance = getRazorpayInstance();
    
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1 // Auto capture payment
    };

    console.log('Creating Razorpay order with options:', options);

    // Create order
    const order = await razorpayInstance.orders.create(options);

    console.log('Razorpay order created:', order.id);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    console.log('Verifying payment:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });

    // Create signature verification string
    const sign = razorpay_order_id + '|' + razorpay_payment_id;

    // Generate expected signature
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    // Verify signature
    if (razorpay_signature === expectedSign) {
      console.log('Payment signature verified successfully');

      // Fetch payment details from Razorpay
      try {
        const razorpayInstance = getRazorpayInstance();
        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

        res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            verified: true,
            paymentDetails: {
              amount: payment.amount / 100, // Convert from paise to rupees
              currency: payment.currency,
              status: payment.status,
              method: payment.method,
              email: payment.email,
              contact: payment.contact,
              created_at: payment.created_at
            }
          }
        });
      } catch (fetchError) {
        console.error('Error fetching payment details:', fetchError);
        // Still return success if signature is valid
        res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            verified: true
          }
        });
      }
    } else {
      console.log('Payment signature verification failed');
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        verified: false
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    checkRazorpayConfig();
    const razorpayInstance = getRazorpayInstance();
    
    const { paymentId } = req.params;

    console.log('Fetching payment details for:', paymentId);

    const payment = await razorpayInstance.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        order_id: payment.order_id,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: error.message
    });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:paymentId/refund
// @access  Private (Admin/Theater Owner)
exports.refundPayment = async (req, res) => {
  try {
    checkRazorpayConfig();
    const razorpayInstance = getRazorpayInstance();
    
    const { paymentId } = req.params;
    const { amount, notes } = req.body;

    console.log('Processing refund for payment:', paymentId);

    // Create refund options
    const refundOptions = {};
    
    // If amount is specified, do partial refund, otherwise full refund
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    if (notes) {
      refundOptions.notes = notes;
    }

    const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);

    console.log('Refund created:', refund.id);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100, // Convert from paise to rupees
        status: refund.status,
        created_at: refund.created_at
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

// @desc    Get Razorpay key for frontend
// @route   GET /api/payments/key
// @access  Public
exports.getRazorpayKey = (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
};

