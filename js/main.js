
    const baseUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp';
    let authToken;

    function authenticate() {
        const login_id = document.getElementById('login_id').value;
        const password = document.getElementById('password').value;
        const loginData = {
            login_id: login_id,
            password: password
        };

        fetch('https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Authentication failed.');
            }
            return response.json();
        })
        .then(data => {
            authToken = data.token;
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('createCustomerForm').style.display = 'block';
            document.getElementById('customerTable').style.display = 'block';
            loadCustomerList();
        })
        .catch(error => {
            console.error(error);
            alert('Authentication failed.');
        });
    }

    function loadCustomerList() {
        fetch(`${baseUrl}?cmd=get_customer_list`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('customerTable');
            table.innerHTML = `<tr><th>First Name</th><th>Last Name</th><th>Action</th></tr>`;
            data.forEach(customer => {
                table.innerHTML += `<tr><td>${customer.first_name}</td><td>${customer.last_name}</td><td><button onclick="editCustomer('${customer.uuid}')">Edit</button><button onclick="deleteCustomer('${customer.uuid}')">Delete</button></td></tr>`;
            });
        })
        .catch(error => console.error(error));
    }

    function createCustomer() {
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        // Get other customer fields here

        const customerData = {
            first_name: first_name,
            last_name: last_name,
            // Add other customer fields here
        };

        fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cmd: 'create', ...customerData })
        })
        .then(response => {
            if (response.status === 201) {
                alert('Customer created successfully.');
                loadCustomerList();
            } else if (response.status === 400) {
                alert('First Name or Last Name is missing.');
            }
        })
        .catch(error => console.error(error));
    }

    function deleteCustomer(uuid) {
        if (confirm('Are you sure you want to delete this customer?')) {
            fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cmd: 'delete', uuid: uuid })
            })
            .then(response => {
                if (response.status === 200) {
                    alert('Customer deleted successfully.');
                    loadCustomerList();
                } else if (response.status === 500) {
                    alert('Error: Customer not deleted.');
                } else if (response.status === 400) {
                    alert('UUID not found.');
                }
            })
            .catch(error => console.error(error));
        }
    }

    function editCustomer(uuid) {
        // Fetch the customer details using the UUID
        fetch(`${baseUrl}?cmd=get_customer&uuid=${uuid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Fill the update form with the customer details
            document.getElementById('first_name').value = data.first_name;
            document.getElementById('last_name').value = data.last_name;
            // Set other customer fields here

            // Show the update form
            document.getElementById('createCustomerForm').style.display = 'block';

            // Change the form's submit button to Update
            const createButton = document.querySelector('#createCustomerForm button');
            createButton.innerText = 'Update';

            // Add a click event listener to the submit button to call the updateCustomer() function
            createButton.removeEventListener('click', createCustomer);
            createButton.addEventListener('click', () => updateCustomer(uuid));
        })
        .catch(error => console.error(error));
    }

    function updateCustomer(uuid) {
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        // Get other customer fields here

        const customerData = {
            first_name: first_name,
            last_name: last_name,
            // Add other customer fields here
        };

        fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cmd: 'update', uuid: uuid, ...customerData })
        })
        .then(response => {
            if (response.status === 200) {
                alert('Customer updated successfully.');
                loadCustomerList();
            } else if (response.status === 500) {
                alert('Error: Customer not updated.');
            } else if (response.status === 400) {
                alert('Body is empty.');
            }
        })
        .catch(error => console.error(error));
    }
