// User parameters that will affect the URL
let cryptoCoin = 'XXBTZ';
let cryptoPair = 'USD';
let timeFrameInterval = '1440'; // represents how many days are shown in the graph (5=5days),(1440=720days)
let enumInterval = '21600';

async function getData() {
  try {
    const url = `https://api.kraken.com/0/public/OHLC?pair=${cryptoCoin}${cryptoPair}&interval=${timeFrameInterval}&${enumInterval}` // URL is defined
    let cryptos = await fetch(url); // Fetches the provided URL with parameters from the user
    let data = await cryptos.json();
    return data.result; // Return only the result data
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function drawChartWithData() {
  try {
    let data = await getData(); // Retrieves API data

    if (!data) {
      console.log('No data available.');
      return;
    }

    let pairing = `${cryptoCoin}${cryptoPair}` // Pairing is defined as the concatenation of the crypto coin and the pairing chosen
    console.log(pairing); // Sometimes the object name in which the data is found is not strictly the combination of these two!

    // Extract OHLC data from Kraken's API response
    const candles = data[pairing].map(candle => {
      const [timestamp, open, high, low, close] = candle.slice(0, 5); // Extract the first five values from data.result.${cryptoPairing}
      return {
        x: new Date(timestamp * 1000), // Convert timestamp to milliseconds
        y: [parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(close)] // Convert OHLC values to numbers
      };
    });

    let chart = new ApexCharts(
      document.querySelector("#chart"),
      {
        chart: {
          type: 'candlestick',
          width: 800,
          height: 500
        },
        dataLabels: {
          enabled: false
        },
        series: [{
          data: candles // Use the converted candlestick data
        }],
        title: {
          text: `${cryptoCoin}${cryptoPair}`,
          align: 'left'
        },
        noData: {
          text: 'Fetching data...',
          style: {
            fontSize: '14px',
            fontFamily: 'SFProMedium'
          }
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: '#3C90EB',
              downward: '#DF7D46'
            }
          }
        },
        xaxis: {
          type: 'datetime'
        },
        yaxis: {
          tooltip: {
            enabled: true
          }
        }
      }
    );

    chart.render();
  } catch (error) {
    console.error('Error drawing chart:', error);
  }
}

drawChartWithData();


