// Display Currency below USD element with click menu
(function() {
    'use strict';
    
    const USD_SELECTOR = "#root > div > div.css-175oi2r.r-13awgt0 > div > div > div > div > div > div > div > div.css-175oi2r.r-xyw6el > div.css-175oi2r.r-d23pfw.r-1awozwy > div";
    const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
    
    let exchangeRates = {};
    let currentCurrency = 'IDR';
    
    // Currency options with symbols and names
    const CURRENCIES = {
        'IDR': { symbol: 'Rp', name: 'Indonesian Rupiah' },
        'EUR': { symbol: '€', name: 'Euro' },
        'GBP': { symbol: '£', name: 'British Pound' },
        'JPY': { symbol: '¥', name: 'Japanese Yen' },
        'AUD': { symbol: 'A$', name: 'Australian Dollar' },
        'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
        'CHF': { symbol: 'Fr.', name: 'Swiss Franc' },
        'CNY': { symbol: '¥', name: 'Chinese Yuan' },
        'INR': { symbol: '₹', name: 'Indian Rupee' },
        'KRW': { symbol: '₩', name: 'South Korean Won' },
        'SGD': { symbol: 'S$', name: 'Singapore Dollar' },
        'THB': { symbol: '฿', name: 'Thai Baht' },
        'MYR': { symbol: 'RM', name: 'Malaysian Ringgit' },
        'PHP': { symbol: '₱', name: 'Philippine Peso' },
        'VND': { symbol: '₫', name: 'Vietnamese Dong' }
    };
    
    // Get exchange rates
    async function fetchExchangeRates() {
        try {
            const response = await fetch(EXCHANGE_API);
            const data = await response.json();
            if (data.rates) {
                exchangeRates = data.rates;
                console.log('Exchange rates updated');
            }
        } catch (error) {
            // Fallback rates
            exchangeRates = {
                'IDR': 15500, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 150,
                'AUD': 1.52, 'CAD': 1.36, 'CHF': 0.88, 'CNY': 7.24,
                'INR': 83, 'KRW': 1320, 'SGD': 1.34, 'THB': 36,
                'MYR': 4.7, 'PHP': 56, 'VND': 24500
            };
            console.log('Using fallback exchange rates');
        }
    }
    
    // Extract USD amount
    function extractUSDAmount(element) {
        const text = element.textContent || element.innerText;
        const match = text.match(/\$?([\d,]+\.?\d*)/);
        return match ? parseFloat(match[1].replace(/,/g, '')) : null;
    }
    
    // Format number based on currency
    function formatNumber(num, currency) {
        const decimals = ['JPY', 'KRW', 'VND', 'IDR'].includes(currency) ? 0 : 2;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }
    
    // Create currency menu
    function createCurrencyMenu() {
        const menu = document.createElement('div');
        menu.id = 'currency-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 20, 20, 0.98);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 12px;
            z-index: 999999;
            width: 280px;
            height: 60vh;
            max-height: 500px;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            display: none;
        `;
        
        Object.entries(CURRENCIES).forEach(([code, info]) => {
            const option = document.createElement('div');
            option.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-radius: 6px;
                color: ${code === currentCurrency ? '#4CAF50' : 'rgba(255, 255, 255, 0.95)'};
                font-weight: ${code === currentCurrency ? '600' : '500'};
                font-size: 16px;
                transition: all 0.2s ease;
                margin: 2px 0;
                border: 1px solid transparent;
            `;
            
            option.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${info.symbol} ${code}</span>
                    <span style="font-size: 12px; opacity: 0.7;">${info.name}</span>
                </div>
            `;
            
            option.onmouseenter = () => {
                if (code !== currentCurrency) {
                    option.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
            };
            
            option.onmouseleave = () => {
                option.style.backgroundColor = 'transparent';
            };
            
            option.onclick = (e) => {
                e.stopPropagation();
                currentCurrency = code;
                menu.style.display = 'none';
                updateDisplay();
                
                // Update all option styles
                menu.querySelectorAll('div').forEach(opt => {
                    const optCode = opt.textContent.split(' ')[1];
                    opt.style.color = optCode === currentCurrency ? '#4CAF50' : 'rgba(255, 255, 255, 0.9)';
                    opt.style.fontWeight = optCode === currentCurrency ? '600' : '400';
                });
            };
            
            menu.appendChild(option);
        });
        
        return menu;
    }
    
    // Create currency display
    function createCurrencyDisplay(usdElement) {
        // Remove existing display
        const existing = document.getElementById('currency-display');
        if (existing) existing.remove();
        
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            margin-top: 8px;
        `;
        
        const currencyDiv = document.createElement('div');
        currencyDiv.id = 'currency-display';
        currencyDiv.style.cssText = `
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
            font-family: farcaster-semi-bold, inherit;
            letter-spacing: -0.05px;
            font-size: 24px;
            line-height: 28px;
            cursor: pointer;
            transition: color 0.2s ease;
            user-select: none;
        `;
        
        const menu = createCurrencyMenu();
        
        // Add hover effect
        currencyDiv.onmouseenter = () => {
            currencyDiv.style.color = 'rgba(255, 255, 255, 1)';
        };
        
        currencyDiv.onmouseleave = () => {
            currencyDiv.style.color = 'rgba(255, 255, 255, 0.8)';
        };
        
        // Toggle menu on click
        currencyDiv.onclick = (e) => {
            e.stopPropagation();
            const isVisible = menu.style.display === 'block';
            menu.style.display = isVisible ? 'none' : 'block';
        };
        
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            menu.style.display = 'none';
        });
        
        container.appendChild(currencyDiv);
        container.appendChild(menu);
        
        // Insert after the USD element
        usdElement.parentNode.insertBefore(container, usdElement.nextSibling);
        return currencyDiv;
    }
    
    // Update display
    function updateDisplay() {
        const usdElement = document.querySelector(USD_SELECTOR);
        if (!usdElement) return;
        
        const usdAmount = extractUSDAmount(usdElement);
        if (usdAmount === null) return;
        
        let currencyDisplay = document.getElementById('currency-display');
        if (!currencyDisplay) {
            currencyDisplay = createCurrencyDisplay(usdElement);
        }
        
        const rate = exchangeRates[currentCurrency] || 1;
        const convertedAmount = usdAmount * rate;
        const currencyInfo = CURRENCIES[currentCurrency];
        
        currencyDisplay.textContent = `${currencyInfo.symbol} ${formatNumber(convertedAmount, currentCurrency)}`;
        currencyDisplay.title = `Click to change currency (${currencyInfo.name})`;
    }
    
    // Initialize
    async function init() {
        await fetchExchangeRates();
        updateDisplay();
        
        // Update every 5 seconds
        setInterval(updateDisplay, 5000);
        
        // Update exchange rates every 30 minutes
        setInterval(fetchExchangeRates, 30 * 60 * 1000);
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
