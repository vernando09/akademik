const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')

var cors = require('cors');
app.use(cors({
    origin: '*'
}));

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
}); // script untuk penggunaan multer saat upload

// create data / insert data
app.post('/api/skincare',upload.single('image'),(req, res) => {


    const data = { ...req.body };
     const kode_produk = req.body.kode_produk;
    const nama_produk = req.body.nama_produk;
    const stok = req.body.stok;
    const kedaluwarsa = req.body.kedaluwarsa;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO skincare (kode_produk,nama_produk,stok,kedaluwarsa) values (?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[kode_produk,nama_produk, stok,kedaluwarsa], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO skincare (kode_produk,nama_produk,stok,kedaluwarsa,foto) values (?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ kode_produk,nama_produk, stok,kedaluwarsa,foto], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/skincare', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM skincare';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/skincare/:kode_produk', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM skincare WHERE kode_produk = ?';
    const kode_produk = req.body.kode_produk;
    const nama_produk = req.body.nama_produk;
    const stok = req.body.stok;
    const kedaluwarsa = req.body.kedaluwarsa;

    const queryUpdate = 'UPDATE skincare SET nama_produk=?,stok=?,kedaluwarsa=? WHERE kode_produk = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.kode_produk, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama_produk,stok,kedaluwarsa, req.params.kode_produk], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/skincare/:kode_produk', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM skincare WHERE kode_produk = ?';
    const queryDelete = 'DELETE FROM skincare WHERE kode_produk = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.kode_produk, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.kode_produk, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
