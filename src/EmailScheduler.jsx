import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, FormControlLabel, Checkbox, Button, FormControl, InputLabel, Select, MenuItem, Grid, List, ListItem, ListItemText, Snackbar, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

const FormData = require('form-data');

const FormContainer = styled('form')({
  marginTop: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const ScheduledEmailsList = styled(List)({
  width: '100%',
  maxWidth: 360,
  backgroundColor: '#f0f0f0',
  margin: 'auto',
  marginTop: 16,
});

const EmailScheduler = () => {
  const [database, setDatabase] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [sendLater, setSendLater] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const serverURL = process.env.REACT_APP_SEND_EMAIL;
  const scheduleURL = process.env.REACT_APP_SCHEDULE_EMAIL;

  const fetchScheduledEmails = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_SCHEDULED_EMAILS);
      setScheduledEmails(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania zaplanowanych wiadomości:', error);
    }
  };

  // Efekt pobierania zaplanowanych wiadomości co 15 sekund
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchScheduledEmails();
    }, 15000);

    // Wyczyszczenie interwału przy odmontowaniu komponentu
    return () => clearInterval(intervalId);
  }, []);

  const handleSendLaterChange = (event) => {
    setSendLater(event.target.checked);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const handleAttachmentChange = (event) => {
    const files = event.target.files;
    setAttachments([...attachments, ...files]);
  };

  const handleSendButtonClick = async () => {
    setLoading(true); // Ustawiamy stan loading na true, aby pokazać animację

    try {
      if (sendLater) {
        await scheduleEmail(); // Jeśli wybrano opcję "Wyślij później", wysyłamy dane do endpointu do planowania
      } else {
        await sendData(); // W przeciwnym razie wysyłamy dane do endpointu do natychmiastowego wysyłania
      }
  
      // Po udanym wysłaniu, pobieramy listę zaplanowanych wiadomości
      await fetchScheduledEmails();
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
    } finally {
      setLoading(false); // Ustawiamy stan loading na false po zakończeniu
    }
  };

  const scheduleEmail = async () => {
    const emailData = {
        subject: messageSubject,
        html: messageContent,
        date: selectedDate,
        time: selectedTime
    };

    try {
        if (attachments.length === 0) {
            const response = await axios.post(scheduleURL, emailData);
            setResponseData(response.data);
        } else {
            const formData = new FormData();
            attachments.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
            formData.append('subject', emailData.subject);
            formData.append('html', emailData.html);
            formData.append('date', emailData.date);
            formData.append('time', emailData.time);

            const response = await axios.post(process.env.REACT_APP_SCHEDULE_EMAIL_WITH_ATTACHMENT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResponseData(response.data);
        }
        setSnackbarSeverity('success');
        setSnackbarMessage('Wiadomość została zaplanowana do wysłania.');
        setSnackbarOpen(true);
        clearForm();
    } catch (error) {
        console.error('Błąd planowania wysyłania wiadomości:', error);
        setSnackbarSeverity('error');
        setSnackbarMessage('Wystąpił błąd podczas planowania wysyłania wiadomości.');
        setSnackbarOpen(true);
    } finally {
        setLoading(false); // Ustawiamy stan loading na false, aby zatrzymać animację
    }
};

  

  const handleUpload = async () => {
    const formData = new FormData();
    attachments.forEach((file, index) => {
        formData.append(`file${index}`, file);
    });

    try {
        await axios.post(process.env.REACT_APP_UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('Pliki zostały przesłane pomyślnie.');
    } catch (error) {
        console.error('Błąd podczas przesyłania plików:', error);
    }
};

const sendData = async () => {
  const emailData = {
      subject: messageSubject,
      html: messageContent
  };

  if (attachments.length === 0) {
      try {
          const response = await axios.post(serverURL, emailData);
          setResponseData(response.data);
          setSnackbarSeverity('success');
          setSnackbarMessage('E-mail został pomyślnie wysłany.');
          setSnackbarOpen(true);
          clearForm();
      } catch (error) {
          console.error('Błąd wysyłania zapytania:', error);
          setSnackbarSeverity('error');
          setSnackbarMessage('Wystąpił błąd podczas wysyłania e-maila.');
          setSnackbarOpen(true);
      } finally {
          setLoading(false); // Ustawiamy stan loading na false, aby zatrzymać animację
      }
  } else {
      try {
          const formData = new FormData();
          attachments.forEach((file, index) => {
              formData.append(`file${index}`, file);
          });

          formData.append('subject', messageSubject);
          formData.append('html', messageContent);

          // Używamy nowego endpointu '/send-email-with-attachments' zamiast '/send-email'
          await axios.post(process.env.REACT_APP_SEND_EMAIL_WITH_ATTACHMENT, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data'
              }
          });

          console.log('E-mail został wysłany z załącznikami.');
          setSnackbarSeverity('success');
          setSnackbarMessage('E-mail został pomyślnie wysłany z załącznikami.');
          setSnackbarOpen(true);
          clearForm();
      } catch (error) {
          console.error('Błąd wysyłania e-maila z załącznikami:', error);
          setSnackbarSeverity('error');
          setSnackbarMessage('Wystąpił błąd podczas wysyłania e-maila z załącznikami.');
          setSnackbarOpen(true);
      } finally {
          setLoading(false); // Ustawiamy stan loading na false, aby zatrzymać animację
      }
  }
};


const clearForm = () => {
  setDatabase('');
  setMessageSubject('');
  setMessageContent('');
  setSelectedDate(null);
  setSelectedTime(null);
  setSendLater(false);
  setAttachments([]);
};

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" align="center" gutterBottom>
            Narzędzie do planowania wysyłki e-maili
          </Typography>
          <FormContainer>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel id="database-label">Baza danych</InputLabel>
              <Select
                labelId="database-label"
                id="database"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                label="Baza danych"
              >
                <MenuItem value="database1">Baza danych 1</MenuItem>
                <MenuItem value="database2">Baza danych 2</MenuItem>
                <MenuItem value="database3">Baza danych 3</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Temat wiadomości"
              variant="outlined"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Treść wiadomości"
              multiline
              rows={4}
              variant="outlined"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <FormControl sx={{ marginBottom: 2 }}>
            <input
              id="attachment-input"
              type="file"
              multiple
              onChange={handleAttachmentChange}
              name="files" 
              style={{ display: 'none' }}
          />
              <label htmlFor="attachment-input">
                <Button variant="contained" component="span">
                  Wybierz załączniki
                </Button>
              </label>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendLater}
                  onChange={handleSendLaterChange}
                  name="sendLater"
                  color="primary"
                />
              }
              label="Wyślij później"
              sx={{ marginBottom: 2 }}
            />
            {sendLater && (
              <div>
                <TextField
                  id="date"
                  label="Data wysyłki"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={selectedDate}
                  onChange={handleDateChange}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  id="time"
                  label="Godzina wysyłki"
                  type="time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={selectedTime}
                  onChange={handleTimeChange}
                  sx={{ marginBottom: 2 }}
                />
              </div>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendButtonClick} // Zmieniamy funkcję onClick na handleSendButtonClick
              disabled={!database || !messageSubject || !messageContent || (sendLater && (!selectedDate || !selectedTime))}
              sx={{ marginBottom: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Wyślij'
              )}
            </Button>
          </FormContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" align="center" gutterBottom>
            Zaplanowane wiadomości
          </Typography>
          <ScheduledEmailsList>
            {scheduledEmails.map((email) => (
              <ListItem key={email.id}>
                <ListItemText
                  primary={email.subject}
                  secondary={`Ustawiono: ${email.setDate} ${email.setTime}, Zaplanowano: ${email.date}  ${email.time}`}
                />
              </ListItem>
            ))}
          </ScheduledEmailsList>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" align="center" gutterBottom>
            Załączniki
          </Typography>
          <ScheduledEmailsList>
            {attachments.map((attachment, index) => (
              <ListItem key={index}>
                <ListItemText primary={attachment.name} />
              </ListItem>
            ))}
          </ScheduledEmailsList>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmailScheduler;
