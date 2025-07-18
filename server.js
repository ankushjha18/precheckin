const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

// Supabase client initialization
const SUPABASE_URL = 'https://tatomhtbtityqnoggttc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdG9taHRidGl0eXFub2dndHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgyODQ1MCwiZXhwIjoyMDY4NDA0NDUwfQ.dK2X4lbbkCocuzPQJ86qg8EirYrCtpfgOJcaRkcOsuM';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Serve static files (form, css, js, etc.)
app.use(express.static(__dirname));

// Upload endpoint
app.post('/upload', upload.single('pdf'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Upload to Supabase Storage
    const { data, error } = await supabase
        .storage
        .from('checkin') // updated bucket name
        .upload(file.originalname, fs.readFileSync(file.path), {
            contentType: file.mimetype,
            upsert: true
        });

    // Optionally, delete the file from local uploads after upload
    fs.unlinkSync(file.path);

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, url: `${SUPABASE_URL}/storage/v1/object/public/checkin/${file.originalname}` });
});

// Admin page to list PDFs
app.get('/admin', async (req, res) => {
    try {
        const { data, error } = await supabase
            .storage
            .from('checkin')
            .list();

        if (error) {
            return res.status(500).send('Error reading files from Supabase Storage');
        }

        let html = '<h2>Submitted PDFs</h2><ul>';
        data.forEach(f => {
            html += `<li><a href="${SUPABASE_URL}/storage/v1/object/public/checkin/${f.name}" target="_blank">${f.name}</a></li>`;
        });
        html += '</ul>';
        res.send(html);
    } catch (err) {
        res.status(500).send('Error reading files from Supabase Storage');
    }
});

// Serve uploaded PDFs
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 