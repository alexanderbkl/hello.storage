import React, { useState } from 'react';
import FilesComponent from './FilesComponent';
import FilesComponentRefactored from './FilesComponentRefactored';
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
    
                        window.location.replace("/gox.earth");
                    } else if (accountPassword === false) {
                        setAccountPassword(false);
                        window.location.replace("/gox.earth");
                    } else {
                        setAccountPassword(false);
                        window.location.replace("/gox.earth");
                    }
                    i++;
                }
               
            }




        }
    } else {
        setAccountPassword(false);

        window.location.replace("/gox.earth");
    }



    return (
        <div className="App">
            <div className="h-100">
                    {/*<FilesComponent selectedKey={selectedKey} />*/}
                    <FilesComponentRefactored selectedKey={selectedKey} />
            </div>
        </div>
    );
};

export default Files;