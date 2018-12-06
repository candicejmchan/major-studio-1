/* global Vue*/
const app = new Vue({
  el: '#vue-app',
  store,
  template: `
      <section>
          <navbar></navbar>

          <div class="container-fluid">
              <div class="row">
                  <country-box :countries="countries"></country-box>
                  <food-chart></food-chart>
                  <maps-chart :countrydata="countryData"></maps-chart>
              </div>
          </div>
      </section>
  `,
  data: () => {
    return {
      countryClicked: '',
      containerClass: 'col-4',
      countryData: {},
      countryCodes: [],
      population: [],
      foodData: [],
      accessEnergyData: [],
      aphlisData: [],
      countries: []
    }
  },
  created () {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      /* global services utils store Vuex*/
      const data = await services.fetchData();
      this.countryData = utils.parseCountryData(data[2]);
      this.countryCodes = utils.getCountryCodes(this.countryData);
      this.countries = utils.getCountries(this.countryData);
      this.population = utils.parsePopulation(data[0], this.countryCodes);
      this.foodData = utils.parseFoodData(data[1], this.population);
      this.accessEnergyData = utils.parseAccessEnergyData(data[3], this.countryCodes);
      this.aphlisData = utils.parseAphlisData(data[4], this.population);

      this.saveData('country_data', this.countryData);
      this.saveData('country_codes', this.countryCodes);
      this.saveData('food_data', this.foodData);
      this.saveData('population', this.population);
      this.saveData('access_energy_data', this.accessEnergyData);
      this.saveData('aphlis_data', this.aphlisData);
      this.saveData('countries', this.countries);

    },
    saveData (type, data) {
      store.dispatch('SAVE DATA', {
        type: type,
        data: data
      });
    }
  }
});
