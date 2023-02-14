import React from 'react';
import CreateAccount from "./CreateAccount";
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
import { useNavigate } from 'react-router-dom';



let i = 0;

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



const Authentication = () => {

  const navigate = useNavigate();


  const [accountPassword, setAccountPassword] = useSessionStorage('accountPassword', false);
  const [accountKey, setAccountKey] = useLocalStorage('accountKey', false);

  const [values, setValues] = React.useState({
    open: false,
    password: "",
    showPassword: false,
  });



  const handleClose = () => {
    setValues({
      ...values,
      open: !values.open,
    });
    setAccountPassword(false);
    sessionStorage.setItem('accountPassword', false);


  };

  const handleDecrypt = () => {
    setAccountPassword(values.password);
    window.location.replace("./#/files");
    setValues({
      ...values,
      open: !values.open,
    });
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



  if (i < 1) {
    if (accountKey !== false && accountPassword !== false) {
      window.location.replace("./#/files");
      i++;

    } else if (accountKey !== false && accountPassword === false) {
      values.open = true;
      i++;
    }
  }






  async function setKeys(file) {
    const text = await file;

    setAccountKey(text);

  }


  return (
    <div style={{ margin: "100px" }}>
      <CreateAccount />
      <form>

        <Dialog open={values.open} onClose={handleClose}>
          <DialogTitle>Decrypt account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the password for your account.
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
            <Button onClick={handleDecrypt}>Decrypt</Button>
          </DialogActions>
        </Dialog>
        <p style={{ marginBottom: "100px" }}>or<br />Upload account:<br />
          <input
            type="file"
            onChange={(e) => setKeys(e.target.files[0].text())}
          />
        </p>
        <br />
      </form>
    </div>
  );
}

export default Authentication;
