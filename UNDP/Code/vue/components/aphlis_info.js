/* global Vue Vuex */
Vue.component('aphlis-info', {
    name: 'aphlisInfo',
    template: `
        <div>
            <div v-for="(field, index) in fields" :key="index">
                <h4>{{field.title}}</h4>
                <p>
                    <span>{{field.value}}</span>
                    <span>tonnes</span>
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
            console.log(newVal);
            const format = d3.format('.2f')
            if(newVal) {
                this.fields[0].value = format(newVal['Harvesting/field drying']);
                this.fields[1].value = newVal['Platform drying'];
                this.fields[2].value = newVal['Threshing and Shelling'];
                this.fields[3].value = newVal['Winnowing'];
                this.fields[4].value = newVal['Transport to farm'];
                this.fields[5].value = newVal['Farm storage'];
                this.fields[6].value = newVal['Transport to market'];
                this.fields[7].value = newVal['Market storage'];
            }

        }
    },
    computed: {
        ...Vuex.mapGetters([
            'getAphlisData'
        ])
    },     
});