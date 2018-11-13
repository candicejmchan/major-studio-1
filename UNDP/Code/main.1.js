//Making objects for the different regions- wrote both central and middle africa so either can work
const regions = [
    {name : 'All', value : ['All'], className: 'africa'},
    {name : 'Central Africa', value : ['Central Africa', 'Middle Africa'], className: 'central-africa'},
    {name : 'West Africa', value : ['West Africa', 'Western Africa'], className: 'western-africa'},
    {name : 'East Africa', value : ['East Africa', 'Eastern Africa'], className: 'eastern-africa'},
    {name : 'Southern Africa', value : ['Southern Africa'], className: 'southern-africa'},
    {name : 'North Africa', value : ['North Africa', 'Northern Africa'], className: 'northern-africa'}
];

//write the indicator codes for the 
const indicators = [
    { name: '1.2_ACCESS.ELECTRICITY.RURAL', title: 'RURAL', position: 0 },
    { name: '1.1_ACCESS.ELECTRICITY.TOT', title: 'TOTAL', position: 2 },
    { name: '1.3_ACCESS.ELECTRICITY.URBAN', title: 'URBAN', position: 1 },
]; 

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 580 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// global variables
let svg, countriesSelector, allData;
const countryClicked = {};

const path = d3.geoPath()
    .projection(
        d3.geoMercator().scale(430).translate([width - 400, 290])
    );

//load the population, doctors, energy, countries, and access to energy datasets 
const popData = d3.csv('population.csv');
//const doctors = d3.json('doctors.json');
const food = d3.csv('fooddata.csv');
const energy = d3.json('RenewableEnergy.json');
const countries = d3.json('countries.json');
const accessEnergy = d3.csv('SE4ALLData.1.csv');



//Population Dataset[0] - search the keys for numbers with 4 digits(the year). 
const parseData = (data) => {
    let population = data[0].map(d => {
        const keys = d3.keys(d);
        const temp = {};
        keys.forEach(key => {
           if(key.match(/\d{4}/)){ //if the key matches something with 4 digits
               if(+key === 2017){
                   temp[key] = +d[key];
                }
           } else {
               if(key) {
                    temp[key] = d[key].trim();
               }
           } 
        });
        return temp;
    });
    
    let foodData = data[1].map(d => {
      const temp = {
          Loss: +d['Food Loss'],
          pharmacists: +d['Adequate Food Storage Facilities'],
          year: +d['Year'],
          country: d['Country'].trim(),
          region: d['Region'].trim(),
          country_code: null
      };
       
       //use countries that appear from the filtered population countries
       const country = population.filter(k => k['Country Name'] === temp.country);
       if(country.length > 0){
           temp.country_code = country[0]['Country Code'];
       }
       return temp;
    });
    
    //lodash - take the most recent year from all the years 
    food = _.chain(food)
    .groupBy('country_code')
    .toPairs()
    .map(d => {
        const lastIndex = d[1].length - 1;
        const sorted = _.sortBy(d[1], ['year']);// [lastIndex];
        const temp = {
            country: sorted[0].country,
            country_code: sorted[0].country_code,
            region: sorted[0].region,
        };
        let physicians = false;
        let pharmacists = false;
        for(let i=lastIndex; i > 0; i--){
            if(sorted[i].physicians && !physicians){
                temp.physicians = sorted[i].physicians;
                temp.year_physicians = sorted[i].year;
                physicians = true;
            }
            if(sorted[i].pharmacists && !pharmacists){
                temp.pharmacists = sorted[i].pharmacists;
                temp.year_pharmacists = sorted[i].year;
                pharmacists = true;
            }            
        }
        return temp;
    })
    .flatten()
    .value();
    
    const energyData = data[2].map(d => {
        const country = population.filter(k => k['Country Name'] === d.Country);
        if(country.length > 0){
           d.country_code = country[0]['Country Code'];
        } else {
            d.country_code = null;
        }
        return d;
    }).filter(d => d['Region'].indexOf('Africa') !== -1);
    
    const countryData = data[3];
    
    countryData.objects.countries.geometries = countryData.objects.countries.geometries
        .filter(d => d.properties.CONTINENT === 'Africa');
        
        
    const countryCodes = _.map(countryData.objects.countries.geometries, d => {
        return d.properties.ADM0_A3;//get countries 
    });
    const indicatorCodes = _.map(indicators, 'name');
        
    let accessEnergyData = data[4].filter(d => {
        return countryCodes.indexOf(d['Country Code']) !== -1 &&
            indicatorCodes.indexOf(d['Indicator Code']) !== -1;
    });
    
    
    accessEnergyData = accessEnergyData.map(d => {
       const keys = _.keys(d);
       const temp = {};
       let yeardata = [];
       keys.forEach(key => {
          if(key.match(/\d{4}/)){
              if(d[key]){
                  yeardata.push({
                      year: +key,
                      value: +d[key]
                  })
              }
          } else {
              if(key){
                temp[key] = d[key];
              }
          }
       });
       yeardata = _.sortBy(yeardata, ['year'])[yeardata.length - 1];
        if(yeardata){
            temp.year = yeardata.year;
            temp.value = yeardata.value;
        }
       return temp;
    });
    
    population = population.filter(d => countryCodes.indexOf(d['Country Code']) !== -1);
        
    return {
        population: population,
        food: food,
        energyData: energyData,
        countryData: countryData,
        accessEnergyData:  accessEnergyData
    };
};

