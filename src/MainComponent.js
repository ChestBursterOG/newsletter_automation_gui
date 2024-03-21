// MainComponent.js
import React, { useState } from 'react';
import { Container } from '@mui/material';
import PasswordCheck from './PasswordCheck';
import EmailScheduler from './EmailScheduler';

const MainComponent = () => {
  const [passwordVerified, setPasswordVerified] = useState(false);

  const handlePasswordVerified = (isVerified) => {
    setPasswordVerified(isVerified);
  };

  return (
    <div>
      {!passwordVerified && <PasswordCheck onPasswordVerified={handlePasswordVerified} />}
      {passwordVerified && (
        <Container maxWidth="lg">
          <EmailScheduler />
        </Container>
      )}
    </div>
  );
};

export default MainComponent;
