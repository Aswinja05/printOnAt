document.addEventListener('DOMContentLoaded', function() {
    const merchantTransactionId = 'your-merchant-transaction-id'; // Replace with actual ID
    fetch('/payment/validate/' + merchantTransactionId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message); // Display the order received message
        }
        if (data.redirectTo) {
            window.location.href = data.redirectTo; // Redirect to the /main page
        }
    })
    .catch(error => console.error('Error:', error));
});
