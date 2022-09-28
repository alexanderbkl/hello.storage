import '../App.css';
import {Web3Storage} from 'web3.storage';
import * as Name from 'w3name';
import {stringToNameBytes} from '../utils/nameParsing'
//import {child, database, get, ref, update} from "../firebase";
import CryptoJS from "crypto-js";
import {default as axios} from "axios";
import {convertWordArrayToUint8Array} from "../utils/AES";
import Constants from "../Constants.js";



export async function uploadFile(selectedFile, selectedKey) {

    console.log("file",selectedFile);
    if (selectedKey != null && selectedFile != null) {

        const name = await Name.from(stringToNameBytes(selectedKey));





        const client = new Web3Storage({token: Constants.web3storagetoken })

        try {


            //RESOLVE IPNS









            // Pack files into a CAR and send to web3.storage

            var fileBuffer = await selectedFile.item(0).arrayBuffer();
            const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
            var encryptedText = await CryptoJS.AES.encrypt(wordArray, name.toString()).toString();

            const blob = new Blob([encryptedText])

            const blobFile = new File([blob], "file");

            const rootCid = await client.put([blobFile], {
                wrapWithDirectory: false,

            }); // Promise<CIDString>


            // Fetch and verify files from web3.storage
            const res = await client.get(rootCid) // Promise<Web3Response | null>
            const files = await res.files() // Promise<Web3File[]>

            let revisiontwo;
            for (const file of files) {
                console.log(`${file.cid} ${file.name} ${file.size} ${file.type}`);
                console.log("filecid", file.cid);

                //RESOLVE IPNS
                try {

                    const nameResolved = Name.parse(name.toString());
                    revisiontwo = await Name.resolve(nameResolved);

                    //UPDATE IPNS

                } catch (e) {
                    console.log("Error: ", e);
                }


                let controllerFetchDownload;
                controllerFetchDownload = new AbortController();

                axios
                    .get(
                        "https://w3s.link"+revisiontwo.value,
                        {
                            signal: controllerFetchDownload.signal,
                            responseType: "text",
                            onDownloadProgress: () => {

                            },
                        }
                    )
                    .then(async (text) => {
                        var bytes = CryptoJS.AES.decrypt(text.data, name.toString());
                        var typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array
                        var typedArrayJSON = JSON.parse(new TextDecoder().decode(typedArray));


                        const currentTimeInMilliseconds = new Date().getTime();


                        const dataString = JSON.stringify(typedArrayJSON);
                        const fileUploadJsonParse = JSON.parse(dataString);

                        fileUploadJsonParse.files[currentTimeInMilliseconds] = {
                            "cid": `${rootCid}`,
                            "date": currentTimeInMilliseconds,
                            "dir": "files",
                            "name": `${selectedFile.item(0).name}`,
                            "private": true,
                            "size": file.size,
                            "type": `${selectedFile.item(0).type}`
                        };

                        const fileUploadJsonParseString = JSON.stringify(fileUploadJsonParse);

                        var encryptedJSON = await CryptoJS.AES.encrypt(fileUploadJsonParseString, name.toString()).toString();

                        const blob = new Blob([encryptedJSON])

                        const blobFile = new File([blob], "file");


                        const dataCid = (await client.put([blobFile], {
                            wrapWithDirectory: false,
                        })).toString(); // Promise<CIDString>

                        const nameResolved = Name.parse(name.toString());

                        const revisiontwo = await Name.resolve(nameResolved);

                        const nextValue = `/ipfs/${dataCid}`
                        const nextRevision = await Name.increment(revisiontwo, nextValue);
                        await Name.publish(nextRevision, name.key);

                        let files = 0;
                      /*  const dbRef = ref(database);
                        await get(child(dbRef, `users/${name.toString()}`)).then((snapshot) => {
                            if (snapshot.exists()) {
                                files = snapshot.child("notes").val();
                            } else {
                                console.log("No data available");
                            }
                        }).catch((error) => {
                            console.error(error);
                        });
                        await update(ref(database, `users/${name.toString()}`), {
                            files: files + 1,
                        });
                        console.log(files);
*/
                        console.log("File uploaded successfuly.");
                        alert("File uploaded successfuly.");
                        window.location.reload();
                    })
                    .catch((err) => {
                        //errore durante il download
                        if (err.message !== "canceled") {
                            alert("Error during downloading.");
                            console.log(err);
                        }
                    });





            }


        } catch (e) {
            console.log("Error: ", e);
        }

    }

}