import Sidebar from './Sidebar';
import React, { useState } from 'react';
import FilesComponent from './FilesComponent';
import { decrypt } from "../utils/AES";
import ounn from "../assets/ounn.png";



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
var i = 1;

const Files = () => {


    const [accountKey] = useLocalStorage('accountKey', false);
    const [accountPassword, setAccountPassword] = useSessionStorage('accountPassword', false);

    var [selectedKey] = useState(null);

    if (accountKey !== false) {
        if (typeof accountKey === "string") {
            try {

                selectedKey = decrypt(accountKey, accountPassword);
            }
            catch {
                if (i < 2) {
                    if (selectedKey == null) {
                        setAccountPassword(false);
                        alert("Incorrect password")
    
                        window.location.replace("/");
                    } else if (accountPassword === false) {
                        setAccountPassword(false);
                        window.location.replace("/");
                    } else {
                        setAccountPassword(false);
                        window.location.replace("/");
                    }
                    i++;
                }
               
            }




        }
    } else {
        setAccountPassword(false);

        window.location.replace("/");
    }



    return (
        <div>
            <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                height: '100vh',
                backgroundColor: '#EEEEEE'
            }} className="App" id="outer-container">
                <div id="page-wrap">
                    <img style={{position: 'absolute', top: '5%', left: '42%', width: "15vw", padding: "10px"}} src={ounn} alt="ounn.png"></img>
                    <FilesComponent selectedKey={selectedKey} />
                    <p style={{  position: 'absolute', left: '0%', bottom: '0%', marginTop: '50px', width: '100%'}}>When uploading any data or files, these are automatically encrypted using your private key and stored across a fully decentralized network of nodes around the Earth. You and only you have control of your private key, and therefore you and only you can see or access your space, not even astronnaut.space has the possibility to see, interact, or access neither your space nor your private key.</p>
                </div>
            </div>
        </div>
    );
};

export default Files;