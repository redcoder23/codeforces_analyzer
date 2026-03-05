const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./Routes/api');
const exportHandler = require('./Routes/export');
const pdfExportHandler = require('./Routes/pdf-export');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/api/export/:handle', exportHandler);
app.get('/api/export-pdf/:handle', pdfExportHandler);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
