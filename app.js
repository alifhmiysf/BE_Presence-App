const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

const app = express();
const port = 3001;

const presenceDataFilePath = path.join(__dirname, 'data', 'presenceData.json');

// Konfigurasi CORS
app.use(cors({
  origin: 'http://localhost:8080', // Sumber yang diizinkan
  methods: ['GET', 'POST'], // Metode HTTP yang diizinkan
  allowedHeaders: ['Content-Type'] // Header yang diizinkan
}));

// Middleware Body-Parser dengan batasan ukuran payload yang lebih besar
app.use(bodyParser.json({ limit: '10mb' }));  // Atur batasan ukuran payload menjadi 10 MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Set up multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Direktori untuk menyimpan file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Menyimpan file dengan nama unik
  }
});

const upload = multer({ storage: storage });

// Endpoint untuk upload foto
app.post('/upload', upload.single('photo'), (req, res) => {
  console.log('Request Body:', req.body);  // Debugging: Print request body
  console.log('Request File:', req.file);  // Debugging: Print request file

  const { user_id, comments } = req.body;
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const photo_url = `/uploads/${req.file.filename}`;
  const date = new Date().toISOString().split('T')[0];
  const presenceData = { user_id, date, photo_url, comments };

  // Simpan ke database
  db.query('INSERT INTO presence SET ?', presenceData, (err, result) => {
    if (err) {
      console.error('Error recording presence:', err);  // Debugging error log
      return res.status(500).send('Error recording presence');  // Kirimkan status 500 jika terjadi error
    }

    // Simpan ke file JSON
    try {
      let presenceDataJson = [];
      if (fs.existsSync(presenceDataFilePath)) {
        presenceDataJson = JSON.parse(fs.readFileSync(presenceDataFilePath, 'utf8'));
      }
      presenceDataJson.push(presenceData);
      fs.writeFileSync(presenceDataFilePath, JSON.stringify(presenceDataJson, null, 2));
      console.log('Data saved to JSON file successfully.');
    } catch (err) {
      console.error('Error reading or writing JSON file:', err);
      return res.status(500).send('Error updating JSON file');
    }

    res.status(201).send('Presence recorded successfully');  // Kirimkan status 201 jika berhasil
  });
});

// Menyajikan file statis dari folder uploads
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
