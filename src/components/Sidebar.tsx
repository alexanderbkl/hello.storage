import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './Sidebar.css';

var mounted = false;


const Sidebar = ({ setSearchState, activeTab, selectedKey }: { setSearchState: any, activeTab: string, selectedKey: any }) => {


  const navigate = useNavigate();
  const [searchText, setSearchText] = React.useState('');

  function logOut() {
    if (!mounted) {
      //remove accountKey from localStorage
      localStorage.removeItem('accountKey');
      //remove accountPassword from sessionStorage
      sessionStorage.removeItem('accountPassword');
      window.location.replace('/#');
    }
    mounted = true;
  }

  useEffect(() => {
    if (activeTab === "files") {
      document.getElementById("files")!.classList.add("active");
      document.getElementById("navbarDropdown")!.classList.remove("active");
    } else if (activeTab === "data") {
      document.getElementById("files")!.classList.remove("active");
      document.getElementById("navbarDropdown")!.classList.add("active");
    }
  }, [activeTab]);

  return (



    <nav style={{ zIndex:'100', backgroundColor: 'black' }} className="z-100 position-absolute w-100 navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="https://joinhello.app"><img width={30} className="mx-2" src="./assets/helloicon.png" /><img width={100} src="./assets/hellologo.png" /> </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <span style={{ cursor: 'pointer' }} id="files" className="nav-link" aria-current="page" onClick={() => navigate("/files")}>Files</span>
            </li>

            <li style={{ zIndex: 100, }} className="nav-item dropdown">
              <span style={{ cursor: 'pointer' }} id="navbarDropdown" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Data
              </span>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><span style={{ cursor: 'pointer' }} className="dropdown-item" onClick={() => navigate("/passwords", { state: { selectedKey: selectedKey } })}>Passwords</span></li>
                <li><span style={{ cursor: 'pointer' }} className="dropdown-item" onClick={() => navigate("/notes", { state: { selectedKey: selectedKey } })}>Notes</span></li>
              </ul>
            </li>

            <li className="nav-item">
              <span style={{cursor: 'pointer'}} className="nav-link" onClick={() => logOut()}>Log out</span>
            </li>
          </ul>
          <div className="d-flex">
            <input onKeyDown={(e) => e.key === 'Enter' && setSearchState(searchText)} onChange={(e) => setSearchText(e.target.value)} className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button onClick={(e) => setSearchState(searchText)} className="btn btn-outline-success" type="button">Search</button>
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Sidebar;