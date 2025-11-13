import './styles.css';
import loadingGif from './img/loading.gif';

const weatherKey = 'B8LNWTWQ7U89EYFWCFGEW6TUK';
const form = document.querySelector('form');
const inputLocation = form.querySelector('#local');
const invalidField = form.querySelector('.invalid');
let local = 'sao-paulo';

async function getWeatherReport() {
  const APIURL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${local}?unitGroup=metric&key=${weatherKey}&contentType=json`;

  try {
    const response = await fetch(APIURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    invalidField.textContent = 'Invalid location name';
    const mainIcon = document.querySelector('.icon');
    mainIcon.src = '';
    console.error('OPsie! ', error.message);
  }
}

function clearTemplate() {
  const mainTitle = document.querySelector('.main');
  const textDescription = document.querySelector('.description');
  const mainIcon = document.querySelector('.icon');
  const temperature = document.querySelector('.temperature');
  const conditions = document.querySelector('.conditions');
  const forecast = document.querySelector('.forecast');

  [mainTitle, textDescription, temperature, conditions, forecast].forEach(item => {
    item.textContent = '';
  });

  mainIcon.src = loadingGif;
}

async function updateTemplate({ resolvedAddress, description, days, currentConditions }) {
  const mainTitle = document.querySelector('.main');
  const textDescription = document.querySelector('.description');
  const mainIcon = document.querySelector('.icon');
  const temperature = document.querySelector('.temperature');
  const conditions = document.querySelector('.conditions');
  
  mainTitle.textContent = resolvedAddress.split(',')[0];
  textDescription.textContent = description;
  temperature.textContent = `${currentConditions.temp}°C`;
  conditions.textContent = currentConditions.conditions;
  const imageIcon = await getIcon(currentConditions.icon);
  mainIcon.src = imageIcon;

  buildForecast(days);
}

async function buildForecast(days) {
  const forecast = document.querySelector('.forecast');
  forecast.textContent = '';

  for(let i = 0; i < 7; i++){
    const dayTemplate = eachDay(days[i]);
    forecast.appendChild(await dayTemplate);
  }
}

async function eachDay(data) {
  const { conditions, description, datetime, icon } = data;
  const content = document.createElement('div');
  const date = document.createElement('time');
  const title = document.createElement('h5');
  const descript = document.createElement('p');
  const imgIcon = document.createElement('img');
  const wrap = document.createElement('div');
  const [year, month, day] = datetime.split('-');
  
  date.textContent = `${month}/${day}`;
  title.textContent = conditions;
  descript.textContent = description;
  content.classList.add('day');
  date.setAttribute('datetime', datetime);

  imgIcon.src = await getIcon(icon);

  ['temp','tempmax','tempmin'].forEach(item => {
    const tempData = document.createElement('span');
    const tempRound = Math.round(data[item]);

    tempData.classList.add(item);
    tempData.textContent = `${tempRound}°C`;
    wrap.appendChild(tempData);
  });

  [date, title, imgIcon, descript, wrap].forEach((elem) =>
    content.appendChild(elem)
  );

  return content;
}

async function getIcon(iconName) {
  const module = await import(`./icon/${iconName}.svg`);
  const result = await module.default;

  return result;
}

async function search() {
  clearTemplate();
  const weatherData = await getWeatherReport();
  if(weatherData){
    updateTemplate(weatherData);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  invalidField.textContent = '';
  const data = Object.fromEntries(new FormData(event.target));

  local = data.local.toLowerCase().replace(/\s/gi,'-');

  search();
});

inputLocation.addEventListener('focus', event => {
  invalidField.textContent = '';
  inputLocation.textContent = '';
});

async function init() {
  clearTemplate();
  const weatherData = await getWeatherReport();
  updateTemplate(weatherData);
}

init();
