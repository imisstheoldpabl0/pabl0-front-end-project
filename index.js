
// Allows rotation of the image with scroll
function imageScroll() {

    window.onscroll = function () {
        scrollRotate();
    };

    function scrollRotate() {
        let image = document.getElementById("cube");
        image.style.transform = "rotate(" + window.scrollY / 2 + "deg)";
    }
}
imageScroll();

// Displays the demo chart with the pair selection via buttons
async function indexDemo() {
    // User parameters that will affect the URL
    // Get all crypto asset pairs: https://api.kraken.com/0/public/AssetPairs
    // Get ETH/USD: https://api.kraken.com/0/public/OHLC?pair=ETHUSD&interval=1440&21600&since=1704067200

    /* PARAMETERS THAT WILL BE PASSED ON TO getData() */
    let cryptoCoin = 'XETH'; // XXBT -> bitcoin
    let cryptoPair = 'ZUSD'; // ZUSD -> us dollar
    let timeFrameInterval = '1440'; // represents candle length 1440/60=24h (1 candle = 1 day)

    let sinceInterval = '1704067200'; // represents the time since when the data is fetched -> january 1st 2024
    let sinceReadable = new Date(sinceInterval * 1000) // converted to regular date to display in the chart
    console.log(sinceReadable);

    let timeFrameReadable = timeFrameInterval / 60; // converted to hours to display on the chart


    // Returns the data from the OHLC endpoint from a specific asset pair
    async function getData(cryptoCoin, cryptoPair, timeFrameInterval) {
        try {
            const url = `https://api.kraken.com/0/public/OHLC?pair=${cryptoCoin}${cryptoPair}&interval=${timeFrameInterval}&since=${sinceInterval}` // URL is defined &since=${sinceInterval}
            let cryptos = await fetch(url); // Fetches the provided URL with parameters from the user
            let data = await cryptos.json();
            console.log(url);

            //console.log(url);
            return data.result; // Return only the result data
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // Returns the name of the pairing from the AssetPairs endpoint
    async function returnNames() {
        try {
            let data = await getData(cryptoCoin, cryptoPair);
            const url = `https://api.kraken.com/0/public/AssetPairs?pair=${cryptoCoin}${cryptoPair}`
            let customPair = await fetch(url);
            let pairData = await customPair.json();

            const result = pairData.result;
            const key = Object.keys(result)[0];
            const pairName = result[key].wsname;

            //console.log(pairName);
            return pairName;
        }
        catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    returnNames();

    // Draw the chart
    async function drawChartWithData() {
        try {
            let data = await getData(cryptoCoin, cryptoPair, timeFrameInterval); // Retrieves API data
            let pairName = await returnNames();

            if (!data) {
                console.log('No data available.');
                return;
            }

            let pairing = `${cryptoCoin}${cryptoPair}` // Pairing is defined as the concatenation of the crypto coin and the pairing chosen
            //console.log(pairing); // Sometimes the object name in which the data is found is not strictly the combination of these two

            // Extract OHLC data from Kraken's API response
            const candles = data[pairing].map(candle => {
                const [timestamp, open, high, low, close] = candle.slice(0, 5); // Extract first five values
                return {
                    x: new Date(timestamp * 1000), // Convert timestamp to milliseconds
                    y: [parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(close)] // Convert OHLC values to numbers
                };
            });

            let x_chart = new ApexCharts(
                document.querySelector("#x_chart"),
                {
                    chart: {
                        type: 'candlestick',
                        width: 1090, // would be nice to obtain the current window size and pass it on as a variable. eg: let windowSize = 100vw (should equal a number in px). let chartWidth = windowSize / X;
                        height: 600
                    },
                    dataLabels: {
                        enabled: false
                    },
                    series: [{
                        data: candles // Use the converted candlestick data
                    }],
                    title: {
                        text: `${pairName} - ${timeFrameReadable}h`,
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
                                upward: '#BCA695ff', // OG: #3C90EB yellow: fCCE36
                                downward: '#CA7A55' // OG: #DF7D46
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

            x_chart.render();
        } catch (error) {
            console.error('Error drawing chart:', error);
        }
    }

    drawChartWithData();

}
indexDemo();
