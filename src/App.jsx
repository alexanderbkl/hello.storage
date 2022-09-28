import './App.css';
import Authentication from './components/Authentication';
import React from 'react';
//steps:
/*
1. Upload Key file
2. Upload File
2. Get JSON "files" list from IPNS resolved link
3. Add file to JSON "files" list
4. Upload JSON "files" list to IPNS resolved link
5. Resolve IPNS resolved link
*/


function App() {




  return (
    <div className="App">
      <header className="App-header">
        <Authentication/>

      </header>
    </div>
  );
}

export default App;
