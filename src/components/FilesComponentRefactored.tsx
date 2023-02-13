import axios from "axios";
import { useEffect, useState } from "react";
import * as Name from "w3name";
import { stringToNameBytes } from '../utils/nameParsing'
import CryptoJS from "crypto-js";
import { convertWordArrayToUint8Array } from "../utils/AES";
import { IPFSFile } from "./utils/types";
import "./FilesComponentRefactored.css";
import filePublic from '../assets/filePublic.png';
import { dateFormat } from '../utils/dateFormat';
import { formatBytes } from '../utils/formatBytes';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { deleteFile } from '../functions/deleteFile';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';

const FilesComponentRefactored = (props: { selectedKey: string; }) => {


    const selectedKey = props.selectedKey;
    const [filesList, setFilesList] = useState<IPFSFile[]>([]);
    const [name, setName] = useState<Name.WritableName | undefined>(undefined);


    useEffect(() => {
        if (selectedKey) {
            var nameBytes = stringToNameBytes(selectedKey);

            getName(nameBytes);

        }
    }, [selectedKey])

    useEffect(() => {
        if (name) {
            getFiles();
        }
    }, [name])


    async function getName(nameBytes: Uint8Array) {
        try {
            var nameTemp = await Name.from(nameBytes);
            setName(nameTemp);
        }
        catch (e) {
            console.log('Error:', e);
        }
    }


    async function getFiles() {
        if (!name) {
            console.log('Name not set')
            return;
        }
        const nameResolved = Name.parse(name.toString());
        let revisiontwo = await Name.resolve(nameResolved);
        //console.log('Resolved:', revisiontwo.value);
        let controllerFetchDownload;
        controllerFetchDownload = new AbortController();



        //UPDATE IPNS
        axios
            .get(
                "https://w3s.link" + revisiontwo.value,
                {
                    signal: controllerFetchDownload.signal,
                    responseType: "text",
                    onDownloadProgress: (event) => {

                    },
                }
            )
            .then(async (text) => {
                var bytes = CryptoJS.AES.decrypt(text.data, name.toString());
                var typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array
                var typedArrayJSON = JSON.parse(new TextDecoder().decode(typedArray));
                let filesListTemp: IPFSFile[] = [];
                Object.keys(typedArrayJSON.files).map(function (key) {
                    return typedArrayJSON.files[key];
                }).map(function (file) {
                    console.log(file)
                    filesListTemp.push(file);
                });
                setFilesList(filesListTemp);
                console.log(filesListTemp)
            })
            .catch((err) => {
                //errore durante il download
                if (err.message !== "canceled") {
                    alert("Error during downloading.");
                    console.log(err);
                }
            });

    }


    async function downloadFile(item: IPFSFile, selectedKey: string) {
        let win: Window;

        const name = await Name.from(stringToNameBytes(selectedKey));


        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))
            win = window;
        else win = window.open() || window;
        let controllerFetchDownload;
        controllerFetchDownload = new AbortController();

        win.window.document.write(


            "<html>  <head>    <style>      html,      body {        height: 100%;        width: 100%;      }      .container {        align-items: center;        display: flex;        justify-content: center;        height: 100%;        width: 100%;      }    </style>  </head>  <body style='background-color: #191919; overflow: hidden'>    <div class='container'>      <img src='https://i.ibb.co/68tNrK6/ounn.png' style='width: 250px' />      <div class='content'>        <p          id='textDownload'          style='color: white; font-family: Arial, Helvetica, sans-serif'        >          Download of " +
            item.name +
            " in progress...        </p>      </div>    </div>  </body></html>"
        );

        //se chiudo la finestra eseguo abort del download
        win.window.addEventListener("beforeunload", (ev) => {
            controllerFetchDownload = new AbortController();
        });
        axios
            .get(
                "https://" + item.cid + ".ipfs.w3s.link",
                {
                    signal: controllerFetchDownload.signal,
                    responseType: "text",
                    onDownloadProgress: (event: ProgressEvent) => {
                        let textDownload = win.document.getElementById("textDownload");
                        if (textDownload) {
                            textDownload.innerHTML =
                                "Download of " + item.name +
                                " is in progress..." +
                                " "
                                + formatBytes(event.loaded);
                        }

                    },
                }
            )
            .then(async (text) => {
                var bytes = CryptoJS.AES.decrypt(text.data, name.toString());
                var typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array

                //scarico il file
                var a = win.document.createElement("a");
                let blob = new Blob([typedArray], {
                    type: item.type,
                });
                let url = URL.createObjectURL(blob);
                a.setAttribute("href", url);
                a.setAttribute("download", item.name);
                win.document.body.append(a);
                a.click();
                win.location.href = url;
                win.window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch((err) => {
                //errore durante il download
                if (err.message !== "canceled") {
                    alert("Error during downloading.");
                    console.log(err);
                    let textDownload = win.document.getElementById("textDownload");
                    if (textDownload) {
                        textDownload.innerHTML =
                            "Error during downloading.";
                    }

                }
            });
    }


    function verifyFile(cid: string) {
        window.open("https://w3s.link/ipfs/" + cid);
    }

    return (
        <div className="container h-100">

            <div className="h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="h-50 form-group">
                    <ul className="h-75 list-group ">
                        <li className="list-group-item" style={{ height: '20%', backgroundColor: '#333344' }}>
                            <div className="text-white d-flex justify-content-between align-items-center">
                                {/*Upload file button using bootstrap*/}
                                <input className="collapse form-control form-control-lg" id="formFileLg" type="file" />

                                {/*Create a button saying Upload file with rounded borders, and on hover make background black and text white*/}
                                <span><b>STORED FILES</b></span>

                                <button className="submit btn border-dark border-radius-2 rounded-pill p-2 px-3 btn-primary btn-sm float-right" type="button"><b>Upload</b></button>


                            </div>
                        </li>
                        <li className="h-100 list-group-item">
                            <div className=" h-100 d-flex justify-content-center">
                                <div className="h-100 overflow-auto d-flex m-2 justify-content-between">
                                    <div className="form-group mb-3" style={{ overflowX: 'auto' }}>
                                        <ul className="list-group" >
                                            {filesList.length > 0 ? filesList.map((file, index) => {
                                                return (
                                                    <div>
                                                        <li className="list-group-item" key={index}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <img className="" style={{ width: '50px', height: '50px' }} src={filePublic} alt='fileIcon' />
                                                                <span className="text-dark px-1">{file.name}</span>
                                                                <span className="text-dark px-1">{formatBytes(file.size)}</span>
                                                                <span className="text-dark px-1">{dateFormat(file.date)}</span>
                                                                <DropdownButton id="dropdown-basic-button" title="">
                                                                    <Dropdown.Item onClick={() => deleteFile(file.date, selectedKey)}>Delete</Dropdown.Item>
                                                                    <Dropdown.Item onClick={() => downloadFile(file, selectedKey)}>Download</Dropdown.Item>
                                                                </DropdownButton>
                                                                <IconButton onClick={() => verifyFile(file.cid)} color="primary" aria-label="add to shopping cart">
                                                                    <CheckIcon />
                                                                </IconButton>
                                                                {/*<button className="submit btn border-dark border-radius-2 rounded-pill p-2 px-3 btn-primary btn-sm float-right" type="button"><b>Download</b></button>*/}
                                                            </div>
                                                        </li>
                                                    </div>
                                                )
                                            }) :
                                                <li className="list-group-item mx-2">
                                                    No files uploaded.
                                                </li>}


                                        </ul>
                                    </div>
                                </div>



                            </div>
                        </li>
                    </ul>

                </div>


                <div className="navbar fixed-bottom mx-5">
                    <p className="text-center" style={{ fontSize: '12px' }}>When uploading any data or files, these are automatically encrypted using your private key and stored across a fully decentralized network of nodes around the Earth. You and only you have control of your private key, and therefore you and only you can see or access your space, not even astronnaut.space has the possibility to see, interact, or access neither your space nor your private key.</p>
                </div>
            </div>


        </div>
    )
}

export default FilesComponentRefactored;