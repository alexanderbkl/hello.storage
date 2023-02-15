import '../App.css';
import './FilesComponent.css'
import React, {useState} from 'react';
import * as Name from 'w3name';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { deleteFile } from '../functions/deleteFile';
import { stringToNameBytes } from '../utils/nameParsing'
import { dateFormat } from '../utils/dateFormat';
import { formatBytes } from '../utils/formatBytes';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import filePublic from '../assets/filePublic.png';
import upload_button from '../assets/upload_button.png';
import { uploadFile } from '../functions/uploadFile';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import {Spinner} from "reactstrap";
import CryptoJS from "crypto-js";
import { convertWordArrayToUint8Array } from "../utils/AES";
import axios from "axios";


var mounted = false;


const FilesComponent = (props) => {



    var test = false;

    const [spinnerVisible, setSpinnerHidden] = useState(true);

    const [filesList, setFilesList] = useState([]);

    const selectedKey = props.selectedKey;

    var name;

    async function addName() {
        if (selectedKey !== undefined && selectedKey !== false) {

            try {
                var nameBytes = stringToNameBytes(selectedKey);
                try {
                    name = await Name.from(nameBytes);
                }
                catch (e) {
                    console.log('Error:', e);
                }






                //RESOLVE IPNS

                const nameResolved = Name.parse(name.toString());
                let revisiontwo = await Name.resolve(nameResolved);
                console.log('Resolved:', revisiontwo.value);
                let controllerFetchDownload;
                controllerFetchDownload = new AbortController();

                //UPDATE IPNS
                axios
                    .get(
                        "https://w3s.link"+revisiontwo.value,
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
                        console.log(JSON.stringify(typedArrayJSON));
                            let filesList = []
                            Object.keys(typedArrayJSON.files).map(function (key) {
                                return typedArrayJSON.files[key];
                            }).map(function (file) {
                                return (
                                    {
                                        cid: file.cid,
                                        name: file.name,
                                        size: file.size,
                                        type: file.type,
                                        dir: file.dir,
                                        private: file.private,
                                        date: file.date
                                    }
                                )
                            }).map(function (file) {
                                return filesList.push(file);
                            });

                            setFilesList(filesList);
                            mounted = true;


                    })
                    .catch((err) => {
                        //errore durante il download
                        if (err.message !== "canceled") {
                            alert("Error during downloading.");
                            console.log(err);
                        }
                    });







                mounted = true;




            }
            catch (e) {
                console.log("eror", e);
            }
        }
    }

    if (props.selectedKey != null && !mounted) {

        addName();


    }
    const [selectedFile, setSelectedFile] = useState(null);

    const hiddenFileInput = React.useRef(null);

    const handleClick = () => {
        setSpinnerHidden(true)
        hiddenFileInput.current.click();
        setSelectedFile(hiddenFileInput);
        console.log(hiddenFileInput)
        

    }

    function uploadDone() {
        test = true
        setSpinnerHidden(false)

    }

    if (selectedFile != null) {


            async function uploadReady() {
                await uploadFile(selectedFile, selectedKey);
                test = true
            }
        if (!test) {
            uploadReady().then(r => (
                uploadDone()
        ))
        }

    }




    function verifyFile(cid) {
        window.open("https://w3s.link/ipfs/" + cid);
    }


    async function downloadFile(item, selectedKey) {
        let win;

        const name = await Name.from(stringToNameBytes(selectedKey));


        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))
            win = window;
        else win = window.open();
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
                "https://"+item.cid+".ipfs.w3s.link",
                {
                    signal: controllerFetchDownload.signal,
                    responseType: "text",
                    onDownloadProgress: (event) => {
                        win.document.getElementById("textDownload").innerHTML =
                            "Download of " + item.name +
                            " is in progress..." +
                            " " +
                            event.loaded +
                            "/" +
                            event.total;
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
                win.location.href=url;
                win.window.URL.revokeObjectURL(url);
                a.remove();
            })
            .catch((err) => {
                //errore durante il download
                if (err.message !== "canceled") {
                    alert("Error during downloading.");
                    console.log(err);
                    win.document.getElementById("textDownload").innerHTML =
                        "Error during downloading.";
                }
            });
    }



    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            height: '100%',
            backgroundColor: '#EEEEEE'
        }}>
            <p hidden={spinnerVisible} style={{display: 'flex', position: 'absolute', marginBottom: "100px", zIndex: 100, justifyContent: 'center', alignItems: 'center'}} color={"primary"}><b>Encrypting...</b></p>
            <Spinner hidden={spinnerVisible} style={{display: 'flex', position: 'absolute', zIndex: 100, justifyContent: 'center', alignItems: 'center'}} color={"primary"}/>


            <div className="filesContainer" >

                <div id={"uploadBtn"} style={{
                    background: '#DDDDDD',
                    width: '50%',
                    position: 'relative',
                    left: '0',
                    borderTopLeftRadius: '15px',
                    borderBottomLeftRadius: '15px',
                }}>
                    <input type="file"
                        ref={hiddenFileInput}
                        onChange={(e) => setSelectedFile(e.target.files)}
                        style={{ display: 'none' }}
                    />
                    <img className="noselect pointer" style={{
                        width: '100%',
                        height: '100%',
                    }}
                    alt="upload_button.png"
                        src={upload_button}
                        onClick={(e) => handleClick()}
                    />


                </div>

                <Container style={{
                    width: '45%',
                    height: '95%',
                    margin: '10px',
                    overflow: 'auto',
                    textAlign: 'left',
                    wordWrap: 'break-word',
                }}>
                    {filesList.map(item => (
                        <Row
                            key={item.date}
                            style={{
                                flex: '1',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '10px',
                                backgroundColor: '#EEEEEE',
                                borderRadius: '5px',
                            }}>

                            <Col sm={2}>
                                <img style={{ width: '50px', height: '50px' }} src={filePublic} alt='fileIcon' />
                            </Col>
                            <Col sm={4}>
                                <p style={{ marginTop: '10px', fontSize: '1vw' }} onClick={() => console.log("item:" + item.date)}>{item.name}</p>
                            </Col>
                            <Col sm={2}>
                                <p style={{ marginTop: '10px', fontSize: '0.7vw' }} className="text-break">{formatBytes(item.size)} {dateFormat(item.date)}</p>
                            </Col>
                            <Col sm={2}>
                                <DropdownButton id="dropdown-basic-button" title="">
                                    <Dropdown.Item onClick={() => deleteFile(item.date, selectedKey)}>Open</Dropdown.Item>
                                    <Dropdown.Item onClick={() => deleteFile(item.date, selectedKey)}>Delete</Dropdown.Item>
                                    <Dropdown.Item onClick={() => downloadFile(item, selectedKey)}>Download</Dropdown.Item>
                                </DropdownButton>
                            </Col>
                            <Col sm={2}>
                                <IconButton onClick={() => verifyFile(item.cid)} color="primary" aria-label="add to shopping cart">
                                    <CheckIcon/>
                                </IconButton>
                            </Col>
                        </Row>

                    ))}
                </Container>
            </div>
        </div>

    )
}

export default FilesComponent;