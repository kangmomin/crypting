const app = require('express')()
const crypto = require('crypto-js')
const morsify = require('morsify')
const bp = require('body-parser')
const reply = require('./reply')

app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)
app.post('*', bp.urlencoded({ extended: false}))
app.set('views', __dirname + '\\public')

const encrypt = {
    binary : (num, text) => {
        let encodes10 = new Array(),
            encodes = new String()

        for(word of text) {
            encodes10.push(word.charCodeAt(0))
        }
        for(encode of encodes10) {
            encodes += encode.toString(num) + ' '
        }
        
        return encodes
    },
    toDes: (text, key) => {
        let encrypt = crypto.DES.encrypt(text, key).toString()

        return encrypt
    },
    toAes: (text, key) => {
        let encrypt = crypto.AES.encrypt(text, key).toString()

        return encrypt
    },
    toBase64: (text) => {
        const encodedWord = crypto.enc.Utf8.parse(text)
        const encoded = crypto.enc.Base64.stringify(encodedWord)
        return encoded
    },
    toMorese: (text) => {
        const encodedText = morsify.encode(text)
        return encodedText
    }
}

const decrypt = {
    binary: (num, text) => {
        text = text.replace(/\s/g, '')
        text = text.replace(/(.{2})/g,"$1 ")
        const args = text.trim().split(' ')
        let textArr = new Array(),
            _text = new String()
        for (arg of args) {
            if(arg.length > 8) return "error"
            let decrypted = parseInt(arg, num)
            decrypted = String.fromCharCode(decrypted)
            textArr.push(decrypted)
        }
        for(encode of textArr) {
            _text += encode
        }
        return _text
    },
    toDes: (encrypted, secretKey) => {
        let bytes = crypto.DES.decrypt(encrypted, secretKey),
            decrypted = bytes.toString(),
            _16Binary = decrypted.match(/.{2}/g),
            endText = new String()

        for (b of _16Binary) {
            endText += String.fromCharCode(parseInt(b, 16))
        }
    
        return endText
    },
    toAes: (encrypted, secretKey) => {
        let bytes = crypto.AES.decrypt(encrypted, secretKey),
            decrypted = bytes.toString(),
            _16Binary = decrypted.match(/.{2}/g),
            endText = new String()

        for (b of _16Binary) {
            endText += String.fromCharCode(parseInt(b, 16))
        }
    
        return endText
    },
    toBase64: (encoded) => {
        const encodedWord = crypto.enc.Base64.parse(encoded.replace(/\s+/g, ''))
        try {
            const decoded = crypto.enc.Utf8.stringify(encodedWord)
            return decoded
        } catch (ex) {
            console.log("error : " + ex)
            return "올바른 값을 입력해 주십시오."
        }
    },
    toMorese: (text) => {
        try {
            const decodedText = morsify.decode(text)
            return decodedText
        } catch (e) {
            return `모스부호 ERROR. \n error : ${e}`
        }
    }
}

app.get('/', (req, res) => res.render('index.html'))

app.post('/reply', reply)
app.post('/value', (req, res) => {
    let {crypto, mode, key ,content} = req.body
    let result
    const caseLength = 8
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress
    console.log(ip)
    if(crypto === 'decrypt') { 
        mode = Number(mode) + caseLength
    }


    switch (Number(mode)) {
        case 1: result = encrypt.binary(2, content); break;
        case 2: result = encrypt.binary(8, content); break;
        case 3: result = encrypt.binary(16, content); break;
        case 4: result = encrypt.binary(32, content); break;
        case 5: result = encrypt.toDes(content, key); break;
        case 6: result = encrypt.toAes(content, key); break;
        case 7: result = encrypt.toBase64(content); break;
        case 8: result = encrypt.toMorese(content); break;
        case 1 + caseLength: result = decrypt.binary(2, content); break;
        case 2 + caseLength: result = decrypt.binary(8, content); break;
        case 3 + caseLength: result = decrypt.binary(16, content); break;
        case 4 + caseLength: result = decrypt.binary(32, content); break;
        case 5 + caseLength: result = decrypt.toDes(content, key); break;
        case 6 + caseLength: result = decrypt.toAes(content, key); break;
        case 7 + caseLength: result = decrypt.toBase64(content); break;
        case 8 + caseLength: result = decrypt.toMorese(content); break;
    
        default: result = 'not mode'; break;
    }
    res.send(result)
})

app.listen(4002, () => console.log(`server is running on port 4002`))