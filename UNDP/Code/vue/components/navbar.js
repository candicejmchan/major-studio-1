/* global Vue constants*/
Vue.component('navbar', {
    name: "navbar",
    template: `
        <b-navbar toggleable="md" type="light" variant="light">
          <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
          <b-navbar-brand href="#">{{title}}</b-navbar-brand>
          <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
              <b-nav-item-dropdown text="Region" right>
                <b-dropdown-item v-for="(region, index) in regions" :key="index" v-on:click="regionSelected(region)">{{region.name}}</b-dropdown-item>
              </b-nav-item-dropdown>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
    `,
    data: () => {
        return {
            title: 'Exploring Food Loss and Access to Electricity in Africa',
            selectedRegion: constants.regions[0],
            regions: constants.regions
        }
    },
    methods: {
        regionSelected(region) {
            this.selectedRegion = region;
            this.$store.dispatch('SELECT REGION', {
                region: region.name
            })
        }
    }
});
