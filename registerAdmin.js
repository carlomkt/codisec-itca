const fetch = require('node-fetch');

async function registerAdmin() {
    const response = await fetch('http://localhost:5175/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'codisec',
            password: 'ccatter0312',
            role: 'ADMIN',
        }),
    });

    const data = await response.json();
    console.log(data);
}

registerAdmin();
