function imageScroll() {
    // Allows rotation of the image with scroll

    window.onscroll = function () {
        scrollRotate();
    };

    function scrollRotate() {
        let image = document.getElementById("cube");
        image.style.transform = "rotate(" + window.scrollY / 2 + "deg)";
    }
}
imageScroll();

function epochConverter(sinceInterval) {
    // takes the current date in epoch time once you visits the website
    // reads the user option for chart length
    // subtracts the user option in epoch time from current time

    // 1 week = 604.800 seconds
    // 2 weeks = 1.209.600 seconds
    // 1 month = 2.629.743 seconds
    // 1 year = 31.556.926 seconds
    // 2 years = 63.113.852 seconds

    // e.g: Current time in epoch: 1711886605 -> Sunday, March 31, 2024 12:03:25 PM
    // returns 1711886605 - 604800 = 1 week ago from today
}



/* DEFAULT PARAMETERS (DO NOT TOUCH) */
let cryptoCoin = 'XETH'; // XXBT -> bitcoin
let cryptoPair = 'ZUSD'; // ZUSD -> us dollar
let timeFrameInterval = '1440'; // represents candle length 1440/60=24h (1 candle = 1 day)

let sinceInterval = '1704067200'; // represents the time since when the data is fetched -> january 1st 2024
let sinceReadable = new Date(sinceInterval * 1000) // converted to regular date to display in the chart
//console.log(sinceReadable);

let timeFrameReadable = timeFrameInterval / 60; // converted to hours to display on the chart

// Displays the demo chart with the pair selection via buttons
// User parameters that will affect the URL
// Get all crypto asset pairs: https://api.kraken.com/0/public/AssetPairs
// Get ETH/USD: https://api.kraken.com/0/public/OHLC?pair=ETHUSD&interval=1440&21600&since=1704067200


// Returns the data from the OHLC endpoint from a specific asset pair
async function getData() {
    const url = `https://api.kraken.com/0/public/OHLC?pair=${cryptoCoin}${cryptoPair}&interval=${timeFrameInterval}&since=${sinceInterval}`
    console.log(url);
    try {
        let response = await fetch(url); // Fetches the provided URL with parameters from the user
        let data = await response.json();
        return data.result; // Return only the result data

    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Draw the chart
async function drawChartWithData() {
    try {
        let data = await getData(); // Retrieves API data
        if (!data) {
            console.log('No data available.');
            return;
        }

        // Accesses the first position of the data.result JSON file whith the OHLC data
        let firstKey = Object.keys(data)[0];

        const candles = data[firstKey].map(candle => {
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
                    text: `${cryptoCoin}/${cryptoPair} - ${timeFrameReadable}h`,
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

// Handle users's choices
function addDropdownEventListeners() {

    const dropdownItems = document.querySelectorAll('.dropdown-content a');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function (event) {
            // Prevent default action
            event.preventDefault();

            const value = this.getAttribute('data-value');
            const itemText = this.textContent;

            console.log("Clicked on the item with value:", this.getAttribute('data-value'));

            if (['XXBT', 'ETH', 'SOL', 'XRP'].includes(value)) {
                cryptoCoin = value;
                document.getElementById("crypto_button").innerHTML = `CRYPTOCURRENCY: ${itemText}`;

            } else if (['ZUSD', 'ZEUR', 'ZGBP'].includes(value)) {
                cryptoPair = value;
                document.getElementById("fiat_button").innerHTML = `FIAT: ${itemText}`;

            } else if (['60', '240', '720', '1440'].includes(value)) {
                timeFrameInterval = value;
                document.getElementById("timeframe_button").innerHTML = `TIMEFRAME: ${itemText}`;

            } else if (['604800', '1209600', '2629743', '31556926', '63113852'].includes(value)) {
                // should perform a subtraction between the actual epoch time and the value chosen
                sinceInterval = value;
                document.getElementById("chartlength_button").innerHTML = `CHART LENGTH: ${itemText}`;
            }
            drawChartWithData();
            console.log(`Updated Values: ${cryptoCoin}, ${cryptoPair}, ${timeFrameInterval}, ${sinceInterval}`);
        });
    });
}

async function indexDemo() {
    
    addDropdownEventListeners();
    await drawChartWithData();

}

indexDemo();