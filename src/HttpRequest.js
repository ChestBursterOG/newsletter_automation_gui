import React, { useState } from 'react';
import axios from 'axios';

function HttpRequest() {
    const [responseData, setResponseData] = useState(null);

    const emailData = {
    
        subject: 'Testowy e-mail przez post http',
        html: '<h1>To jest testowy e-mail przez post http</h1><p>To jest testowa treść e-maila.</p>',
        
    };
    
    // Adres URL twojego serwera
    const serverURL = 'http://localhost:3001/send-email';

    const sendData = async () => {
        try {
            const response = await axios.post(serverURL, emailData);
            setResponseData(response.data);
        } catch (error) {
            console.error('Błąd wysyłania zapytania:', error);
        }
    };

    return (
        <div>
            <button onClick={sendData}>Wyślij zapytanie</button>
            {responseData && <p>Odpowiedź: {JSON.stringify(responseData)}</p>}
        </div>
    );
}

export default HttpRequest;
