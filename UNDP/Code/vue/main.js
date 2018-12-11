/* global Vue*/
const app = new Vue({
  el: '#vue-app',
  store,
  template: `
    <div>
      <section class="container-fluid first-page" v-if="!showChart">
        <div class="row justify-content-center">
          <div class="col-8">
            <h2>Exploring Food Loss and Access to Electricity in Africa</h2>
            <p class="paragraph">Post-harvest food loss, defined as a reduction in quantity and quality of food between the farm and the point of sale, is one of the main factors of food insecurity and hunger across Africa. This project explores the relationship between electricity access and post-harvest food loss of one major crop, Maize, in order to highlight areas within the food supply chain that need the greatest improvements.</p>


            <h4 class="answer" v-on:click="showChartFn()">Explore</h4>
          </div>
        </div>
      </section>
      <section v-if="showChart">
          <navbar></navbar>

          <div class="container-fluid">
              <div class="row">
                  <country-box :countries="countries"></country-box>
                  <food-chart></food-chart>
                  <maps-chart :countrydata="countryData"></maps-chart>
              </div>

              <footer class="row">
                <div class="col-12" style="padding: 20px">
                    <i class="fas fa-info" v-on:click="showInfo = !showInfo"></i>
                    <div v-if="showInfo">
                      <p>source: <a href="https://www.aphlis.net">Aphlis </a></p>
                      <p>1."Postharest Loss Estimates – Dry Weight Loss." Böck, Rudolf, and Frank Sonntag.African Postharvest Losses Information System, 2017.</p>
                      <p>source: <a href="https://data.worldbank.org/indicator/SP.POP.TOTL">The World Bank </a></p>
                      <p> 2. "Population, Total."World Bank, 2017.</p>

                       <p>source: <a href="http://apps.who.int/iris/bitstream/handle/10665/204717/9789241565233_eng.pdf?sequence=1">Sustainable Energy for All(SEforALL)</a></p>
                      <p> 3."Access to electricity (% of population with access)". World Bank, Sustainable Energy for All (SE4ALL) Database from The World Bank Data Catalog.</p>

                    <p>source: <a href="http://dataportal.opendataforafrica.org/hjennw/global-food-security-index-2015">African Information Highway </a></p>
                    <p> 4."Global Food Security Index, 2015". African Development Bank Group, African Information Highway.</p>
                    </div>
                </div>
              </footer>

          </div>

      </section>
    </div>
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
      countries: [],
      showChart: false,
      showInfo: false
    }
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
      this.aphlisData = utils.parseAphlisData(data[4], this.population, this.countries);

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
    },
    showChartFn () {
      this.showChart = !this.showChart;
      this.fetchData();
    }
  }
});
