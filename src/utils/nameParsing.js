export function nameBytesToString(bytes) {
    const arr = Array.from // if available
        ? Array.from(bytes) // use Array#from
        : [].map.call(bytes, (v => v)); // otherwise map()
    // now stringify
    const str = JSON.stringify(arr);
    return str;
};

export function stringToNameBytes(str) {
    const retrievedArr = JSON.parse(str);
    const retrievedTypedArray = new Uint8Array(retrievedArr);
    return retrievedTypedArray
};