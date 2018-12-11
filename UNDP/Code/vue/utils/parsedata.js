((win) => {

    const utils = {};

    utils.parseCountryData = (data) => {
        data.objects.countries.geometries = data.objects.countries.geometries
            .filter(d => d.properties.CONTINENT === 'Africa');
        return data;
    };

    utils.getCountryCodes = (countryData) => {
        return _.map(countryData.objects.countries.geometries, d => {
            return d.properties.ADM0_A3;//get countries
        });
    };

    utils.getCountries = (countryData) => {
        return _.map(countryData.objects.countries.geometries, d => {
            const reg = constants.regions.filter(k => k.value.indexOf(d.properties.SUBREGION) !== -1)[0];
            return {
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN,
                region: d.properties.SUBREGION,
                regionNames: reg.value,
                /* global constants */
                className: reg.className
            };
        });
    };

    /* global d3 */
    utils.parsePopulation = (data, countryCodes) => {
        let population = data.map(d => {
            const keys = d3.keys(d);
            const temp = {};
            keys.forEach(key => {
               if(key.match(/\d{4}/)){
                    temp[key] = +d[key];
               } else {
                   if(key) {
                        temp[key] = d[key].trim();
                   }
               }
            });
            return temp;
        });
        population = population.filter(d => countryCodes.indexOf(d['Country Code']) !== -1);
        return population;
    };

    utils.parseFoodData = (data, population) => {
        let foodData = data.map(d => {
          const temp = {
              food_loss: +d['Food Loss (Tonnes)'],
              crop_facilities: +d['Existence of Adequate Crop Storage Facilities'],
              year: +d['Year'],
              country: d['Country'].trim(),
              region: d['Region'].trim()
          };

           //use countries that appear from the filtered population countries
           const country = population.filter(k => k['Country Name'] === temp.country);
           temp.country_code = country.length > 0 ? country[0]['Country Code'] : null;
           return temp;
        });

        //lodash - take the most recent year from all the years
        /* global _ */
        foodData = _.chain(foodData)
            .groupBy('country_code')
            .toPairs()
            .map(d => {
                const lastIndex = d[1].length - 1;
                const sorted = _.sortBy(d[1], ['year']);
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
                } else {
                    temp.crop_facilities = false;
                    temp.year_crop_facilities = sorted[0].year;
                }
                return temp;
            })
            .flatten()
            .value();

        return foodData;
    };

    utils.parseAccessEnergyData = (data, countryCodes) => {

        let accessEnergyData = data.filter(d => {
            return countryCodes.indexOf(d['Country Code']) !== -1 &&
                d['Indicator Code'] === '1.1_ACCESS.ELECTRICITY.TOT';
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

            temp.yeardata = yeardata;
            return temp;
        });
        return accessEnergyData;
    };

    utils.parseAphlisData = (data, population, countries) => {
        const aphlisData = data.map(row => {
           const country = population.filter(k => {
               if(row.country.indexOf('Congo') !== -1 && k['Country Name'].indexOf('Congo') !== -1) {
                   return true;
               } else {
                   return k['Country Name'] === row.country;
               }
           });
           if(country.length > 0){
               row.country_code = country[0]['Country Code'];
               const coun = countries.filter(d => d.country_code === country[0]['Country Code'])[0];
               if(coun){
                    row.region = coun.region;
                    row.className = coun.className;
               }
           }
           return row;
        });
        return aphlisData;
    };

    // used in vue chart_bubble.js
    utils.filterDataByYear = (alphisData, accessEnergyData, selected_year) => {
        const alphis = _.chain(alphisData)
            .filter(d => +d.year === +selected_year)
            .map(d => {
                d.total = 0;
                _.keys(d)
                    .filter(key => ['country_code', 'country', 'className', 'region'].indexOf(key) === -1)
                    .forEach(key => {
                        d.total += d[key];
                    });


                let energy = accessEnergyData.filter(k => {
                    return k['Country Code'] === d.country_code;
                })[0]; /// look here and check the try and catch

                try {
                    const yeardata = energy.yeardata.filter(k => k.year === selected_year)[0];

                    if(energy) {
                        d.access_electricity = yeardata.value;
                    }
                } catch(err) {
                    d.access_electricity = 0;
                }

                return d;
            })
            .value();

        return alphis;
    }

    win.utils = utils;

})(window)
