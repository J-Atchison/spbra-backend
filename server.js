const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Add this root route
app.get('/', (req, res) => {
  res.json({
    message: 'SPBRA Payment API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      createPayment: 'POST /api/payments/venmo-intent',
      getPayments: '/api/payments'
    }
  });
});

// In-memory storage (no database needed)
let payments = [];
let paymentCounter = 1;

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SPBRA Payment API is running - NO DATABASE!',
    timestamp: new Date()
  });
});

app.post('/api/payments/venmo-intent', (req, res) => {
  try {
    console.log('Received payment request:', req.body);
    
    const { amount, customer } = req.body;
    
    if (!amount || !customer || !customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const payment = {
      paymentId: 'pay_' + Date.now() + '_' + paymentCounter++,
      amount: parseFloat(amount),
      customerName: customer.name,
      customerEmail: customer.email,
      status: 'initiated',
      createdAt: new Date()
    };
    
    payments.push(payment);
    
    console.log('Payment created in memory:', payment.paymentId);
    
    res.json({
      success: true,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: payment.status,
      message: 'Payment created successfully'
    });
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

app.get('/api/payments', (req, res) => {
  try {
    res.json({
      success: true,
      payments: payments.slice().reverse()
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT + ' - NO DATABASE VERSION');
  console.log('📍 Health: http://localhost:' + PORT + '/api/health');
});