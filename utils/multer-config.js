const multer = require('multer');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.destination);
    }, filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});


const filefilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG images are allowed (.jpg, .jpeg, .png)'), false);
    }
}



exports.multerConfig = {
    storage: storage,
    fileFilter: filefilter,
    limits: {
        fileSize: 5 * 1024 * 1024,   // 1MB per file — fileSize (capital S) ✅
        files: 5,                      // max 5 files per request
        fields: 10,                    // max 10 non-file fields
        fieldSize: 2 * 1024 * 1024    // ✅ FIX: 'fieldsize' → 'fieldSize' (capital S) — same typo as filesize
    }
    // ✅ FIX: 'preserverePath' hata diya — multer ka valid option nahi hai (typo tha)
    // ✅ FIX: 'defpaultCharset' hata diya — multer ka valid option hi nahi hai
}
