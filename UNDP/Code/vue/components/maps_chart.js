/* global Vue constants d3 Vuex _ topojson */
Vue.component('maps-chart', {
    name: 'mapsChart',
    template: `
        <div :class="['chart-container', {'col-4': !(selectedCountryCode === ''), 'col-6': (selectedCountryCode === '')}]">
            <div class="row">
                <div class="col-12">
                    <div class="map-chart" ref="chart"></div>
                </div>
            </div>
            <div class="row" v-if="selectedCountryCode !== ''">
                <div class="col-12">
                    <aphlis-info></aphlis-info>
                </div>
            </div>
        </div>
    `,
    props: {
        countrydata: Object
    },
    data: () => {
        return {
            countries: [],
            selectedCountryCode: '',
            /* d3 constants */
            element: '',
            margin: constants.map.margin,
            width: constants.map.width,
            height: constants.map.height,
            height_medium: constants.map.height_medium,
            height_small: constants.map.height_small,
            svg: '',
            countriesSelector: '',
            path_big: d3.geoPath().projection(
                d3.geoMercator().scale(430).translate([constants.map.width - 400, 290])
            ),
            path_medium: d3.geoPath().projection(
                d3.geoMercator().scale(280).translate([constants.map.width - 450, 230])
            ),
            path_small: d3.geoPath().projection(
                // d3.geoMercator().scale(280).translate([constants.map.width - 450, 230])
                d3.geoMercator().scale(170).translate([constants.map.width - 450, 100])
            )
        }
    },
    watch: {
        countrydata: function (newVal, oldVal) {
            this.drawChart(newVal);
            this.changeMapSize();
        },
        getCountry: function (newVal, oldVal) {
            this.selectedCountryCode = newVal;
            this.countriesSelector.attr('class', this.getRegionClass);
            this.changeMapSize();
        },
        getRegionCountries: function (newVal, oldVal) {
            this.countries = newVal;
            this.countriesSelector.attr('class', this.getRegionClass);
            this.changeMapSize();
        },
    },
    computed: {
        ...Vuex.mapGetters([
            'getCountry',
            'getCountryCodes',
            'getRegionCountries'
        ])
    },
    mounted() {
        this.element = this.$refs.chart;
        this.initChart();
    },
    methods: {
        initChart () {
            this.svg = d3.select(this.element)
                .append('svg')
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .append('g')
                .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        },
        drawChart(countrydata) {
            const topoData = topojson.feature(countrydata, countrydata.objects.countries).features;

            this.countriesSelector = this.svg.append('g')
                .attr('class', 'countries')
                .selectAll('path')
                .data(topoData)
                .enter().append('path')
                .attr('class', this.getRegionClass)
                .on('click', d => {
                    const country_code = d.properties.ADM0_A3;
                    if(this.selectedCountryCode === country_code) {
                        this.$store.dispatch('SELECT COUNTRY', {
                            country: ''
                        });
                    } else {
                        this.$store.dispatch('SELECT COUNTRY', {
                            country: country_code
                        });
                    }
                });
        },
        setMapSize(mapSize) {
            switch (mapSize) {
                case 'big':
                    d3.select(this.element).select('svg')
                        .attr('height', this.height + this.margin.top + this.margin.bottom);
                    this.countriesSelector.attr('d', this.path_big);
                    break;
                case 'medium':
                    d3.select(this.element).select('svg')
                        .attr('height', this.height_medium + this.margin.top + this.margin.bottom);
                    this.countriesSelector.attr('d', this.path_medium);
                    break;
                case 'small':
                    d3.select(this.element).select('svg')
                        .attr('height', this.height_small + this.margin.top + this.margin.bottom);
                    this.countriesSelector.attr('d', this.path_small);
                    break;
                default:
                    this.countriesSelector.attr('d', this.path_big);
                    break;
            }
        },
        changeMapSize() {
            if(!this.selectedCountryCode) {
                this.setMapSize('big');
            } else {
                this.setMapSize('small');
            }
        },
        getRegionClass(d) {
            const reg = d.properties.SUBREGION;
            const country_code = d.properties.ADM0_A3;
            const country_codes = _.map(this.countries, 'country_code');
            const className = constants.regions.filter(k => k.value.indexOf(reg) !== -1)[0].className;
            if(!this.selectedCountryCode){
                if(country_codes.indexOf(country_code) !== -1){
                    return `africa ${className}-svg ${country_code}-map`;
                } else {
                    return `africa ${country_code}-map`;
                }
            } else {
                if(country_code === this.selectedCountryCode) {
                    return `africa ${className}-svg ${country_code}-map`;
                } else {
                    return `africa reduce-opacity ${className}-svg ${country_code}-map`;
                }
            }
        }
    }
});
