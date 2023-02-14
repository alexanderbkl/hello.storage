import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Routes,
  Route,
  HashRouter,
} from 'react-router-dom';
import CreateAccount from './components/CreateAccount';
import UploadData from './components/UploadData';
import UploadPasswords from './components/UploadPasswords';
import FilesComponent from './components/FilesComponent'; 
import Files from './components/Files';
import PasswordsRefactored from './components/PasswordsRefactored';
import NotesRefactored from './components/NotesRefactored';
import Data from './components/Data';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  //<BrowserRouter basename="/beta2">
    <HashRouter>
      <Routes>
      <Route path="/" element={<App />} />
      <Route path="/createAccount" element={<CreateAccount />} />
      <Route path="/uploadPasswords" element={<UploadPasswords />} />
      <Route path="/uploadData" element={<UploadData />} />
      <Route path="/filesComponent" element={<FilesComponent />} />
      <Route path="/files" element={<Files />} />
      <Route path="/passwords" element={<PasswordsRefactored />} />
      <Route path="/notes" element={<NotesRefactored />} />
      <Route path="/data" element={<Data />} />
    </Routes>
    </HashRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
