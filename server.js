const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve static files (form, css, js, etc.)
app.use(express.static(__dirname));

// Upload endpoint
app.post('/upload', upload.single('pdf'), (req, res) => {
    res.json({ success: true, filename: req.file.filename });
});

// Admin page to list PDFs
app.get('/admin', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).send('Error reading uploads');
        let html = '<h2>Submitted PDFs</h2><ul>';
        files.forEach(f => {
            html += `<li><a href="/uploads/${f}" target="_blank">${f}</a></li>`;
        });
        html += '</ul>';
        res.send(html);
    });
});

// Serve uploaded PDFs
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 