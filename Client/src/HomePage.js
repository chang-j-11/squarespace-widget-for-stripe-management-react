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

const HomePage = () => {
  const [userEmail, setEmail] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [amount, setAmount] = useState(10);
  const [isOTR, setIsOTR] = useState(
    window.location.href.includes('otr') ||
      window.location.href.includes('localhost')
  );

  // const handleGiveMonthly = async (e) => {
  //   window.StripeCheckout.configure({
  //     key: 'pk_live_omFEyE2DE0tcVCnGOvzp0sAJ00dCLqc2S1',
  //     locale: 'auto',
  //     token: this.onGetStripeToken.bind(this),
  //   });
  // };

  const handleStartSubscription = () => {
    setAmountError('');
    if (amount < 1) {
      setAmountError('Please enter amount greater than 1, thank you!');
      return;
    }

    // Use the Stripe API to create a checkout session
    const mode = isMonthly ? 'subscription' : 'payment';
    // price_param = isMonthly ? {price: 'donation'} :

    var lineItems = [];

    if (isMonthly) {
      lineItems.push({
        price: 'donation',
        // price: 'price_1INq3IAn7ErLnggfVhvmkT9c', //use this price id for test mode
        quantity: amount * 100,
      });
    } else {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Donation' },
          unit_amount: amount * 100,
        },
        quantity: 1,
      });
    }

    const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}&isOTR=${isOTR}`;
    // const cancelUrl = `${window.location.origin}/cancel`;
    const cancelUrl = `http://www.otrlivingwater.org/giving`;

    var key = isOTR
      ? 'pk_live_omFEyE2DE0tcVCnGOvzp0sAJ00dCLqc2S1'
      : 'pk_live_KdrRmdy7ROe9s5mH1NtP29y300sTnjo38i';

    fetch(
      process.env.REACT_APP_BACKEND_API_BASE_URL + '/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          lineItems,
          successUrl,
          cancelUrl,
          key: key,
          // key: 'pk_test_IhjSXWyCUV1z477J2hIkSZ3a00agjA0zWQ',
        }),
      }
    )
      .then((response) => response.json())
      .then((session) => {
        // Redirect the user to the checkout page
        // window.location.href = session.url;
        window.open(session.url);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleManageSubscription = async (e) => {
    console.log('this is isOTR, ', isOTR);
    setError('');
    if (userEmail.trim() === '') {
      setError(
        'Enter the email you subscribed with and then click "Manage Subscription" again'
      );
      return;
    }
    var key = isOTR
      ? 'pk_live_omFEyE2DE0tcVCnGOvzp0sAJ00dCLqc2S1'
      : 'pk_live_KdrRmdy7ROe9s5mH1NtP29y300sTnjo38i';

    try {
      var urlencoded = new URLSearchParams();
      urlencoded.append('email', userEmail);
      urlencoded.append('key', key);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_API_BASE_URL +
          '/create-customer-portal-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: urlencoded,
        }
      );

      const data = await response.json();
      // window.location.href = data.url;
      setPortalUrl(data.url);

      console.log('this is data, ', data);
    } catch (error) {
      console.error(error);
      setPortalUrl('');
      setError(
        'Email not found, please re-enter email and click "Manage Subscription" again'
      );
    }
  };

  const handleGetPortalLink = async () => {
    try {
      var urlencoded = new URLSearchParams();
      urlencoded.append('email', userEmail);
      urlencoded.append('portal_url', portalUrl);

      const response = await fetch(
        process.env.REACT_APP_BACKEND_API_BASE_URL + '/email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: urlencoded,
        }
      );

      const data = await response.json();
      console.log('This is email data, ', data);
      if (data.status === 200) {
        setEmailSent(true);
        setPortalUrl('');
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
            onClick={handleStartSubscription}
          >
            Start Subscription / Payment
          </Button>
          <TextField
            label='$ Amount'
            type='number'
            value={amount}
            sx={{ margin: 1, width: 1 / 5 }}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            size='small'
            error={amountError !== ''}
            helperText={amountError}
            // inputProps={{ maxLength: 5 }}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isMonthly}
                  onChange={(e) => setIsMonthly(e.target.checked)}
                  color='secondary'
                  sx={{ my: 1 }}
                />
              }
              label='Monthly'
            />
          </FormGroup>
        </Grid>

        <div>
          <Button
            color='primary'
            variant='contained'
            size='medium'
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
            </div>
          ) : (
            <></>
          )}

          <div>
            {emailSent ? (
              <Box sx={{ m: 1 }}>
                Email Sent to <b>{userEmail}</b> ! Please check your email for
                link to Customer Portal. Thank you!
              </Box>
            ) : (
              <></>
            )}
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default HomePage;
