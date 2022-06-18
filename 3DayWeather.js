// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

// iCloud path
let fm = FileManager.iCloud();
let cachePath = fm.joinPath(fm.documentsDirectory(), "weatherCache");
if(!fm.fileExists(cachePath)){
  fm.createDirectory(cachePath)
}

// Background images
let darkModeHour = 21
let lightModeHour = 10
let Lightpath = fm.documentsDirectory() + "/3DayWeather/WLight.jpg";
let Darkpath = fm.documentsDirectory() + "/3DayWeather/WDark.jpg";
await fm.downloadFileFromiCloud(Lightpath);
await fm.downloadFileFromiCloud(Darkpath);

// Open Weather API Key
const API_KEY = " "

// Latitude and Longitude of the location where you get the weather of.
const LAT = 
const LON = 
const locationName = 
const units = "metric"// celcius
const weatherExclusions = "current,minutely,hourly,alerts"

// Weather data pull request
try {
  weatherData = await new Request("https://api.openweathermap.org/data/2.5/onecall?lat=" + LAT + "&lon=" + LON + "&exclude=" + weatherExclusions + "&units=" + units + "&lang=en&appid=" + API_KEY).loadJSON();
  fm.writeString(fm.joinPath(cachePath, "lastread"+"_"+locationName), JSON.stringify(weatherData));
} catch(e) {
  console.log("Offline mode")
  try{
    await fm.downloadFileFromiCloud(fm.joinPath(cachePath, "lastread"+"_"+locationName));
    let raw = fm.readString(fm.joinPath(cachePath, "lastread"+"_"+locationName));
    weatherData = JSON.parse(raw);
  }catch(e2){
    console.log("Error: No offline data cached")
  }
}

// Day Variables 
let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let today = new Date();
let tomorrow = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
let twoDays = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
let threeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
let hour = today.getHours();

// displays night symbols in darkmode
//let isNight = hour < lightModeHour || hour >= darkModeHour

// Tomorrow weather
let tomDay = days[ tomorrow.getDay() ]
let tomTemp = Math.round(weatherData.daily[1].temp.max) + "˚C"
let tomWeatherID = weatherData.daily[1].weather[0].id.toString();
let tomSym = SFSymbol.named(getWeatherSymbol(tomWeatherID));
let tomDesc = weatherData.daily[1].weather[0].description
tomDesc = titleCase(tomDesc)
const tom = [tomDay, tomTemp, tomSym, tomDesc]

// +2 day weather
let tom2Day = days[ twoDays.getDay() ]
let tom2Temp = Math.round(weatherData.daily[2].temp.max) + "˚C"
let tom2WeatherID = weatherData.daily[2].weather[0].id.toString();
let tom2Sym = SFSymbol.named(getWeatherSymbol(tom2WeatherID));
let tom2Desc = weatherData.daily[2].weather[0].description
tom2Desc = titleCase(tom2Desc)
let tom2 = [tom2Day, tom2Temp, tom2Sym, tom2Desc]

// +3 day weather
let tom3Day = days[ threeDays.getDay() ]
let tom3Temp = Math.round(weatherData.daily[3].temp.max) + "˚C"
let tom3WeatherID = weatherData.daily[3].weather[0].id.toString();
let tom3Sym = SFSymbol.named(getWeatherSymbol(tom3WeatherID));
let tom3Desc = weatherData.daily[3].weather[0].description
tom3Desc = titleCase(tom3Desc)
let tom3 = [tom3Day, tom3Temp, tom3Sym, tom3Desc]

/* --------------- */
/* Assemble Widget */
/* --------------- */

// Widget visual settings
const masterArray = ["Day", "Temp", "Icon", "Desc"]
const sizes = [30, 14, 40, 12]
const spacings = [5, 9, 9, 0]
const columnWidth = 110
const contentColor = [Color.white(), Color.white(), Color.white(), Color.white()]

// Widget creation
const widget = new ListWidget()
var i = 0
for (var item of masterArray) {
	const stack = widget.addStack()
	stack.centerAlignContent()
	createStack(stack,tom[i],columnWidth,sizes[i],contentColor[i]);
	createStack(stack,tom2[i],columnWidth,sizes[i],contentColor[i]);
	createStack(stack,tom3[i],columnWidth,sizes[i],contentColor[i]);
	widget.addSpacer(spacings[i]);
i++
}

// background based on hour
if (hour < lightModeHour || hour >= darkModeHour) {
	widget.backgroundImage = fm.readImage(Darkpath);
} else {
	widget.backgroundImage = fm.readImage(Lightpath);
}

// Set or Preview Widget
if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
widget.presentMedium()
}

/* --------------- */
/*    Functions    */
/* --------------- */

// Stack assembly
function createStack(stack, content, width, cSize, cColor) {
  const tmpStack = stack.addStack()
  if (typeof content == "string") {
  	tmpStack.size = new Size(width, cSize)
  	var widgetOutput = tmpStack.addText(content)
  	if (days.includes(content)) {		// Changes font size for weekdays
    	widgetOutput.font = Font.thinSystemFont(cSize)
  } else {
    	widgetOutput.font = Font.lightSystemFont(cSize)
  }
  	widgetOutput.textColor = cColor
  } else if (typeof content == "object") {
    tmpStack.size = new Size(width, cSize)
    content.applyFont(Font.lightSystemFont(cSize));
  	var widgetOutput = tmpStack.addImage(content.image)
  	widgetOutput.tintColor = cColor
  }
  return widgetOutput
}

// String to title case
function titleCase(str) {
	str = str.toLowerCase().split(' ');
  	for (var i=0; i < str.length; i++) {
    	str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

// Convert OpenWeather symbol to SF Symbol
function getWeatherSymbol(weatherID){
  if (weatherID >= 210 && weatherID <= 221){
    return "cloud.bolt";
  } else if (weatherID >= 200 && weatherID <= 201 || weatherID >= 230 && weatherID <= 232){
    return "cloud.bolt.rain";
  } else if (weatherID >= 300 && weatherID <= 301 || weatherID >= 310 && weatherID <= 311) {
    return "cloud.drizzle";
  } else if (weatherID >= 312 && weatherID <= 321 || weatherID == 302) {
    return "cloud.rain";    
  } else if (weatherID >= 500 && weatherID <= 501 || weatherID >= 520 && weatherID <= 521) {
    return "cloud.rain";    
  } else if (weatherID == 511) {
    return "cloud.hail";    
  } else if (weatherID >= 502 && weatherID <= 504 || weatherID >= 522 && weatherID <= 531) {
    return "cloud.heavyrain";
  } else if (weatherID >= 600 && weatherID <= 602|| weatherID >= 615 && weatherID <= 622) {
    return "cloud.snow";
  } else if (weatherID >= 611 && weatherID <= 613) {
    return "cloud.sleet";
  } else if (weatherID >= 701 && weatherID <= 731) {
    return "sun.haze";
  } else if (weatherID == 741) {
    return "cloud.fog";
  } else if (weatherID >= 751 && weatherID <= 771) {
    return "sun.dust";
  } else if (weatherID == 781) {
    return "tornado";
  } else if (weatherID == 800) {
    return "sun.max";
  } else if (weatherID == 801) {
    return "sun.min";
  } else if (weatherID == 802) {
    return "cloud.sun";
  } else if (weatherID == 803) {
    return "cloud";
  } else if (weatherID == 804) {
    return "smoke";
  } else return "exclamationmark.circle"
}
	