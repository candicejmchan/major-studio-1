const SELECT_REGION = 'SELECT REGION';
const SELECT_COUNTRY = 'SELECT COUNTRY';
const SELECT_YEAR = 'SELECT YEAR';
const SAVE_DATA = 'SAVE DATA';

/* global Vuex _ utils d3 _ constants */
const store = new Vuex.Store({
    state: {
        region: 'All',
        country: '',
        year: 2000,
        countryData: {},
        countryCodes: [],
        population: [],
        foodData: [],
        accessEnergyData: [],
        aphlisData: [],
        countries: []
    },
    getters: {
      getRegion: state => state.region,
      getRegionClassName: state => {
          const temp = state.countries.filter(d => d.country_code === state.country)[0];
          if(temp){
            return temp.className;
          } else {
              return '';
          }
      },
      getCountry: state => state.country,
      getYear: state => state.year,
      getAphlisData: state => _.filter(
          state.aphlisData,
          d => d.country_code === state.country && d.year === state.year
      )[0],
      getCountryCodes: state => state.countryCodes,
      getYearData: state => utils.filterDataByYear(state.aphlisData, state.accessEnergyData, state.year),
      getPopulationYearData: state => {
        const pop = _.filter(state.population, d => {
            return d['Country Code'] === state.country;
        })[0];

        const format = d3.format(',');
        let popvalue;

        if(pop) {
            popvalue =  format(pop[state.year]);
        } else {
            popvalue = '-';
        }

        return {
            population: popvalue,
            year: state.year
        };
      },
      getCropValue: state => {
          const food = state.foodData.filter(d => d.country_code === state.country)[0];
          if(food){
              return food['crop_facilities'];
          } else {
              return false;
          }
      },
      getRegionCountries: state => {
          return _.chain(state.countries)
          .filter(d => {
              return d.regionNames.indexOf(state.region) !== -1 || state.region === 'All';
          })
          .sortBy(d => d.country_name)
          .value()
      },
      getYearRegionCountries: state => {
          const yeardata = utils.filterDataByYear(state.aphlisData, state.accessEnergyData, state.year);
          return _.chain(state.countries)
          .filter(d => {
              return d.regionNames.indexOf(state.region) !== -1 || state.region === 'All';
          })
          .filter(d => {
              return _.find(yeardata, k => k.country_code === d.country_code);
          })
          .sortBy(d => d.country_name)
          .value()
      }
    },
    mutations: {
        [SAVE_DATA] (state, payload) {
            switch(payload.type) {
                case('country_data'):
                    state.countryData = payload.data;
                    break;
		        case('country_codes'):
                    state.countryCodes = payload.data;
                    break;
		        case('food_data'):
                    state.foodData = payload.data;
                    break;
		        case('population'):
                    state.population = payload.data;
                    break;
		        case('access_energy_data'):
                    state.accessEnergyData = payload.data;
                    break;
		        case('aphlis_data'):
                    state.aphlisData = payload.data;
                    break;
		        case('countries'):
		            state.countries = payload.data;
		            break;
                default:
                    break;
            }
        },
        [SELECT_REGION] (state, payload) {
            state.region = payload.region;
        },
        [SELECT_COUNTRY] (state, payload) {
            state.country = payload.country;
        },
        [SELECT_YEAR] (state, payload) {
            state.year = payload.year;
        }
    },
    actions: {
        [SAVE_DATA] (context, payload) {
            context.commit(SAVE_DATA, payload);
        },
        [SELECT_REGION] (context, payload) {
            context.commit(SELECT_REGION, payload);
        },
        [SELECT_COUNTRY] (context, payload) {
            context.commit(SELECT_COUNTRY, payload);
        },
        [SELECT_YEAR] (context, payload) {
            context.commit(SELECT_YEAR, payload);
        }
    }
});
