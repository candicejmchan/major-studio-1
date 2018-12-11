/* global Vue Vuex _ d3 utils */
Vue.component('bubble-chart', {
    name: 'bubbleChart',
    template: `
        <div :class="['bubble-chart', {'hide-component': country_code === ''}]" ref="chart"></div>
    `,
    data: () => {
        /*  globals constants d3 */
        return {
            selected_year: '',
            country_code: '',
            yearData: [],
            /* d3 constants */
            element: '',
            margin: constants.bubble.margin,
            width: constants.bubble.width,
            height: constants.bubble.height,
            svg: '',
            xscale: d3.scaleLinear().range([0, constants.bubble.width]),
            yscale: d3.scaleLinear().range([constants.bubble.height, 0]),
            rscale: d3.scaleLinear().range([5, 15]),
            colorScale: d3.scaleLinear().range(['#2A373D','#FAFAFA']),
            xAxis: '',
            yAxis: ''
        }
    },
    watch: {
        getYear: function (newVal, oldVal) {
             this.selected_year = newVal;
             this.launchChart();
        },
        getYearData: function (newVal, oldVal) {
            this.yearData = newVal;
            this.launchChart();
        },
        getCountry: function (newVal, oldVal) {
            this.country_code = newVal;
            this.launchChart();
        },
    },
    computed: {
        ...Vuex.mapGetters(['getCountry', 'getYearData', 'getYear'])
    },
    mounted () {
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

            this.xAxis = d3.axisBottom(this.xscale);
            this.yAxis = d3.axisLeft(this.yscale).tickFormat(d => `${d/1000}k`);
        },
        setupData () {
            const yearData = this.yearData;

            this.xscale.domain(d3.extent(yearData, d => d.access_electricity));
            this.yscale.domain(d3.extent(yearData, d => d.total));
            this.rscale.domain(d3.extent(yearData, d => d.total));
            this.colorScale.domain(d3.extent(yearData, d => d['Harvesting/field drying']));
        },
        launchChart () {
            this.setupData();
            this.drawChart ();
            this.drawAxes();
        },
        drawChart () {
            const data = this.yearData;
            const country_code = this.country_code;

            this.svg.select('.bubbles').remove();

            const bubbles = this.svg.append('g').attr('class', 'bubbles');

            const grpData = bubbles.selectAll('.bubble')
                            .data(data);

            grpData.exit().remove();

            const grp = grpData.enter()
                .append('g').attr('class', 'bubble')
                .attr('transform', d => {
                    return `translate(${this.xscale(d.access_electricity)}, ${this.yscale(d.total)})`;
                });

            grp.append('circle')
                .attr('r', d => this.rscale(d.total))
                /*.style('fill', d => {
                    return '#fff';
                    // return this.colorScale(d['Harvesting/field drying']);
                })*/
                .attr('class', d => {
                    if(d.country_code === country_code){
                        return `${d.className}-svg`;
                    } else {
                        return 'circle'
                    }
                })

            grp.filter(d => d.country_code === country_code)
                .append('circle')
                .attr('r', d => this.rscale(d.total) + 4)
                .style('fill', 'transparent')
                .style('stroke', '#ffffff');

            const countryExists = _.find(data, d => d.country_code === country_code);

            if(!countryExists) {
                bubbles.append('text')
                    .attr('x', 20)
                    .attr('y', 20)
                    .style('fill', '#737373')
                    .text('No data for this country this year');
            }
        },
        drawAxes () {
            this.svg.select('.axes').remove();

            const axes = this.svg.append('g').attr('class', 'axes');

            axes.append('g')
                .attr('transform', `translate(0, ${this.height})`)
                .call(this.xAxis);

            this.svg.append('text')
                .attr('class', 'axis-label')
              .attr('y', this.height + this.margin.bottom * 0.75)
              .attr('x', this.width / 2)
              .style('text-anchor', 'middle')
              .style('fill', '#ffff')
              .text('Total Access to Electricity (% of Population)');

            axes.append('g').call(this.yAxis);

            // text label for the y axis
            this.svg.append('text')
                    .attr('class', 'axis-label')
                  .attr('transform', 'rotate(-90)')
                  .attr('y', 3 - this.margin.left)
                  .attr('x',2 - (this.height / 2))
                  .attr('dy', '0.7em')
                  .style('text-anchor', 'middle')
                  .style('fill', '#ffff')
                  .text('Total Food Loss in Value Chain (t)');
        }
    }
});
