/* global Vue Vuex _ d3 utils */
Vue.component('top-bar', {
    name: 'topBar',
    template: `
        <div :class="['row', {'hide-component': countrySelected === ''}]">
            <div class="col-4">
                <p class="total-population">{{totalPopulation}}</p>
                <p class="population-title">
                    <span>{{populationTitle}}</span>
                    <span class="population-year">{{populationYear}}</span>
                </p>
            </div>
            <div class="col-1">
                <div class="separator"></div>
            </div>     
            <div class="col-3">
                <div class="float-right">
                    <p class="crop-facilities">{{cropValue}}</p>
                    <p class="crop-facilities-title">
                        <span>{{cropTitle}}</span>
                    </p>
                </div>
            </div>
        </div>
    `,
    data: () => {
        /*  globals constants d3 */
        return {
            cropTitle: 'Adequate Crop Storage Facilities',
            populationTitle: 'Population',
            cropValue: '',
            populationYear: '',
            totalPopulation: '',
            countrySelected: ''
        }
    },
    watch: {
        getCountry: function (newVal, oldVal) {
             this.countrySelected = newVal;
        },        
        getYear: function (newVal, oldVal) {
             this.populationYear = newVal;
        },
        getPopulationYearData: function (newVal, oldVal) {
            this.totalPopulation = newVal.population;
            this.populationYear = newVal.year;
        },
        getCropValue: function (newVal, oldVal) {
             this.cropValue = newVal ? 'Yes' : 'No';
        },        
    },
    computed: {
        ...Vuex.mapGetters(['getYear', 'getPopulationYearData', 'getCropValue', 'getCountry'])
    },
});