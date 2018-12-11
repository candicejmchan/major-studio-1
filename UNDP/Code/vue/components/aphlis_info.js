/* global Vue Vuex d3 */
Vue.component('aphlis-info', {
    name: 'aphlisInfo',
    template: `
        <div class="aphlis-info">
            <div v-for="(field, index) in fields" :key="index">
                <h4 class="header">{{field.title}}</h4>
                <p>
                    <span class="value">{{field.value}}</span>
                    <span class="unit">tonnes</span>
                </p>
            </div>
        </div>
    `,
    data: () => {
        return {
            fields: [
                { title: 'Harvesting/Fielding Drying', value: 0 },
                { title: 'Platform Drying', value: 0 },
                { title: 'Threshing and Shelling', value: 0 },
                { title: 'Winnowing', value: 0 },
                { title: 'Transport to Farm', value: 0 },
                { title: 'Farm Storage', value: 0 },
                { title: 'Transport to Market', value: 0 },
                { title: 'Market Storage', value: 0 },
            ]
        };
    },
    watch: {
        getAphlisData: function (newVal, oldVal) {
            const format = d3.format('.0f')
            if(newVal) {
                this.fields[0].value = format(newVal['Harvesting/field drying']);
                this.fields[1].value = format(newVal['Platform drying']);
                this.fields[2].value = format(newVal['Threshing and Shelling']);
                this.fields[3].value = format(newVal['Winnowing']);
                this.fields[4].value = format(newVal['Transport to farm']);
                this.fields[5].value = format(newVal['Farm storage']);
                this.fields[6].value = format(newVal['Transport to market']);
                this.fields[7].value = format(newVal['Market storage']);
            }

        }
    },
    computed: {
        ...Vuex.mapGetters([
            'getAphlisData'
        ])
    },
});
