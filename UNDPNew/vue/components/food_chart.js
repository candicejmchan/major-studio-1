/* global Vue Vuex _ d3 utils */
Vue.component('food-chart', {
    name: 'foodChart',
    template: `
        <div :class="{'col-6': !(countrySelected === ''), 'col-4': (countrySelected === '')}">
          <top-bar></top-bar>
          <div class="row">
              <div class="col-12">
                  <bubble-chart></bubble-chart>
              </div>
          </div>
          <div class="row">
              <div class="col-12">
                    <vue-slider
                        v-if="countrySelected !== ''"
                        v-model="selectedYear"
                        v-bind="sliderParams"></vue-slider>
              </div>
          </div>
        </div> 
    `,
    data: () => {
        /*  globals constants d3 */
        return {
            countrySelected: '',
            selectedYear: 2015,
            sliderParams: {
              width: '100%',
              tooltip: 'always',
              disabled: false,
              piecewise: true,
              piecewiseLabel: true,
              style: {
                // marginLeft: '10%'
              },
              data: _.range(2000, 2017),
              piecewiseStyle: {
                backgroundColor: '#ccc',
                visibility: 'visible',
                width: '12px',
                height: '12px'
              },
              piecewiseActiveStyle: {
                backgroundColor: '#3498db'
              },
              labelActiveStyle: {
                color: '#3498db'
              }
            }
        }
    },
    watch: {
        getCountry: function (newVal, oldVal) {
             this.countrySelected = newVal;
        },
        getYear: function (newVal, oldVal) {
             this.selectedYear = newVal;
        },
        selectedYear: function(newVal, oldVal) {
            this.$store.dispatch('SELECT YEAR', {
                year: newVal
            });
        }
    },
    computed: {
        ...Vuex.mapGetters(['getCountry', 'getYear'])
    }
});