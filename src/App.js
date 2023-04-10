import {
  Button,
  ThemeProvider,
  TextField,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import React, { useState } from 'react';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#272727',
      // darker: '#272727',
    },
    secondary: {
      main: '#045bc8',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: [
      // 'proxima-nova',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

function App() {
  const [userEmail, setEmail] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [recurring, setRecurring] = useState(false);

  const handleGiveMonthly = async (e) => {
    window.StripeCheckout.configure({
      key: 'pk_live_omFEyE2DE0tcVCnGOvzp0sAJ00dCLqc2S1',
      locale: 'auto',
      token: this.onGetStripeToken.bind(this),
    });
  };

  const getToken = async (e) => {};

  const handleManageSubscription = async (e) => {
    setError('');
    if (userEmail.trim() === '') {
      setError(
        'Enter the email you subscribed with and then click "Manage Subscription" again'
      );
      return;
    }

    try {
      var urlencoded = new URLSearchParams();
      urlencoded.append('email', userEmail);
      urlencoded.append('key', 'pk_live_omFEyE2DE0tcVCnGOvzp0sAJ00dCLqc2S1');
      const response = await fetch('/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlencoded,
      });

      const data = await response.json();
      // window.location.href = data.url;
      setPortalUrl(data.url);

      console.log('this is data, ', data);
    } catch (error) {
      console.error(error);
      setPortalUrl('');
      setError(
        'Subscription with provided email not found, please check and re-enter email'
      );
    }
  };

  const handleGetPortalLink = async () => {
    try {
      var urlencoded = new URLSearchParams();
      urlencoded.append('email', userEmail);
      urlencoded.append('portal_url', portalUrl);

      const response = await fetch('/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlencoded,
      });

      const data = await response.json();
      console.log('This is email data, ', data);
      if (data.status === 200) {
        setEmailSent(true);
      }

      // window.open(data.portalUrl);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Grid container>
          <Button
            color='primary'
            size='medium'
            sx={{ margin: 1 }}
            variant='contained'
            onClick={handleGiveMonthly}
          >
            Start Subscription / Payment
          </Button>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox color='secondary' sx={{ margin: 1 }} />}
              label='Monthly'
            />
          </FormGroup>
        </Grid>

        <div>
          <Button
            color='primary'
            variant='contained'
            size='large'
            sx={{ margin: 1 }}
            onClick={handleManageSubscription}
          >
            Manage Subscription
          </Button>
          <TextField
            id='email-input'
            label='Email address'
            type='email'
            value={userEmail}
            size='small'
            sx={{ margin: 1 }}
            onChange={(e) => setEmail(e.target.value)}
            error={error !== ''}
            helperText={error}
          />
        </div>
        <div>
          {portalUrl ? (
            <div>
              <Button
                variant='contained'
                size='large'
                sx={{ margin: 1 }}
                color='success'
                onClick={handleGetPortalLink}
              >
                Get Link to Customer Portal
              </Button>
              <div>
                {emailSent ? (
                  <Box sx={{ m: 1 }}>
                    Email Sent to <b>{userEmail}</b> ! Please check your email
                    for link to Customer Portal. Thank you!
                  </Box>
                ) : (
                  <></>
                )}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
