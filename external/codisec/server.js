
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from codisecweb directory
app.use(express.static(path.join(__dirname, 'codisecweb')));

// Route for root - redirect to login page
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Catch all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'codisecweb', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor CODISEC ejecutándose en puerto ${PORT}`);
  console.log(`Accede a la aplicación en: http://localhost:${PORT}`);
});
