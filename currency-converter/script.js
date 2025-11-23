// Authentication functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function logout() {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

// Check if user is logged in and update header
function updateHeader() {
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
        if (isLoggedIn()) {
            const username = getCurrentUser();
            loginLink.innerHTML = `Welcome, ${username} | <a href="#" onclick="logout()" style="color: white; text-decoration: underline;">Logout</a>`;
            loginLink.style.cursor = 'default';
            // Remove any existing click handlers to prevent navigation
            const newLoginLink = loginLink.cloneNode(true);
            loginLink.parentNode.replaceChild(newLoginLink, loginLink);
        } else {
            loginLink.innerHTML = 'Login/Signup';
            loginLink.href = 'login.html';
            loginLink.onclick = null;
        }
    }
}

// Protect converter page - redirect if not logged in
function protectConverterPage() {
    if (window.location.pathname.includes('converter.html') || 
        window.location.href.includes('converter.html')) {
        if (!isLoggedIn()) {
            alert('Please login to access the converter.');
            window.location.href = 'login.html';
            return false;
        }
    }
    return true;
}

// Handle Get Started button
function handleGetStarted(event) {
    if (event) event.preventDefault();
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'converter.html';
    }
}

// Handle Login Form
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const resultDiv = document.getElementById('login-result');
    
    // Basic validation
    if (!username || !password) {
        resultDiv.textContent = 'Please fill in all fields.';
        resultDiv.style.color = 'red';
        resultDiv.style.display = 'block';
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username] && users[username] === password) {
        localStorage.setItem('currentUser', username);
        resultDiv.textContent = 'Login successful! Redirecting...';
        resultDiv.style.color = 'green';
        resultDiv.style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'converter.html';
        }, 1000);
    } else {
        resultDiv.textContent = 'Invalid username or password.';
        resultDiv.style.color = 'red';
        resultDiv.style.display = 'block';
    }
}

// Handle Signup Form
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const resultDiv = document.getElementById('signup-result');
    
    // Validation
    if (username.length < 3) {
        resultDiv.textContent = 'Username must be at least 3 characters.';
        resultDiv.style.color = 'red';
        resultDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        resultDiv.textContent = 'Password must be at least 6 characters.';
        resultDiv.style.color = 'red';
        resultDiv.style.display = 'block';
        return;
    }
    
    if (password !== confirmPassword) {
        resultDiv.textContent = 'Passwords do not match.';
        resultDiv.style.color = 'red';
        resultDiv.style.display = 'block';
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // Check if username exists
    if (users[username]) {
        resultDiv.textContent = 'Username already exists.';
        resultDiv.style.color = 'red';
        resultDiv.style.display = 'block';
        return;
    }
    
    // Save new user (in real app, you'd hash the password)
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Also save user details if needed
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    userDetails[username] = { email: email, joined: new Date().toISOString() };
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
    
    resultDiv.textContent = 'Signup successful! Please login.';
    resultDiv.style.color = 'green';
    resultDiv.style.display = 'block';
    
    setTimeout(() => {
        showLoginForm();
    }, 1500);
}

// Toggle between login and signup forms
function showSignupForm() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('signup-section').style.display = 'block';
    // Clear results
    document.getElementById('login-result').style.display = 'none';
    document.getElementById('signup-result').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    // Clear results
    document.getElementById('login-result').style.display = 'none';
    document.getElementById('signup-result').style.display = 'none';
}

