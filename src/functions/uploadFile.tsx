import '../App.css';
import { Web3Storage } from 'web3.storage';
import * as Name from 'w3name';
import { stringToNameBytes } from '../utils/nameParsing'
//import {child, database, get, ref, update} from "../firebase";
import CryptoJS from "crypto-js";
import { default as axios } from "axios";
import { convertWordArrayToUint8Array } from "../utils/AES";
import Constants from "../Constants.js";
import { IPFSFile } from '../components/utils/types';



export async function uploadFile(selectedFile: FileList | null, selectedKey: string | null, database: { data: string | CryptoJS.lib.CipherParams; } | undefined): Promise<any> {
    var filesListTemp: IPFSFile[] = [];

    if (selectedKey != null && selectedFile != null) {

        const name = await Name.from(stringToNameBytes(selectedKey));





        const client = new Web3Storage({ token: Constants.web3storagetoken })

        try {


            //RESOLVE IPNS





            console.log("test")


            // Pack files into a CAR and send to web3.storage

            var fileBuffer = await selectedFile.item(0)!.arrayBuffer();
            const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
            var encryptedText = await CryptoJS.AES.encrypt(wordArray, name.toString()).toString();

            const blob = new Blob([encryptedText])

            const blobFile = new File([blob], "file");

            const rootCid = await client.put([blobFile], {
                wrapWithDirectory: false,

            }); // Promise<CIDString>


            // Fetch and verify files from web3.storage
            const res = await client.get(rootCid) // Promise<Web3Response | null>

            const files = await res!.files() // Promise<Web3File[]>

            for (const file of files) {



                let controllerFetchDownload;
                controllerFetchDownload = new AbortController();


                var bytes = CryptoJS.AES.decrypt(database!.data, name.toString());
                var typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array
                var typedArrayJSON = JSON.parse(new TextDecoder().decode(typedArray));

                const currentTimeInMilliseconds = new Date().getTime();


                const dataString = JSON.stringify(typedArrayJSON);
                const fileUploadJsonParse = JSON.parse(dataString);

                fileUploadJsonParse.files[currentTimeInMilliseconds] = {
                    "cid": `${rootCid}`,
                    "date": currentTimeInMilliseconds,
                    "dir": "files",
                    "name": `${selectedFile.item(0)!.name}`,
                    "private": true,
                    "size": file.size,
                    "type": `${selectedFile.item(0)!.type}`
                };

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

                let revisiontwo = await Name.resolve(nameResolved);

                const nextValue = `/ipfs/${dataCid}`
                const nextRevision = await Name.increment(revisiontwo, nextValue);
                await Name.publish(nextRevision, name.key);

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






            }


        } catch (e) {
            console.log("Error: ", e);
        }

    }
    return filesListTemp;

}