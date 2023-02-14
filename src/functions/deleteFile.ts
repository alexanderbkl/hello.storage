import '../App.css';
import { Web3Storage } from 'web3.storage';
import * as Name from 'w3name';
import { stringToNameBytes } from '../utils/nameParsing'
import {default as axios} from "axios";
import CryptoJS from "crypto-js";
import {convertWordArrayToUint8Array} from "../utils/AES";
import Constants from "../Constants.js";
import { IPFSFile } from '../components/utils/types';


export async function deleteFile(id: number, selectedKey: string | null): Promise<any> {
    
    var filesListTemp: IPFSFile[] = [];

    if (id !== 0 && selectedKey != null) {

        const client = new Web3Storage({ token: Constants.web3storagetoken })

        try {

            var name = await Name.from(stringToNameBytes(selectedKey));

            //RESOLVE IPNS

            let revisiontwo;


            //RESOLVE IPNS
            try {

                const nameResolved = Name.parse(name.toString());
                revisiontwo = await Name.resolve(nameResolved);
                console.log('Resolved:', revisiontwo.value);

                //UPDATE IPNS

            } catch (e) {
                console.log("Error: ", e);
                console.log("return4")
                return;
            }


            let controllerFetchDownload;
            controllerFetchDownload = new AbortController();

            await axios
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


                    const dataString = JSON.stringify(typedArrayJSON);
                    const fileUploadJsonParse = JSON.parse(dataString);

                    delete fileUploadJsonParse.files[id];

                    for (const key in fileUploadJsonParse.files) {
                        filesListTemp.push(fileUploadJsonParse.files[key]);
                    }




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


                })
                .catch((err) => {
                    //errore durante il download
                    if (err.message !== "canceled") {
                        alert("Error during downloading.");
                        console.log(err);
                    }
                    console.log("return1")
                    return;
                });









        } catch (e) {
            console.log("Error: ", e);
            console.log("return2")
            return filesListTemp;
        }
    }
    console.log(filesListTemp);
    return filesListTemp;

}
