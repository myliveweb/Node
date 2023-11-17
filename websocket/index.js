const express = require('express'),
      app = express(),
      http = require('http').createServer(app),
      io = require('socket.io')(http),
      path = require('path'),
      nunjucks = require('nunjucks'),
      fs = require('fs-extra'),
      formidableMiddleware = require('express-formidable');

require('dotenv').config()

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
    const now = new Date()
    const min = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
    const datestart = `${now.getHours()}:${min}:${now.getSeconds()} ${now.getDate()}.${now.getMonth()+1}.${now.getFullYear()}`

    console.log(`Start Connection ID socket: ${socket.id}, ${datestart}\n`)

    socket.emit('message', "Я сервер. Зарегистрировал вас.");

    socket.on('message', message => {
        jsonMessage = JSON.parse(message)
        console.log('Received from client: %s, %s\n', jsonMessage.parser, jsonMessage.datestart);
        io.emit('message', `Прислано от клиента ${jsonMessage.parser}. Старт: ${jsonMessage.datestart}. Время парсинга: ${jsonMessage.datetotal}.`);
    });
});

app.use(express.static(__dirname));

function randStr(len) {
    chrs = 'abdehkmnpswxz123456789';
    let str = '';
    for (let i = 0; i < len; i++) {
        let pos = Math.floor(Math.random() * chrs.length);
        str += chrs.substring(pos,pos+1);
    }
    return str;
}

const mapFiles = fileName => ({
    name: fileName,
    time: fs.statSync(`${process.env.UPLOAD_DIR}/${fileName}`).mtime.getTime(),
});

const getFiles = function (dir, files_) {
    files_ = files_ || []
    const files = fs.readdirSync(dir)
    for (let i in files){
        let name = files[i]
        let ext = path.parse(name).ext
        if(ext)
            files_.push(name);
    }

    const out = files_.map(mapFiles)
        .sort((a, b) => b.time - a.time)
        .map((v) => v.name);

    return out;
}

app.get('/', (req, res) => {
    const data = getFiles(process.env.UPLOAD_DIR)
    let objFiles = data.map(function(itemDate) {
        let type = 'nan'
        let ext = path.parse(itemDate).ext.substring(1)
        if(ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp') {
            type = 'pic'
        } else if(ext === 'doc' || ext === 'docx') {
            type = 'world'
        } else if(ext === 'txt') {
            type = 'text'
        } else if(ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
            type = 'excel'
        } else if(ext === 'pdf') {
            type = 'pdf'
        }
        return {name: itemDate, ext: ext, type: type}
    })
    res.render('index.html', {title: 'Home', menu: 'home', data: objFiles})
});

app.get('/about', (req, res) =>
    res.render('about.html', {title: 'About', menu: 'about'}));

app.post('/upload', (req, res) => {
    const oldpath = req.files.file1.path;
    let fileName = req.files.file1.name
    let newpath = `${process.env.UPLOAD_DIR}/${fileName}`;
    fs.access(newpath, fs.F_OK, (err) => {
        if (!err) {
            console.log('Файл существует')
            const baseName = path.parse(fileName).name
            const baseExt = path.parse(fileName).ext.substring(1)
            const random8 = randStr(6)
            fileName = `${baseName}-${random8}.${baseExt}`
            newpath = `${process.env.UPLOAD_DIR}/${fileName}`;
        }
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;

            let type = 'nan'
            let ext = path.parse(fileName).ext.substring(1)
            if(ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp') {
                type = 'pic'
            } else if(ext === 'doc' || ext === 'docx') {
                type = 'world'
            } else if(ext === 'txt') {
                type = 'text'
            } else if(ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
                type = 'excel'
            } else if(ext === 'pdf') {
                type = 'pdf'
            }
            const outObj = {name: fileName, ext: ext, type: type}
            res.send(outObj).end();
        });
    })
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