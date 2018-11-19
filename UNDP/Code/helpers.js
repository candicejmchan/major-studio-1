const regions = [
    {name : 'All', value : ['All'], className: 'africa'},
    {name : 'Central Africa', value : ['Central Africa', 'Middle Africa'], className: 'central-africa'},
    {name : 'West Africa', value : ['West Africa', 'Western Africa'], className: 'western-africa'},
    {name : 'East Africa', value : ['East Africa', 'Eastern Africa'], className: 'eastern-africa'},
    {name : 'Southern Africa', value : ['Southern Africa'], className: 'southern-africa'},
    {name : 'North Africa', value : ['North Africa', 'Northern Africa'], className: 'northern-africa'}
];

const years = _.range(2016, 2009, -1);

let SELECTED_YEAR = 2011;
d3.select('.selected-year-value').text(SELECTED_YEAR);

//write the indicator codes for the
const indicators = [
    { name: '1.2_ACCESS.ELECTRICITY.RURAL', title: 'RURAL', position: 0 },
    { name: '1.1_ACCESS.ELECTRICITY.TOT', title: 'TOTAL', position: 2 },
    { name: '1.3_ACCESS.ELECTRICITY.URBAN', title: 'URBAN', position: 1 },
];

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
          food_loss: +d['Food Loss (Tonnes)'],
          crop_facilities: +d['Existence of Adequate Crop Storage Facilities'],
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
    foodData = _.chain(foodData)
    .groupBy('country_code')
    .toPairs()
    .map(d => {
        const lastIndex = d[1].length - 1;
        const sorted = _.sortBy(d[1], ['year']);// [lastIndex];
        const temp = {
            country: sorted[0].country,
            country_code: sorted[0].country_code,
            region: sorted[0].region
        };
        if(sorted[0].food_loss){
            temp.food_loss = sorted[0].food_loss;
            temp.year_food_loss = sorted[0].year;
        }
        if(sorted[0].crop_facilities){
            temp.crop_facilities = sorted[0].crop_facilities === 1 ? true : false;
            temp.year_crop_facilities = sorted[0].year;
        }
        // let food_loss = false;
        // let crop_facilities = false;
        // for(let i=lastIndex; i >= 0; i--){
        //     if(sorted[i].food_loss && !food_loss){
        //         temp.food_loss = sorted[i].food_loss;
        //         temp.year_food_loss = sorted[i].year;
        //         food_loss = true;
        //     }
        //     if(sorted[i].crop_facilities && !crop_facilities){
        //         temp.crop_facilities = sorted[i].crop_facilities;
        //         temp.year_crop_facilities = sorted[i].year;
        //         crop_facilities = true;
        //     }
        // }
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
       // yeardata = _.sortBy(yeardata, ['year'])[yeardata.length - 1];
        /*if(yeardata){
            temp.year = yeardata.year;
            temp.value = yeardata.value;
        }*/
        temp.yeardata = yeardata;
       return temp;
    });

    const aphlisData = data[5].map(row => {
       const country = population.filter(k => {
           if(row.country.indexOf('Congo') !== -1 && k['Country Name'].indexOf('Congo') !== -1) {
               return true;
           } else {
               return k['Country Name'] === row.country;
           }
       });
       if(country.length > 0){
           row.country_code = country[0]['Country Code'];
       }
       return row;
    });

    population = population.filter(d => countryCodes.indexOf(d['Country Code']) !== -1);

    return {
        population: population,
        foodData: foodData,
        energyData: energyData,
        countryData: countryData,
        accessEnergyData:  accessEnergyData,
        aphlisData: aphlisData
    };
};

const createYearDropdown = () => {
    d3.select('#year-menu')
        .selectAll('a')
        .data(years).enter()
        .append('a')
        .attr('class', 'dropdown-item')
        .text(String)
        .on('click', d => {
           d3.select('.selected-year-value').text(d);
           SELECTED_YEAR = d;
           bubble.removeBubbleChart();
           bubble.createBubbleChart(window.allData.aphlisData, window.allData.accessEnergyData, window.country_code);
        });

};

createYearDropdown();
