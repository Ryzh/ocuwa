import './App.css';
import { countries } from './data/countries';
import axios from 'axios';
import { useState, useEffect } from 'react';
import MarketChart from './components/MarketChart';

// Initialize Google Analytics
const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

function App() {
  const [chartData, setChartData] = useState(null);
  const [category, setCategory] = useState('');
  const [dataSource, setDataSource] = useState('');

  // Track page view on component mount
  useEffect(() => {
    trackEvent('page_view', {
      page_title: 'Market Analysis Dashboard',
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }, []);

  const handleSubmit = async () => {
    const productDescription = document.getElementById('productDescription').value;
    const targetMarket = document.getElementById('targetMarket').value;

    // Track form submission attempt
    trackEvent('form_submission', {
      product_description_length: productDescription.length,
      target_market: targetMarket
    });

    console.log('Form values:', JSON.stringify({ productDescription, targetMarket }, null, 2));

    if (!productDescription.trim() || !targetMarket) {
      console.log('Validation failed: Empty fields detected');
      // Track validation failure
      trackEvent('form_validation_failed', {
        reason: !productDescription.trim() ? 'empty_description' : 'no_market_selected'
      });
      alert('Please fill in both Product Description and Target Market fields.');
      return;
    }

    const targetUrl = "https://conjmbymafv4ffld2ckqmyqgsm0sygqh.lambda-url.us-east-1.on.aws/marketTrend";
    const requestBody = {
      productDescription: productDescription,
      targetMarket: targetMarket
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await axios.post(targetUrl, requestBody);
      console.log('Response received:', response.data);
      
      // Parse the response data
      let parsedData;
      try {
        // First try to parse if it's a string
        parsedData = typeof response.data.message === 'string' 
          ? JSON.parse(response.data.message)
          : response.data.message;
      } catch (e) {
        console.error('Error parsing response data:', e);
        parsedData = response.data.message;
      }

      console.log('Parsed data:', parsedData);

      // Extract the data, category, and dataSource
      const data = parsedData.data || {};
      const category = parsedData.category || 'Market Analysis';
      const dataSource = parsedData.datasource || 'Market Research Data';

      // Track successful data fetch
      trackEvent('data_fetch_success', {
        category: category,
        data_source: dataSource,
        data_points: Object.keys(data).length
      });

      setChartData(data);
      setCategory(category);
      setDataSource(dataSource);
    } catch (error) {
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Track error
      trackEvent('data_fetch_error', {
        error_message: error.message,
        error_code: error.code
      });
      alert('Error fetching data. Please try again later.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label htmlFor="productDescription" style={{ marginBottom: '10px' }}>Product Description:</label>
          <textarea
            id="productDescription"
            name="productDescription"
            style={{ 
              padding: '10px',
              width: '400px',
              height: '100px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            onChange={(e) => {
              // Track input changes
              if (e.target.value.length > 0) {
                trackEvent('product_description_input', {
                  input_length: e.target.value.length
                });
              }
            }}
          />
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label htmlFor="targetMarket" style={{ marginBottom: '10px' }}>Target Market:</label>
            <select
              id="targetMarket"
              name="targetMarket"
              style={{
                padding: '10px',
                width: '400px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: 'black'
              }}
              onChange={(e) => {
                // Track market selection
                if (e.target.value) {
                  trackEvent('market_selection', {
                    selected_market: e.target.value
                  });
                }
              }}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              width: '400px',
              transition: 'background-color 0.3s ease'
            }}
          >
            Submit
          </button>

          <MarketChart 
            data={chartData} 
            category={category}
            dataSource={dataSource}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
