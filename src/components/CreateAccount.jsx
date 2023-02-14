import '../App.css';
import React from 'react';
import {Web3Storage} from 'web3.storage';
import * as Name from 'w3name';
import {nameBytesToString} from '../utils/nameParsing';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {encrypt} from "../utils/AES";
//import {database, ref, update} from "../firebase.js";
import CryptoJS from "crypto-js";
import Constants from "../Constants.js";

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


const CreateAccount = () => {
    const [accountKey, setAccountKey] = useLocalStorage('accountKey', false);
    const [accountPassword, setAccountPassword] = useSessionStorage('accountPassword', false);
    const [values, setValues] = React.useState({
        open: false,
        password: "",
        showPassword: false,
    });

    const handleClickOpen = () => {
        setValues({
            ...values,
            open: true,
        });
    };

    const handleClose = () => {
        setValues({
            ...values,
            open: !values.open,
        });
    };

    const handleCreate = () => {
        setValues({
            ...values,
            open: !values.open,
        });
        createAccount().then(r => console.log(r));

    };

    const handleChange =
        (prop) => (event) => {
            setValues({ ...values, [prop]: event.target.value });
        };

    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    async function createAccount() {



        //toggle alert class collapse to show alert for 3 seconds
        alert("creating1")
        document.getElementById("alert").classList.toggle("collapse");
        setTimeout(function () {
            document.getElementById("alert").classList.toggle("collapse");
        }, 5000);
        alert("creating2")

        const client = new Web3Storage({ token: Constants.web3storagetoken });
        const currentTimeInMilliseconds = new Date().getTime();

        const name = await Name.create().catch(e => alert("There was an error creating the account: " + e));


        const nameBytesString = nameBytesToString(name.key.bytes);
        const encryptedText = encrypt(nameBytesString, values.password);
        setAccountKey(encryptedText);
        setAccountPassword(values.password);


        var encryptedText2 = await CryptoJS.AES.encrypt(encryptedText, name.toString()).toString();

        const nameFile = new File([encryptedText2], 'priv.key', { type: 'application/octet-stream' });

        const rootCid = await client.put([nameFile], {
            wrapWithDirectory: false,

        }); // Promise<CIDString>


        const data =
        {
            "notes": {
                "passwords": {
                    [currentTimeInMilliseconds]: {
                        "date": currentTimeInMilliseconds,
                        "title": "Example title",
                        "username": "example@email.com",
                        "password": "password"
                    }
                },
                "notes": {
                    [currentTimeInMilliseconds]: {
                        "date": currentTimeInMilliseconds,
                        "title": "Welcome",
                        "note": "This is your first note!"
                    }
                }
            },
            "files": {
                [currentTimeInMilliseconds]: {
                    "cid": rootCid,
                    "date": currentTimeInMilliseconds,
                    "dir": "files",
                    "name": "priv.key",
                    "private": true,
                    "size": 0,
                    "type": "application/octet-stream"
                }
            }
        };
        const dataStringify = JSON.stringify(data);

        // Pack files into a CAR and send to web3.storage

        var encryptedJSON = await CryptoJS.AES.encrypt(dataStringify, name.toString()).toString();

        const blob = new Blob([encryptedJSON])

        const blobFile = new File([blob], "file");


        const dataCid = (await client.put([blobFile], {
            wrapWithDirectory: false,
        })).toString(); // Promise<CIDString>
        const revision = await Name.v0(name, "/ipfs/" + dataCid);
        await Name.publish(revision, name.key);

        //RESOLVE IPNS


         /*   await update(ref(database, `users/${name.toString()}`), {
                pubkey: name.toString(),
                notes: 1,
                passwords: 1,
                files: 1,
                creationdate: Date.now(),
            });
*/





        let blob2 = new Blob([encryptedText], {
            type: "text/plain",
        });


        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE workaround
            window.navigator.msSaveBlob(blob2, "priv.key");
        } else {
            let URL = window.URL;
            let downloadUrl = URL.createObjectURL(blob2);
            if ("priv.key") {
                alert("true")
                let a = document.createElement('a');
                if (typeof a.download === 'undefined') {
                    alert("undefined")
                    window.location.href = downloadUrl;
                } else {
                    alert("downloadUrl")
                    a.href = downloadUrl;
                    a.download = "priv.key";
                    document.body.appendChild(a);
                    a.click();
                    
                }
            } else {
                window.location.href = downloadUrl;
            }
            // cleanup
            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100);
        }



        console.log("Successfuly created account:", accountKey);
        alert("Successfuly created account.");
        window.location.replace('/files');


    }

    return (
        <div>
            <div id="alert" class="alert alert-secondary collapse" role="alert">
                Creating an account...
            </div>
            <Button variant="outlined" onClick={handleClickOpen}>
            CREATE ACCOUNT
        </Button>
            <Dialog open={values.open} onClose={handleClose}>
                <DialogTitle>Create account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Create a password for your account.
                    </DialogContentText>

                    <FormControl sx={{ margin: "20px" }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            type={values.showPassword ? 'text' : 'password'}
                            autoFocus
                            value={values.password}
                            margin="dense"
                            id="name"
                            onChange={handleChange('password')}
                            label="Password"
                            fullWidth
                            variant="standard"
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
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default CreateAccount;