import CryptoJS from "crypto-js";

export const encrypt = (text, password) => {
    var encryptedText = CryptoJS.AES.encrypt(text, password).toString();
    return encryptedText;
}
export const decrypt = (text, password) => {

        var bytes = CryptoJS.AES.decrypt(text, password);
        var desciferedText = bytes.toString(CryptoJS.enc.Utf8);
    
    
    return desciferedText;
}

export function convertWordArrayToUint8Array(wordArray) {
    var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
    var length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
    var uInt8Array = new Uint8Array(length), index=0, word, i;
    for (i=0; i<length; i++) {
        word = arrayOfWords[i];
        uInt8Array[index++] = word >> 24;
        uInt8Array[index++] = (word >> 16) & 0xff;
        uInt8Array[index++] = (word >> 8) & 0xff;
        uInt8Array[index++] = word & 0xff;
    }
    return uInt8Array;
}