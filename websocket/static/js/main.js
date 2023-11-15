let socket = io();

const $events = document.getElementById('events')

const newItem = (content) => {
    const item = document.createElement('li')
    item.innerText = content
    return item
}

socket.on('connect', () => {
    $events.appendChild(newItem('Подключение установлено'))
})

socket.on('message', message =>
    $events.appendChild(newItem(message))
);
socket.on('private message', message =>
    console.log(
        'Private message from server: ',
        message
    )
);

function sendMessageToServer() {
    socket.emit('message', "I'm client");
}

// Upload

function _(el) {
    return document.getElementById(el);
}

function uploadFile() {
    var file = _("file1").files[0];
    // alert(file.name+" | "+file.size+" | "+file.type);
    var formdata = new FormData();
    formdata.append("file1", file);
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", "/upload");
    ajax.send(formdata);
}

function progressHandler(event) {
    _("progressBar").removeAttribute('hidden');
    _("loaded_n_total").innerHTML = "Загружено " + event.loaded + " байтов из " + event.total;
    var percent = (event.loaded / event.total) * 100;
    _("progressBar").value = Math.round(percent);
    _("status").innerHTML = Math.round(percent) + "% загружено... пожалуйста подождите";
}

function completeHandler(event) {
    let div = document.createElement('div');
    div.className = 'uk-card uk-card-default uk-card-body uk-text-center uk-inline-clip uk-transition-toggle'
    let html = `
        <div>
            <img style="width: 100%;" src="/media/${ event.target.response }">
            <div class="uk-transition-slide-bottom uk-position-bottom uk-overlay uk-overlay-default">
                <p class="uk-h4 uk-margin-remove">
                    <a class="uk-inline" uk-icon="icon: eye; ratio: 1.5" href="/media/${ event.target.response }" data-caption="${ event.target.response }"></a>
                    <span class="js-download" data-src="${ event.target.response }" uk-icon="icon: download; ratio: 1.5"></span>
                    <span class="js-delete" data-src="${ event.target.response }" uk-icon="icon: trash; ratio: 1.5"></span>
                </p>
            </div>
        </div>
        <p class="uk-margin-small-top truncate" style="font-size: .8rem;">${ event.target.response }</p>      
        `
    div.innerHTML = html
    _("box-media").prepend(div)
    _("status").innerHTML = '';
    _("progressBar").setAttribute('hidden', 'hidden');
    setTimeout(function () {
        _("progressBar").value = 0; //wil clear progress bar after successful upload
    }, 1000);
}

function errorHandler(event) {
    _("status").innerHTML = "Upload Failed";
}

function abortHandler(event) {
    _("status").innerHTML = "Upload Aborted";
}

$(document).ready(function() {
    $('#box-media').on('click', '.js-download', function(e) {
        e.preventDefault()
        const $this = $(this)

        const src = $this.data('src')

        let link = document.createElement('a')
        link.href = `/media/${src}`
        link.download = src
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        return false
    })
    $('#box-media').on('click', '.js-delete', async function(e) {
        e.preventDefault()
        const $this = $(this)

        const src = $this.data('src')

        document.getElementById('spinner').style.display = 'flex'
        const url = `/deleteimage/`
        const data = {
            src: src
        };
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        })
        let returnJson = await response.json()
        if(returnJson.success == 'success') {

            const box = $this.closest('.uk-card')
            box.slideUp()
            setTimeout(() => {
                box.remove()
            }, 1000)

            document.getElementById('spinner').style.display = 'none'
            UIkit.notification({message: 'Файл успешно удалён', pos: 'top-right', status: 'success'})
        } else {
            document.getElementById('spinner').style.display = 'none'
            console.log('Error!')
        }

        return false
    })
});