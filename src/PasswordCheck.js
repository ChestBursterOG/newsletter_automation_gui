// PasswordCheckComponent.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';

const PasswordCheckComponent = ({ onPasswordVerified }) => {
  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
 

  const handlePasswordChange = (e) => {
    setInputPassword(e.target.value);
  };

  const handlePasswordSubmit = () => {
    // Tutaj dokonujemy weryfikacji hasła. Możesz porównać inputPassword z hasłem przechowywanym w .env.
    const correctPassword = process.env.REACT_APP_PASSWORD; // Załóżmy, że hasło przechowujemy w zmiennej środowiskowej REACT_APP_PASSWORD
    if (inputPassword === correctPassword) {
      onPasswordVerified(true); // Jeśli hasło jest poprawne, przekazujemy true do głównego komponentu
    } else {
      alert('Nieprawidłowe hasło!'); // Jeśli hasło jest niepoprawne, wyświetlamy alert
      setInputPassword(''); // Czyścimy input
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h6" align="center" gutterBottom>
        Wprowadź hasło
      </Typography>
      <TextField
        fullWidth
        label="Hasło"
        type="password"
        value={inputPassword}
        onChange={handlePasswordChange}
        margin="normal"
        variant="outlined"
      />
      <Button variant="contained" color="primary" onClick={handlePasswordSubmit}>
        Sprawdź hasło
      </Button>
    </Container>
  );
};

export default PasswordCheckComponent;
