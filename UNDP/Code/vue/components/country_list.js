/* global Vue Vuex constants store */
Vue.component('country-box', {
    name: 'countryBox',
    template: `
        <div class="col-2">
            <div class="country-box-container">
                <div v-for="(country, index) in countries" :key="index"
                    class="country-box"
                     :class="[country.className, { 'box-not-selected': !(country.country_code === selectedCountryCode) }]"
                     v-on:click="countrySelected(country)"
                     v-on:mouseover="countrySelected(country)"
                     >
                    <div>{{country.country_name}}</div>
                </div>
            </div>
        </div>
    `,
    data: () => {
        return {
            selectedCountryCode: '',
            countries: []
        }
    },
    watch: {
        getYearRegionCountries: function (newVal, oldVal) {
            this.countries = newVal;
        },
        getCountry: function (newVal, oldVal) {
            this.selectedCountryCode = newVal;
        },
    },
    computed: {
          ...Vuex.mapGetters(['getCountry', 'getYearRegionCountries'])
    },
    methods: {
        countrySelected(country) {
            this.$store.dispatch('SELECT COUNTRY', {
                country: country.country_code
            });
        }
    }
});
