import '../App.css';
import React, {useState} from 'react';
import * as Name from 'w3name';
import {Web3Storage} from 'web3.storage';
import {stringToNameBytes} from '../utils/nameParsing'
import {TextField} from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {deletePassword} from '../functions/deletePassword';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import {convertWordArrayToUint8Array, decrypt} from "../utils/AES";
//import {child, database, get, ref, update} from "../firebase";
import { Spinner } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import {default as axios} from "axios";
import CryptoJS from "crypto-js";
import Constants from "../Constants.js";


let mounted = false;


const useLocalStorage = (storageKey, fallbackState) => {
    const [value, setValue] = React.useState(
        JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
    );

    React.useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);

    return [value, setValue];
};


const useSessionStorage = (storageKey, fallbackState) => {
    const [value, setValue] = React.useState(
        JSON.parse(sessionStorage.getItem(storageKey)) ?? fallbackState
    );

    React.useEffect(() => {
        sessionStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);

    return [value, setValue];
};


const UploadData = () => {

    const [spinnerVisible, setSpinnerHidden] = useState(true);

    const [accountPassword] = useSessionStorage('accountPassword', false);

    const [accountKey] = useLocalStorage('accountKey', false);

    let [selectedKey] = useState(null);

    if (accountKey !== false) {
        selectedKey = decrypt(accountKey, accountPassword);
    }


    const [filesList, setFilesList] = useState([]);
    async function addName() {
        if (selectedKey != null && !mounted) {
            try {
                const nameBytes = stringToNameBytes(selectedKey);
                let name;
                try {
                    name = await Name.from(nameBytes);
                } catch (e) {
                    console.log('Error:', e);
                }


                //RESOLVE IPNS

                const nameResolved = Name.parse(name.toString());
                let revisiontwo = await Name.resolve(nameResolved);
                console.log('Resolved:', revisiontwo.value);

                //UPDATE IPNS
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
                        const bytes = CryptoJS.AES.decrypt(text.data, name.toString());
                        const typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array
                        const typedArrayJSON = JSON.parse(new TextDecoder().decode(typedArray));
                        console.log(JSON.stringify(typedArrayJSON));
                        let filesListTemp = []
                        Object.keys(typedArrayJSON.notes.notes).map(function (key) {
                            return typedArrayJSON.notes.notes[key];
                        }).map(function (file) {
                            return filesListTemp.push(file);
                        });

                        setFilesList(filesListTemp);
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


            } catch (e) {
                console.log("eror", e);
            }
        }
    }
    addName().then(r => console.log(r));



    const [values, setValues] = React.useState({
        titleInput: "",
        noteInput: "",
        showPassword: false,
        showInputPassword: false
    });



    const handleChange =
        (prop) => (event) => {
            setValues({ ...values, [prop]: event.target.value });
        };




    async function uploadData() {
        const currentTimeInMilliseconds = new Date().getTime();
        try {
            let filesListTemp = filesList;
            let fileTemp = {
                "date": currentTimeInMilliseconds,
                "title": `${values.titleInput}`,
                "note": `${values.noteInput}`,
            };
            filesListTemp.push(fileTemp);
            setFilesList(filesListTemp);

            setSpinnerHidden(false);

        } catch (e) {
            alert(e);
        }

        console.log("Data:", values.titleInput, values.noteInput);
        const client = new Web3Storage({ token: Constants.web3storagetoken })

        try {

            const name = await Name.from(stringToNameBytes(selectedKey));
            const nameResolved = Name.parse(name.toString());
            const revision = await Name.resolve(nameResolved);

            let controllerFetchDownload;
            controllerFetchDownload = new AbortController();

            axios
                .get(
                    "https://w3s.link"+revision.value,
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

                    fileUploadJsonParse.notes.notes[currentTimeInMilliseconds] = {
                        "date": currentTimeInMilliseconds,
                        "title": `${values.titleInput}`,
                        "note": `${values.noteInput}`,
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


                  /*  let notes = 0;
                    const dbRef = ref(database);
                    await get(child(dbRef, `users/${name.toString()}`)).then((snapshot) => {
                        if (snapshot.exists()) {
                            notes = snapshot.child("notes").val();
                        } else {
                            console.log("No data available");
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                    await update(ref(database, `users/${name.toString()}`), {
                        notes: notes+1,
                    });
                    console.log(notes);
*/

                    mounted = true;
                    setSpinnerHidden(true);
                    console.log("Note uploaded successfuly.");
                })
                .catch((err) => {
                    //errore durante il download
                    if (err.message !== "canceled") {
                        alert("Error during downloading.");
                        console.log(err);
                    }
                });



        } catch (e) {
            console.log("Error:", e);
        }
    }


    async function beginDeleteData(date, selectedKey) {
        try {

            setSpinnerHidden(false);


            let filesListTemp = filesList;
            for(var f in filesListTemp) {
                if(filesListTemp[f].date === date) {
                    delete filesListTemp[f];
                }
            }

            setFilesList(filesListTemp);
            await deletePassword(date, selectedKey, "notes")
            setSpinnerHidden(true);
        } catch (e) {
            alert(e);
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                height: '100vh',
                backgroundColor: '#EEEEEE'
            }}
        >
            <p hidden={spinnerVisible} style={{display: 'flex', position: 'absolute', marginBottom: "100px", zIndex: 100, justifyContent: 'center', alignItems: 'center'}} color={"primary"}><b>Encrypting...</b></p>
            <Spinner hidden={spinnerVisible} style={{display: 'flex', position: 'absolute', zIndex: 100, justifyContent: 'center', alignItems: 'center'}} color={"primary"}/>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                height: '100vh',
                alignItems: 'center',
                width: '25vw',
                marginRight: '-1px',
            }}>

                <div style={{
                    display: 'flex',
                    position: 'relative',
                    width: '100%',
                    height: '35%',
                }}>
                    <div
                        className='noselect'
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            width: '35vw',
                            height: '5vh',
                            left: -1,
                            top: '-5vh',
                            backgroundColor: '#fefeff',
                            borderRight: '1px solid #DDDDDD',
                            borderBottom: '1px solid #EEEEEE',
                            borderTopLeftRadius: '25px',
                            borderTopRightRadius: '10px',
                        }}>
                        <h3>Data</h3>
                    </div>


                    <Container style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        borderBottomLeftRadius: '10px',
                        textAlign: 'left',
                        wordWrap: 'break-word',
                        overflow: 'auto'
                    }}>
                        {filesList.map(item => (
                            <Row key={item.date}
                                style={{
                                    flex: '1',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    margin: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid #DDDDDD'
                                }}>

                                <Col>
                                    <Row
                                        style={{
                                            width: '100%',
                                            flexWrap: 'nowrap',
                                            alignItems: 'baseline',
                                            position: 'relative'
                                        }}>
                                        <Col sm={9}>
                                            <p
                                                style={{
                                                    marginTop: '10px',
                                                    fontSize: '1.5vw'
                                                }}>
                                                {item.title}
                                            </p>

                                        </Col>
                                        <Col>
                                            <DropdownButton
                                                style={{
                                                    position: 'absolute',
                                                    top: '0',
                                                    right: '0',
                                                    marginRight: '-10px'
                                                }}
                                                id="dropdown-basic-button"
                                                title="">
                                                <Dropdown.Item onClick={() => beginDeleteData(item.date, selectedKey)}>Delete</Dropdown.Item>
                                            </DropdownButton>
                                        </Col>
                                    </Row>

                                </Col>

                                <Col>

                                    <FormControl sx={{ m: 1, width: '15vw' }} variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-note">Note</InputLabel>
                                        <OutlinedInput
                                            value={item.note}
                                            multiline
                                            maxRows={4}
                                            label="Note"
                                        />
                                    </FormControl>

                                </Col>

                            </Row>

                        ))}
                    </Container>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '25vw',
                    height: '35vh',
                    borderBottomRightRadius: '10px',
                    borderRight: '1px solid #DDDDDD',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                }}>
                <div className='noselect pointer'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        position: 'absolute',
                        width: '10vw',
                        height: '4vh',
                        right: -1,
                        top: '-5vh',
                        backgroundColor: '#DDDDDD',
                        borderRight: '1px solid #DDDDDD',
                        borderBottom: '1px solid #EEEEEE',
                        borderRadius: '25px',
                        color: '#BBBBBB'
                    }}
                    onClick={() => window.location.replace('/passwords')}>
                    <p style={{ marginTop: '10px' }}>Passwords</p>
                </div>


                <FormControl sx={{ m: 1, width: '15vw' }} variant="outlined">
                    <TextField
                        value={values.titleInput}
                        onChange={handleChange('titleInput')}

                        id="outlined-basic-title-field"
                        label="Title"
                        variant="outlined" />
                </FormControl>

                <FormControl sx={{ m: 1, width: '15vw' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password-label">Note</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password-input"
                        value={values.noteInput}
                        multiline
                        maxRows={4}
                        onChange={handleChange('noteInput')}
                        autoComplete="current-password"
                        label="Note"
                    />
                </FormControl>
                <Stack spacing={2} direction="row">
                    <Button
                        variant="contained"
                        onClick={() => uploadData()}
                        sx={{ marginTop: '5px', backgroundColor: "#4455bb" }}>
                        Upload
                    </Button>
                </Stack>
            </div>
            <p style={{  textAlign: 'center', position: 'absolute', left: '0%', bottom: '0%', marginTop: '50px', width: '100%'}}>When uploading any data or files, these are automatically encrypted using your private key and stored across a fully decentralized network of nodes around the Earth. You and only you have control of your private key, and therefore you and only you can see or access your space, not even Gox has the possibility to see, interact, or access neither your space nor your private key.</p>
        </div>
    )
}

export default UploadData;