Promise.all([popData, food, energy, countries, accessEnergy ])
.then( result => {
    const data = parseData(result);
    console.log(data);
    allData = data;
    initChart();
    createDropdown(regions);
    drawMap(data);
    selectRegionCountries(regions[0]);
});

const createDropdown = (data) => {
    d3.select('#region-menu').selectAll('.dropdown-item')
    .data(data).enter()
    .append('a')
    .attr('class', 'dropdown-item')
    .text( d => d.name)
    .on('click', d => {
       d3.select('#selected-region').text(d.name);
       selectRegionCountries(d);
    });
};

const initChart = () => {
    svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);      

};

//create and draw the map
const drawMap = (data) => {
    const countryData =  data.countryData;
    
    countriesSelector = svg.append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(topojson.feature(countryData, countryData.objects.countries).features)
        .enter().append('path')
        .attr('class', 'africa')
        .attr('d', path)
        .on('click', function(d){
            const obj = {
                region: d.properties.SUBREGION,
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN
            }; 
    
            const className = regions.filter(k => k.value.indexOf(obj.region) !== -1)[0].className;
            
            countryClicked[obj.country_code] = !countryClicked[obj.country_code];
            if(countryClicked[obj.country_code]) {
                d3.selectAll('.africa').classed('reduce-opacity', true);
                d3.selectAll('.country-box').classed('reduce-opacity', true);
                d3.select(`.${obj.country_code}-box`).classed('reduce-opacity', false);
                d3.select(this).classed('reduce-opacity', false);
                
                d3.select('#country-details-container').attr('class', '');
                d3.select('#country-details-container').classed(`${className}-de`,true);
                d3.select('#country-details-container').style('display', 'block');                
                
                onClickCountry(data, obj);                
            } else {
                d3.selectAll('.africa').classed('reduce-opacity', false);
                d3.selectAll('.country-box').classed('reduce-opacity', false);
                d3.select('#country-details-container').attr('class', '');
                d3.select('#country-details-container').style('display', 'none');
            }
        });
        
    const countryBorders = svg.append('path')
        .attr('class', 'country-borders')
        .attr('d', path(topojson.mesh(countryData, countryData.objects.countries, (a, b) => a !== b )));
};

//when you click on a specific country, the data below that corresponds to that country is attached
const onClickCountry = (data, d) => {
    const population = data.population;
    const food = data.food;
    const energyData = data.energyData;
    const accessEnergyData =  data.accessEnergyData;

    const pop = population.filter(k => k['Country Code'] === d.country_code)[0];
    const doctors = food.filter(k => k.country_code === d.country_code)[0];
    const energy = energyData.filter(k => k.country_code === d.country_code);
    const access = accessEnergyData.filter(k => k['Country Code'] === d.country_code);
    
    showCountryDetails({
        region: d.region,
        country_code: d.country_code,
        country_name: d.country_name,
        populationData: pop,
        doctorsData: doctors,
        energyData: energy,
        accessData: access
    });
};

