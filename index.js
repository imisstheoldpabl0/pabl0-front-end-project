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


/* DEFAULT PARAMETERS (DO NOT TOUCH) */
let cryptoCoin = 'XETH'; // XXETH -> Bitcoin
let cryptoPair = 'ZUSD'; // ZUSD -> US dollar
let timeFrameInterval = '1440'; // Represents candle length 1440min/60min=24h (1 candle = 1 day) -> Default: 24h

let sinceInterval = '1704067200'; // Represents the time since when the data is fetched in Unix Timestamp-> Default: january 1st 2024
let sinceReadable = new Date(sinceInterval * 1000) // converted to milliseconds regular date to display in the chart
//console.log(sinceReadable);

let timeFrameReadable = timeFrameInterval / 60; // converted to hours to display on the chart -> Not used

/* RESIZE CHART BASE ON WINDOW SIZE */
let newWidth = Math.round(window.innerWidth * 0.8);
let newHeight = Math.round(window.innerHeight * 0.75);


// pickDate() --> Doesn't work since the API doesn't allow to fetch data from a specific date
/*
function pickDate() {

    // Displays the calendar and saves the user's option as date (js-datepicker library)
    const picker = datepicker(document.getElementById("datePicker"), {
        // Event callbacks.
        onSelect: instance => {

            // Show which date was selected.
            let selectedDate = instance.dateSelected;
            console.log('This is the selected date: ' + selectedDate); // Logs selected date

            let selectedDateInMs = Date.parse(selectedDate); // Turns selectedDate into milliseconds
            console.log('This is the selected date in milliseconds: ' + selectedDateInMs);

            let unixTimestamp = Math.floor(selectedDateInMs / 1000); // Turns selectedDateInMs into Unix Timestamp (chart)
            console.log('This is the selected date un Unix: ' + unixTimestamp);

            let now = Math.floor(Date.now() / 1000);
            console.log('This is the current date un Unix: ' + now);

            sinceInterval = String(now - unixTimestamp);
            console.log('This is the current date minus the selected date in Unix: ' + sinceInterval);

            console.log(picker);

            //document.getElementById("chartlength_button").innerHTML = `CHART LENGTH: ${selectedDate}`
        },
        onShow: instance => {
            //console.log('Calendar showing.')
        },
        onHide: instance => {
            //console.log('Calendar hidden.')
        },
        onMonthChange: instance => {
            // Show the month of the selected date.
            //console.log(instance.currentMonthName)
        },

        // Customizations.
        formatter: (input, date, instance) => {
            // This will display the date as `1/1/2019`.
            input.value = date.toDateString()
        },
        position: 'bl', // Bottom left.
        startDay: 1, // Calendar week starts on a Monday.
        customDays: ['S', 'M', 'T', 'W', 'Th', 'F', 'S'],
        customMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        overlayButton: 'Go!',
        overlayPlaceholder: 'Enter a 4-digit year',

        // Settings.
        alwaysShow: false, // Never hide the calendar.
        dateSelected: new Date(), // Today is selected.
        maxDate: new Date(2099, 0, 1), // Jan 1st, 2099.
        minDate: new Date(2016, 5, 1), // June 1st, 2016.
        startDate: new Date(), // This month.
        showAllDates: true, // Numbers for leading & trailing days outside the current month will show.

        // Disabling things.
        noWeekends: false, // Saturday's and Sunday's will be unselectable.
        disabler: date => (date.getDay() === 2 && date.getMonth() === 9), // Disabled every Tuesday in October
        disabledDates: [new Date(2050, 0, 1), new Date(2050, 0, 3)], // Specific disabled dates.
        disableMobile: true, // Conditionally disabled on mobile devices.
        disableYearOverlay: true, // Clicking the year or month will *not* bring up the year overlay.

        // ID - be sure to provide a 2nd picker with the same id to create a daterange pair.
        id: 1
    });

}
pickDate();
*/


// Returns the data from the OHLC endpoint from a specific asset pair
async function getData() {

    try {
        const url = `https://api.kraken.com/0/public/OHLC?pair=${cryptoCoin}${cryptoPair}&interval=${timeFrameInterval}&since=${sinceInterval}`
        console.log(url);
        let response = await fetch(url); // Fetches the provided URL with parameters from the user
        let data = await response.json();
        return data.result; // Return only the result data

    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


// Handles users's choices
function addDropdownEventListeners() {

    const dropdownItems = document.querySelectorAll('.dropdown-content a');

    dropdownItems.forEach(item => {
        item.addEventListener('click', async function (event) {
            // Prevents default action of navigating to #
            event.preventDefault();

            const value = this.getAttribute('data-value');
            const itemText = this.textContent;

            console.log("Clicked on the item with value:", this.getAttribute('data-value'));

            if (['XXBT', 'XETH', 'XXLM', 'XXRP'].includes(value)) {
                cryptoCoin = value;
                document.getElementById("crypto_button").innerHTML = `CRYPTOCURRENCY: ${itemText}`;
                cryptoName = itemText;

            } else if (['ZUSD', 'ZEUR', 'ZGBP'].includes(value)) {
                cryptoPair = value;
                document.getElementById("fiat_button").innerHTML = `FIAT: ${itemText}`;
                cryptoName = itemText;

            } else if (['60', '240', '1440'].includes(value)) {
                timeFrameInterval = value;
                document.getElementById("timeframe_button").innerHTML = `TIMEFRAME: ${itemText}`;

            } else if (['604800', '1209600', '2629743', '31556926', '63113852'].includes(value)) {
                let now = Math.floor(Date.now() / 1000);
                sinceInterval = now - value;
                document.getElementById("chartlength_button").innerHTML = `CHART LENGTH: ${itemText}`;

            }

            await drawChartWithData();
            console.log(`Updated Values: ${cryptoCoin}, ${cryptoPair}, ${timeFrameInterval}`);
        });
    });
}


// Draw the chart (js-apexcharts library)
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
                    width: newWidth,
                    height: newHeight,
                    events: {
                        mounted: (chart) => {
                            chart.windowResizeHandler();
                        }
                    }
                },
                dataLabels: {
                    enabled: false
                },
                series: [{
                    data: candles // Use the converted candlestick data
                }],
                title: {
                    text: `${cryptoCoin}/${cryptoPair}`,
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
        return x_chart;

    } catch (error) {
        console.error('Error drawing chart:', error);
    }
}


// Executes 
async function indexDemo() {

    addDropdownEventListeners();
    await drawChartWithData();
}
indexDemo();

