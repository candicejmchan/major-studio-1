(win => {
    const constants = {};

    constants.regions = [
        {name : 'All', value : ['All'], className: 'africa'},
        {name : 'Central Africa', value : ['Central Africa', 'Middle Africa'], className: 'central-africa'},
        {name : 'West Africa', value : ['West Africa', 'Western Africa'], className: 'western-africa'},
        {name : 'East Africa', value : ['East Africa', 'Eastern Africa'], className: 'eastern-africa'},
        {name : 'Southern Africa', value : ['Southern Africa'], className: 'southern-africa'},
        {name : 'North Africa', value : ['North Africa', 'Northern Africa'], className: 'northern-africa'}
    ];

    /* global _*/
    constants.years = _.range(2016, 1999, -1);

    const marginC = { top: 20, right: 20, bottom: 30, left: 40 };
    constants.map = {
        width: 580 - marginC.left - marginC.right,
        height: 600 - marginC.top - marginC.bottom,
        height_medium: 450 - marginC.top - marginC.bottom,
        height_small: 250 - marginC.top - marginC.bottom,
        margin: marginC
    };

    const marginB = { top: 40, right: 20, bottom: 50, left: 65 };
    constants.bubble = {
        width: 600 - marginB.left - marginB.right,
        height: 430 - marginB.top - marginB.bottom,
        margin: marginB
    };

    win.constants = constants;

})(window);
