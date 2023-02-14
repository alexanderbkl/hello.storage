import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import FormControl from '@mui/material/FormControl';
import { Button, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import './PasswordsRefactored.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { stringToNameBytes } from '../utils/nameParsing';
import * as Name from 'w3name';
import { convertWordArrayToUint8Array, decrypt } from '../utils/AES';
import { IPFSPassword } from './utils/types';
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import CryptoJS from "crypto-js";
import { Web3Storage } from 'web3.storage';
import Constants from '../Constants';
import { deletePassword } from '../functions/deletePassword';






const PasswordsRefactored = () => {


    const location = useLocation();

    const [selectedKey, setSelectedKey] = useState<string | null>(null);


    const [searchText, setSearchText] = useState<string>("");
    const [name, setName] = useState<Name.WritableName | undefined>(undefined);
    const [database, setDatabase] = useState<any>(null);
    const [spinnerVisible, setSpinnerHidden] = useState(true);
    const [progressText, setProgressText] = useState<string>("");


    const setSearchState = (searchText: string) => {
        setSearchText(searchText);
    }

    useEffect(() => {
        if (searchText === "") {
            //alert typeof selectedKey
            setFilteredPasswordsList(passwordsList);
        } else {
            setFilteredPasswordsList(passwordsList.filter((password) => {
                return password.title.toLowerCase().includes(searchText.toLowerCase());
            }));
            console.log(filteredPasswordsList);
        }
    }, [searchText])

    const [passwordsList, setPasswordsList] = useState<IPFSPassword[]>([]);
    const [filteredPasswordsList, setFilteredPasswordsList] = useState<IPFSPassword[]>([]);

    const [values, setValues] = useState({
        titleInput: "",
        usernameInput: "",
        passwordInput: "",
        password: "",
        showPassword: false,
        showInputPassword: false
    });


    async function addName() {
        if (selectedKey !== null && selectedKey !== "") {
            console.log(selectedKey)
            try {
                const nameBytes = stringToNameBytes(selectedKey);
                let nameTemp = await Name.from(nameBytes);
                setName(nameTemp);

                //RESOLVE IPNS

                const nameResolved = Name.parse(nameTemp.toString());
                let revisiontwo = await Name.resolve(nameResolved);

                let controllerFetchDownload;
                controllerFetchDownload = new AbortController();

                axios
                    .get(
                        "https://w3s.link" + revisiontwo.value,
                        {
                            signal: controllerFetchDownload.signal,
                            responseType: "text",
                            onDownloadProgress: () => {

                            },
                        }
                    )
                    .then(async (text) => {
                        setDatabase(text);
                        var bytes = CryptoJS.AES.decrypt(text.data, nameTemp.toString());
                        var typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array
                        var typedArrayJSON = JSON.parse(new TextDecoder().decode(typedArray));

                        let passwordsListTemp: IPFSPassword[] = []

                        Object.keys(typedArrayJSON.notes.passwords).map(function (key) {
                            return typedArrayJSON.notes.passwords[key];
                        }).map(function (file) {
                            passwordsListTemp.push(file);
                        });

                        console.log(passwordsListTemp)
                        setPasswordsList(passwordsListTemp);
                        setFilteredPasswordsList(passwordsListTemp);


                    })
                    .catch((err) => {
                        //errore durante il download
                        if (err.message !== "canceled") {
                            alert("Error during downloading.");
                            console.log(err);
                        }
                    });




            } catch (e) {
                console.log("eror", e);
            }
        } else {
            //get selectedKey from local storage

        }
    }

    useEffect(() => {
        if (selectedKey !== null && selectedKey !== "") {
            addName();
        } else {
            //check if location.state is defined
            if (location.state) {
                if (location.state.selectedKey) {
                    setSelectedKey(location.state.selectedKey);
                    console.log("1")
                    addName();

                } else {
                    //get selectedKey from local storage:
                    setSelectedKey(localStorage.getItem("selectedKey"));
                    console.log("11")
                    addName();

                }
            } else {
                //get selectedKey from local storage:
                setSelectedKey(localStorage.getItem("selectedKey"));
                console.log(localStorage.getItem("selectedKey"))
                addName();
            }
        }
    }, [selectedKey])

    const handleChange =
        (prop: string) => (event: { target: { value: any; }; }) => {
            setValues({ ...values, [prop]: event.target.value });
        };

    const handleClickShowInputPassword = () => {
        setValues({
            ...values,
            showInputPassword: !values.showInputPassword,
        });
    };

    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    };

    const handleMouseDownPassword = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
    }

    useEffect(() => {
    }, [values])

    async function uploadPassword() {

        const currentTimeInMilliseconds = new Date().getTime();
        try {
            let passwordsListTemp: IPFSPassword[] = passwordsList;
            let passwordTemp = {
                "date": currentTimeInMilliseconds,
                "title": `${values.titleInput}`,
                "username": `${values.usernameInput}`,
                "password": `${values.passwordInput}`,
            };
            passwordsListTemp.push(passwordTemp);
            setPasswordsList(passwordsListTemp);
            setFilteredPasswordsList(passwordsListTemp);
            setTimeout(() => {
                setProgressText("Encrypting...")
            }, 1000);
            setTimeout(() => {
                setProgressText("Pinning nodes...")
            }, 2000);
            setSpinnerHidden(false);

        } catch (e) {
            alert(e);
        }
        console.log("Data:", values.usernameInput, values.passwordInput);
        const client = new Web3Storage({ token: Constants.web3storagetoken })

        try {

            var name = await Name.from(stringToNameBytes(selectedKey));


            const nameResolvedTemp = Name.parse(name.toString());
            const revision = await Name.resolve(nameResolvedTemp);


            let controllerFetchDownload;
            controllerFetchDownload = new AbortController();

            var bytes = CryptoJS.AES.decrypt(database.data, name.toString());
            var typedArray = convertWordArrayToUint8Array(bytes);               // Convert: WordArray -> typed array
            var typedArrayJSON = JSON.parse(new TextDecoder().decode(typedArray));

            const currentTimeInMilliseconds = new Date().getTime();


            const dataString = JSON.stringify(typedArrayJSON);
            const fileUploadJsonParse = JSON.parse(dataString);

            fileUploadJsonParse.notes.passwords[currentTimeInMilliseconds] = {
                "date": currentTimeInMilliseconds,
                "title": `${values.titleInput}`,
                "username": `${values.usernameInput}`,
                "password": `${values.passwordInput}`,
            };

            const fileUploadJsonParseString = JSON.stringify(fileUploadJsonParse);

            var encryptedJSON = await CryptoJS.AES.encrypt(fileUploadJsonParseString, name.toString()).toString();

            const blob = new Blob([encryptedJSON])

            const blobFile = new File([blob], "file");


            const dataCid = (await client.put([blobFile], {
                wrapWithDirectory: false,
            })).toString(); // Promise<CIDString>
            const nameResolvedTwo = Name.parse(name.toString());

            const revisiontwo = await Name.resolve(nameResolvedTwo);

            const nextValue = `/ipfs/${dataCid}`
            const nextRevision = await Name.increment(revisiontwo, nextValue);
            await Name.publish(nextRevision, name.key);

            /*     let passwords = 0;
                 const dbRef = ref(database);
                 await get(child(dbRef, `users/${name.toString()}`)).then((snapshot) => {
                     if (snapshot.exists()) {
                         passwords = snapshot.child("notes").val();
                     } else {
                         console.log("No data available");
                     }
                 }).catch((error) => {
                     console.error(error);
                 });
                 await update(ref(database, `users/${name.toString()}`), {
                     passwords: passwords+1,
                 });
                 console.log(passwords);
                 */
            setSpinnerHidden(true);
            console.log("Password uploaded successfuly.");


        } catch (e) {
            console.log("Error:", e);
        }
    }


    async function beginDeletePassword(date: number, selectedKey: string | null) {
        try {

            setSpinnerHidden(false);


            let passwordsListTemp = passwordsList;
            for (var f in passwordsListTemp) {
                if (passwordsListTemp[f].date === date) {
                    delete passwordsListTemp[f];
                }
            }

            setPasswordsList(passwordsListTemp);
            setFilteredPasswordsList(passwordsListTemp);
            await deletePassword(date, selectedKey, "passwords")
            setSpinnerHidden(true);
        } catch (e) {
            alert(e);
        }
    }

    return (
        <div className="App">
            <Sidebar setSearchState={setSearchState} activeTab={"data"} selectedKey={selectedKey} />
            <div className="container-fluid h-100">
                <div className="position-absolute d-flex my-4 start-50 end-50 flex-column align-items-center">
                    <p hidden={spinnerVisible} color={"primary"}><b>{progressText}</b></p>
                    <Spinner hidden={spinnerVisible} color={"primary"} />
                    <div><b>{searchText ? searchText + ':' : ''}</b></div>
                </div>
                <div className="h-100 d-flex flex-column justify-content-center align-items-center">
                    <div className="h-50 form-group">
                        <ul className="h-100 list-group">
                            <li key={1} className="list-group-item" style={{ backgroundColor: '#555566' }}>
                                <div className="text-white d-flex justify-content-between align-items-center">
                                    <span className="col-md-6 my-1"><b>STORED ACCOUNTS</b></span>
                                </div>
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <FormControl sx={{ m: 1, fontWeight: 'bold' }} variant="outlined">
                                        <TextField
                                            value={values.titleInput}
                                            onChange={handleChange('titleInput')}
                                            sx={{
                                                "& label": {
                                                    marginLeft: 3 ? 0 : "65%",
                                                    borderColor: "white",
                                                    color: "white",
                                                    "&.Mui-focused": {
                                                        color: "white",
                                                        top: -5,
                                                        fontWeight: 'bold',
                                                        borderColor: "white",
                                                    }
                                                }, backgroundColor: '#BBBBBB', borderRadius: '5px'
                                            }}
                                            id="outlined-basic-title-field"
                                            label="Title" />
                                    </FormControl>

                                    <FormControl sx={{ m: 1 }} variant="outlined">
                                        <TextField
                                            value={values.usernameInput}
                                            onChange={handleChange('usernameInput')}
                                            label="Username"
                                            sx={{
                                                "& label": {
                                                    borderColor: "white",
                                                    color: "white",
                                                    "&.Mui-focused": {
                                                        color: "white",
                                                        top: -5,
                                                        fontWeight: 'bold',
                                                        borderColor: "white",
                                                    }
                                                }, backgroundColor: '#BBBBBB', borderRadius: '5px'
                                            }}
                                            variant="outlined" />
                                    </FormControl>


                                    <FormControl sx={{
                                        m: 1,
                                        width: '74%',
                                        "& label": {
                                            borderColor: "white",
                                            color: "white",

                                            "&.Mui-focused": {
                                                color: "white",
                                                top: -5,
                                                fontWeight: 'bold',
                                                borderColor: "white",
                                            }
                                        }

                                    }} variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-password-label">Password</InputLabel>
                                        <OutlinedInput
                                            id="outlined-adornment-password-input"
                                            type={values.showInputPassword ? 'text' : 'password'}
                                            value={values.passwordInput}
                                            onChange={handleChange('passwordInput')}
                                            sx={{ backgroundColor: '#BBBBBB', borderRadius: '5px' }}
                                            autoComplete="current-password"
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowInputPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                    >
                                                        {values.showInputPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Password"
                                        />
                                    </FormControl>
                                    <button onClick={() => uploadPassword()} className="submit btn border-dark rounded-pill p-2 px-3 btn-primary btn-sm float-right" type="button"><b>Upload</b></button>

                                </div>
                            </li>
                            <li key={2} className="h-75 list-group-item">
                                <div className="h-100 d-flex justify-content-center">
                                    <div className="h-100 overflow-auto d-flex m-2 justify-content-between">
                                        <div className="form-group mb-3" style={{ overflowX: 'auto' }}>
                                            <ul className="list-group" >
                                                {filteredPasswordsList.length > 0 ? filteredPasswordsList.map((password, index) => {
                                                    return (
                                                        <li className="list-group-item" key={index}>
                                                            <div className="d-flex justify-content-between align-items-center col-12">
                                                                <div className="d-flex justify-content-between align-items-center flex-column">
                                                                    <div className="row align-items-center justify-content-between text-left w-100">
                                                                        <div className="col-8" style={{ textAlign: 'left' }}>
                                                                            <span className="text-dark"
                                                                                style={{
                                                                                    fontSize: '0.8rem'
                                                                                }}>
                                                                                {password.title}
                                                                            </span>
                                                                        </div>
                                                                        <div className="col-2">
                                                                            <DropdownButton className="col-6 moreOptionsDropdown" id="col-2 " title="">
                                                                                <Dropdown.Item onClick={() => beginDeletePassword(password.date, selectedKey)}>Delete</Dropdown.Item>
                                                                            </DropdownButton>
                                                                        </div>
                                                                    </div>
                                                                    <span className="row text-dark p-2">
                                                                        <FormControl variant="outlined">
                                                                            <TextField
                                                                                value={password.username}
                                                                                label="Username"
                                                                                variant="outlined" />
                                                                        </FormControl>
                                                                    </span>
                                                                    <span className="row text-dark p-2 d-flex justify-content-center">

                                                                        <FormControl sx={{ width: '86%' }} variant="outlined">
                                                                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                                                            <OutlinedInput
                                                                                type={values.showPassword ? 'text' : 'password'}
                                                                                value={password.password}
                                                                                endAdornment={
                                                                                    <InputAdornment position="end">
                                                                                        <IconButton
                                                                                            aria-label="toggle password visibility"
                                                                                            onClick={handleClickShowPassword}
                                                                                            onMouseDown={handleMouseDownPassword}
                                                                                            edge="end"
                                                                                        >
                                                                                            {values.showPassword ? <VisibilityOff /> : <Visibility />}
                                                                                        </IconButton>
                                                                                    </InputAdornment>
                                                                                }
                                                                                label="Password"
                                                                            />
                                                                        </FormControl>
                                                                    </span>

                                                                    {/*<button className="submit btn border-dark border-radius-2 rounded-pill p-2 px-3 btn-primary btn-sm float-right" type="button"><b>Download</b></button>*/}
                                                                </div>
                                                            </div>

                                                        </li>
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
                </div>
            </div>

        </div>
    );
}

export default PasswordsRefactored;