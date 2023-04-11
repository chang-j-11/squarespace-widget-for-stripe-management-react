import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

var BACKEND_API_BASE_URL = 'https://otr-stripe-express.onrender.com';

const SuccessPage = () => {
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Retrieve the session_id from the URL parameters
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');
    const isOTR = searchParams.get('isOTR');

    // Make a request to the backend to retrieve payment details
    fetch(
      BACKEND_API_BASE_URL + `/success?session_id=${sessionId}&isOTR=${isOTR}`
    )
      .then((response) => response.json())
      .then((data) => setPaymentDetails(data))
      .catch((error) => console.error(error));
  }, [location.search]);

  return (
    <div>
      {paymentDetails ? (
        <div style={{ margin: 10 }}>
          <h3>Dear {paymentDetails.customer_details.name}</h3>
          <p>
            <b>Thank you for your purchase! </b>
          </p>
          <p>
            {' '}
            Your {paymentDetails.mode} of{' '}
            <b>${paymentDetails.amount_total / 100}</b> has been processed
            successfully.
          </p>
          <p>Transaction ID: {paymentDetails.id} </p>
        </div>
      ) : (
        <h1>Loading payment details...</h1>
      )}
    </div>
  );
};

export default SuccessPage;
