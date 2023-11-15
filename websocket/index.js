const express = require('express'),
      app = express(),
      http = require('http').createServer(app),
      io = require('socket.io')(http),
      path = require('path'),
      nunjucks = require('nunjucks'),
      fs = require('fs-extra'),
      formidableMiddleware = require('express-formidable');

require('dotenv').config()
console.log(process.env.PGDATABASE)

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(formidableMiddleware({
    encoding: 'utf-8',
    uploadDir: process.env.UPLOAD_DIR,
    multiples: true, // req.files to be arrays of files
}));

const host = process.env.HOST;
const port = process.env.PORT;

io.on('connection', socket => {
    console.log(`Start Connection ID socket: ${socket.id}\n`)

    socket.emit('message', "I'm server");

    socket.on('message', message => {
        console.log('Received from client: %s', message);
        io.emit('message', `Received from client: ${message}`);
    });
});

app.use(express.static(__dirname));

const mapFiles = fileName => ({
    name: fileName,
    time: fs.statSync(`${process.env.UPLOAD_DIR}/${fileName}`).mtime.getTime(),
});

const getFiles = function (dir, files_) {
    files_ = files_ || []
    const files = fs.readdirSync(dir)
    for (let i in files){
        let name = files[i]
        files_.push(name);
    }

    const out = files_.map(mapFiles)
        .sort((a, b) => b.time - a.time)
        .map((v) => v.name);

    return out;
}

app.get('/', (req, res) => {
    const data = getFiles(process.env.UPLOAD_DIR)
    res.render('index.html', {title: 'Home', menu: 'home', data: data})
});

app.get('/about', (req, res) =>
    res.render('about.html', {title: 'About', menu: 'about'}));

app.post('/upload', (req, res) => {
    const oldpath = req.files.file1.path;
    const newpath = `${process.env.UPLOAD_DIR}/${req.files.file1.name}`;
    fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.send(req.files.file1.name).end();
    });
});

app.post('/deleteimage', (req, res) => {
    const fileName = req.fields.src
    const filePath = `${process.env.UPLOAD_DIR}/${fileName}`
    fs.remove(filePath)
    res.send({"success": "success"}).end();
});

http.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}\n`)
);