// Currency Converter functionality
function initConverter() {
    const form = document.getElementById('converter-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const amount = parseFloat(document.getElementById('amount').value);
            const fromCurrency = document.getElementById('from-currency').value;
            const toCurrency = document.getElementById('to-currency').value;
            const resultDiv = document.getElementById('result');
            
            if (isNaN(amount) || amount <= 0) {
                showResult('Please enter a valid amount.', 'error');
                return;
            }
            
            if (fromCurrency === toCurrency) {
                showResult('Please select different currencies.', 'error');
                return;
            }
            
            // Show loading
            showResult('Converting...', 'loading');
            
            // Fetch exchange rates from the Frankfurter API
            fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error || !data.rates) {
                        showResult('Error fetching rates. Please try again later.', 'error');
                        return;
                    }
                    
                    const rate = data.rates[toCurrency];
                    if (!rate) {
                        showResult('Exchange rate not available for the selected currencies.', 'error');
                        return;
                    }
                    
                    const convertedAmount = (amount * rate).toFixed(2);
                    showResult(`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency} (Rate: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency})`, 'success');
                })
                .catch(error => {
                    showResult('Error: Unable to fetch exchange rates. Check your connection.', 'error');
                    console.error('Error:', error);
                });
        });
    }
}

function showResult(message, type = 'info') {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
        
        // Set color based on type
        if (type === 'error') {
            resultDiv.style.backgroundColor = '#ffe6e6';
            resultDiv.style.color = '#d63031';
            resultDiv.style.borderColor = '#d63031';
        } else if (type === 'success') {
            resultDiv.style.backgroundColor = '#e6ffe6';
            resultDiv.style.color = '#00b894';
            resultDiv.style.borderColor = '#00b894';
        } else if (type === 'loading') {
            resultDiv.style.backgroundColor = '#e6f3ff';
            resultDiv.style.color = '#0984e3';
            resultDiv.style.borderColor = '#0984e3';
        } else {
            resultDiv.style.backgroundColor = '#e9f5ff';
            resultDiv.style.color = '#004085';
            resultDiv.style.borderColor = '#007bff';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHeader();
    
    // Only protect converter pages, allow home page for everyone
    if (window.location.pathname.includes('converter.html') || 
        window.location.href.includes('converter.html')) {
        protectConverterPage();
    }
    
    initConverter();
    
    // Clear form results on page load
    const loginResult = document.getElementById('login-result');
    const signupResult = document.getElementById('signup-result');
    if (loginResult) loginResult.style.display = 'none';
    if (signupResult) signupResult.style.display = 'none';
});

// Historical data functions
function loadHistoricalData() {
    const fromCurrency = document.getElementById('historical-from').value;
    const toCurrency = document.getElementById('historical-to').value;
    
    // In a real application, you would fetch this from an API
    // For demo purposes, we'll generate sample data
    const historicalData = generateSampleHistoricalData(fromCurrency, toCurrency);
    
    displayHistoricalChart(historicalData);
    displayHistoricalTable(historicalData);
}

function generateSampleHistoricalData(fromCurrency, toCurrency) {
    const data = [];
    const baseRate = getBaseRate(fromCurrency, toCurrency);
    const today = new Date();
    
    for (let i = 365; i >= 0; i -= 30) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate realistic-looking fluctuations
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
        const rate = baseRate * (1 + fluctuation);
        
        data.push({
            date: date.toISOString().split('T')[0],
            rate: parseFloat(rate.toFixed(4))
        });
    }
    
    return data;
}

function getBaseRate(fromCurrency, toCurrency) {
    // Sample base rates for demonstration
    const rates = {
        'USD_EUR': 0.85,
        'USD_GBP': 0.73,
        'USD_JPY': 110,
        'EUR_USD': 1.18,
        'EUR_GBP': 0.86,
        'EUR_JPY': 129,
        'GBP_USD': 1.37,
        'GBP_EUR': 1.16,
        'GBP_JPY': 150,
        'JPY_USD': 0.0091,
        'JPY_EUR': 0.0078,
        'JPY_GBP': 0.0067
    };
    
    return rates[`${fromCurrency}_${toCurrency}`] || 1;
}

