import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import 'dotenv/config'

// create express instance on port 3000
const app = express();
const port = 3000;

// create user agent - required by Met API
const headers = {'User-Agent': 'Capstone API Project/1.0.0 github.com/monticulos'};

// variables to be used in API request
var openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

// use static files in public folder (css, images)
app.use(express.static('public'));

// use body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// render home page
app.get('/', (req, res) => {
    res.render("index.ejs");
})

// render search results
app.post('/weather', async (req, res) => {
    try {
        // call OpenWeather API
        var location = req.body.location;
        const openWeatherApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${openWeatherApiKey}`;
        const openWeatherApiResponse = await axios.get(openWeatherApiUrl, {headers});
        var lat = openWeatherApiResponse.data[0].lat;
        var lon = openWeatherApiResponse.data[0].lon;

        //call Met API
        const metApiUrl = `https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${lat}&lon=${lon}`;
        const metApiResponse = await axios.get(metApiUrl, {headers});
        var details = metApiResponse.data.properties.timeseries[0].data.instant.details;
        var summary = metApiResponse.data.properties.timeseries[0].data.next_1_hours.summary;

        // structure content to be sent to front end
        var content = {
            location: openWeatherApiResponse.data[0].name,
            temperature: details.air_temperature,
            rain: details.precipitation_rate,
            humidity: details.relative_humidity,
            windDirection: details.wind_from_direction,
            windSpeed: details.wind_speed,
            gustSpeed: details.wind_speed_of_gust,
            symbol: summary.symbol_code,
        }

        res.render("weather.ejs", content);
    } catch (error) {
        console.log("Error :" + error);
        res.send("Unable to load API data. Please try again later.");
    }
})

app.listen(port, () => {
console.log(`Server listening on port ${port}`)
})