// for each country add/ remove region colors
const selectRegionCountries = (region) => {
    let coun = [];
    countriesSelector
    .attr('class', d => {
        const reg = d.properties.SUBREGION;
        if(region.value[0]  === 'All') {
            coun.push({
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN,
                region: d.properties.SUBREGION,
                className: region.className
            });
            const row = regions.filter(k => k.value.indexOf(reg) !== -1)[0];
            return `africa ${row.className} ${d.properties.ADM0_A3}-map`;
        } else if(region.value.indexOf(reg) !== -1){
            coun.push({
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN,
                region: d.properties.SUBREGION,
                className: region.className
            });
            return `africa ${region.className} ${d.properties.ADM0_A3}-map`;
        } else {
            return `africa ${regions[0].className} ${d.properties.ADM0_A3}-map`;
        }
    });
    
    coun = _.sortBy(coun, d => d.country_name);
    
    createCountryBoxes(coun);
};

const createCountryBoxes = (data) => {
    
    const countryBox = d3.select('#country-box-container')
    .selectAll('.country-box')
    .data(data, d => d.country_code);
    
    countryBox.exit().remove();
    
    countryBox.enter()
    .append('div')
    .attr('class', d => {
        const row = regions.filter(k => k.value.indexOf(d.region) !== -1)[0];
        return `country-box ${d.country_code}-box ${row.className}-bk`
    })
    .append('div')
    .text(d => d.country_name)
    .on('click', function(d) {
        // console.log(d3.event.x, d3.event.y);
        // d3.select('#country-details-container').style('top', `${d3.event.y}px`);
        
        const className = regions.filter(k => k.value.indexOf(d.region) !== -1)[0].className;

        countryClicked[d.country_code] = !countryClicked[d.country_code];
        if(countryClicked[d.country_code]) {
            d3.selectAll('.africa').classed('reduce-opacity', true);
            d3.selectAll('.country-box').classed('reduce-opacity', true);

            d3.select(`.${d.country_code}-box`).classed('reduce-opacity', false);
            d3.select(`.${d.country_code}-map`).classed('reduce-opacity', false);
            
            d3.select('#country-details-container').attr('class', '');
            d3.select('#country-details-container').classed(`${className}-de`,true);
            d3.select('#country-details-container').style('display', 'block');

            onClickCountry(allData, d);                
        } else {
            d3.selectAll('.africa').classed('reduce-opacity', false);
            d3.selectAll('.country-box').classed('reduce-opacity', false);
            
            d3.select('#country-details-container').attr('class', '');
            d3.select('#country-details-container').style('display', 'none');
        }
        
    });
};

const showCountryDetails = (opts) => {
    console.log(opts);
    d3.select('.country-name').text(opts.country_name.toUpperCase());
    if(opts.populationData){
         d3.select('.total-population').text(opts.populationData['2017']);
         d3.select('.population-year').text('(2017)');
    }
    if(opts.doctorsData){
        d3.select('.physicians').text(opts.doctorsData.physicians || '');
        d3.select('.pharmacists').text(opts.doctorsData.pharmacists || ''); 
        if(opts.doctorsData.year_physicians)
            d3.select('.physician-year').text(`(${opts.doctorsData.year_physicians})`);
        if(opts.doctorsData.year_pharmacists)
            d3.select('.pharmacist-year').text(`(${opts.doctorsData.year_pharmacists})`);        
    }
    
    if(opts.energyData) {
        const renew = d3.select('.renewable-energy').selectAll('li')
        .data(opts.energyData, (d, i) => d.country_code + i );
        
        renew.exit().remove();
        
        renew.enter()
        .append('li')
        .text(d => `${d['Project name']} - ${d['Technology']}`);
    }
    
    if(opts.accessData) {
        const access = d3.select('.access-electricity').selectAll('li')
        .data(opts.accessData, (d, i) => d['Country Code'] + i );
        
        access.exit().remove();
        
        access.enter()
        .append('li')
        .text(d => `${d['Indicator Name']}(${d.year}) - ${d['value'].toFixed(2)}`);
    }    
};