function displayHistoricalChart(data) {
    const ctx = document.getElementById('historical-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.historicalChart) {
        window.historicalChart.destroy();
    }
    
    const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const rates = data.map(item => item.rate);
    
    window.historicalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Exchange Rate',
                data: rates,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Historical Exchange Rates'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function displayHistoricalTable(data) {
    const container = document.getElementById('historical-data');
    container.innerHTML = '';
    
    // Show only the last 12 data points in the table
    const recentData = data.slice(-12);
    
    recentData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'historical-item';
        
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        row.innerHTML = `
            <span>${formattedDate}</span>
            <span>${item.rate}</span>
        `;
        
        container.appendChild(row);
    });
}

// Initialize historical data when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up historical data loader
    const loadHistoricalBtn = document.getElementById('load-historical');
    if (loadHistoricalBtn) {
        loadHistoricalBtn.addEventListener('click', loadHistoricalData);
        
        // Load initial data
        setTimeout(loadHistoricalData, 500);
    }
    
    // Set up currency swap functionality
    const swapBtn = document.getElementById('swap-currencies');
    if (swapBtn) {
        swapBtn.addEventListener('click', function() {
            const fromSelect = document.getElementById('from-currency');
            const toSelect = document.getElementById('to-currency');
            
            const temp = fromSelect.value;
            fromSelect.value = toSelect.value;
            toSelect.value = temp;
        });
    }
    
    // Load conversion history
    loadConversionHistory();
});

function loadConversionHistory() {
    if (!isLoggedIn()) return;
    
    const username = getCurrentUser();
    const history = JSON.parse(localStorage.getItem('conversionHistory_' + username) || '[]');
    const historyList = document.getElementById('history-list');
    
    if (historyList) {
        historyList.innerHTML = '';
        
        // Show only the last 10 conversions
        const recentHistory = history.slice(-10).reverse();
        
        if (recentHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #888;">No conversion history yet.</p>';
            return;
        }
        
        recentHistory.forEach(conversion => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            item.innerHTML = `
                <div class="history-details">
                    <div class="history-amount">${conversion.amount} ${conversion.from} → ${conversion.result} ${conversion.to}</div>
                    <div class="history-date">${new Date(conversion.date).toLocaleDateString()}</div>
                </div>
                <div class="history-rate">${conversion.rate}</div>
            `;
            
            historyList.appendChild(item);
        });
    }
}

// Enhanced conversion function to save history
function handleConversion(event) {
    event.preventDefault();
    
    if (!isLoggedIn()) {
        showResult('Please login to use the converter.');
        return;
    }
    
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    if (isNaN(amount) || amount <= 0) {
        showResult('Please enter a valid amount.');
        return;
    }
    
    if (fromCurrency === toCurrency) {
        showResult('Please select different currencies.');
        return;
    }
    
    // Fetch exchange rates from the Frankfurter API
    fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error || !data.rates) {
                showResult('Error fetching rates. Please try again later.');
                return;
            }
            
            const rate = data.rates[toCurrency];
            if (!rate) {
                showResult('Exchange rate not available for the selected currencies.');
                return;
            }
            
            const convertedAmount = (amount * rate).toFixed(2);
            const resultMessage = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
            showResult(resultMessage);
            
            // Save to history
            saveConversionToHistory(amount, fromCurrency, toCurrency, convertedAmount, rate);
            
            // Reload history
            loadConversionHistory();
        })
        .catch(error => {
            showResult('An error occurred: ' + error.message);
            console.error('Error:', error);
        });
}

function saveConversionToHistory(amount, fromCurrency, toCurrency, result, rate) {
    if (!isLoggedIn()) return;
    
    const username = getCurrentUser();
    const history = JSON.parse(localStorage.getItem('conversionHistory_' + username) || '[]');
    
    history.push({
        amount: amount,
        from: fromCurrency,
        to: toCurrency,
        result: result,
        rate: rate,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('conversionHistory_' + username, JSON.stringify(history));
}

// Update the initConverter function to use the new handleConversion
function initConverter() {
    const form = document.getElementById('converter-form');
    if (form) {
        form.removeEventListener('submit', handleConversion);
        form.addEventListener('submit', handleConversion);
    }
}