const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('SplitMint API is running');
});

// Routes
const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/group.routes');
const participantRoutes = require('./routes/participant.routes');
const expenseRoutes = require('./routes/expense.routes');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/expenses', expenseRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
