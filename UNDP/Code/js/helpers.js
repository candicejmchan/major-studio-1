//Making objects for the different regions- wrote both central and middle africa so either can work
// svg width - 380, col-4
(function(win){

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 580 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// global variables
let svg, countriesSelector, allData, solarInfo;
const countryClicked = {};

const path_big = d3.geoPath()
    .projection(
        d3.geoMercator().scale(430).translate([width - 400, 290])
        // d3.geoMercator().scale(210).translate([width - 200, 180])
    );

const path_small = d3.geoPath()
    .projection(
        // d3.geoMercator().scale(430).translate([width - 400, 290])
        d3.geoMercator().scale(280).translate([width - 450, 230])
    );

//load the population, doctors, energy, countries, and access to energy datasets
const popData = d3.csv('data/population.csv');
const foodData = d3.json('data/fooddata.json');
const countries = d3.json('data/countries.json');
const accessEnergy = d3.csv('data/SE4ALLData.1.csv');
const aphlisData = d3.json('data/data_2000.json');

Promise.all([popData, foodData, countries, accessEnergy, aphlisData ])
.then( result => {
    const data = parseData(result);
    console.log(data);
    allData = data;
    win.allData = allData;
    initChart();
    createDropdown(regions);
    drawMap(data);
    selectRegionCountries(regions[0]);
});

const createDropdown = (data) => {
    d3.select('#region-menu').selectAll('.dropdown-item')
    .data(data).enter()
    .append('a')
    .attr('class', 'dropdown-item')
    .text( d => d.name)
    .on('click', d => {
       d3.select('#selected-region').text(d.name);
       selectRegionCountries(d);
    });
};

const initChart = () => {
    svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

};

//create and draw the map
const drawMap = (data) => {
    const countryData =  data.countryData;

    countriesSelector = svg.append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(topojson.feature(countryData, countryData.objects.countries).features)
        .enter().append('path')
        .attr('class', 'africa')
        // .attr('d', path_big)
        .on('click', function(d){
            const obj = {
                region: d.properties.SUBREGION,
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN
            };

            const className = regions.filter(k => k.value.indexOf(obj.region) !== -1)[0].className;

            const classNames = _.map(regions, 'className');

            classNames.forEach(cls => {
                d3.selectAll('.country-box').classed(`${cls}-bk`, false);
            });

            countryClicked[obj.country_code] = !countryClicked[obj.country_code];
            if(countryClicked[obj.country_code]) {
                d3.selectAll('.africa').classed('reduce-opacity', true);
                d3.selectAll('.country-box').classed('reduce-opacity', true);
                d3.select(`.${obj.country_code}-box`).classed('reduce-opacity', false);
                d3.select(this).classed('reduce-opacity', false);

                d3.select('#country-details-container').attr('class', '');
                // d3.select('#country-details-container').classed(`${className}-de`,true);
                d3.select('#country-details-container').style('display', 'block');

                // highlight the box
                d3.select(`.${obj.country_code}-box`).classed(`${className}-bk`, true);

                setMapSize('small', d.country_code);
                createSolarInfoBelowSmallMap(className);

                win.country_code = d.country_code;

                onClickCountry(data, obj);
            } else {
                d3.selectAll('.africa').classed('reduce-opacity', false);
                d3.selectAll('.country-box').classed('reduce-opacity', false);
                d3.select('#country-details-container').attr('class', '');
                d3.select('#country-details-container').style('display', 'none');

                d3.select(`.${d.country_code}-box`).classed(`${className}-bk`, false);

                setMapSize('big');
            }
        });

    setMapSize('big');

    /*const countryBorders = svg.append('path')
        .attr('class', 'country-borders')
        .attr('d', path(topojson.mesh(countryData, countryData.objects.countries, (a, b) => a !== b )));

    countryBorders.attr('d', path_small(
        topojson.mesh(countryData, countryData.objects.countries, (a, b) => a !== b )
    ));*/
};

const setMapSize = (mapSize, country_code) => {
    switch (mapSize) {
        case 'big':
            countriesSelector.attr('d', path_big);
            removeSolarInfoBelowSmallMap();
            adjustContainerSizes('big');
            bubble.removeBubbleChart();
            break;
        case 'small':
            countriesSelector.attr('d', path_small);
            adjustContainerSizes('small');
            bubble.removeBubbleChart();
            bubble.createBubbleChart(allData.aphlisData, allData.accessEnergyData, country_code);
            break;
        default:
            countriesSelector.attr('d', path_big);
            removeSolarInfoBelowSmallMap();
            break;
    }
}

const adjustContainerSizes = (mapSize) => {
    if(mapSize === 'big') {
        d3.select('#chart').style('border', 'hidden');
        d3.select('#chart svg').attr('width', width + margin.left + margin.right);
        d3.select('.chart-container')
            .classed('col-6', true)
            .classed('col-4', false);
        d3.select('.details-container')
            .classed('col-4', true)
            .classed('col-6', false);
    } else {
        d3.select('#chart').style('border-left', '1px dashed #737373');
        d3.select('#chart svg').attr('width', 380);
        d3.select('.chart-container')
            .classed('col-6', false)
            .classed('col-4', true);
        d3.select('.details-container')
            .classed('col-4', false)
            .classed('col-6', true);
    }
}

const removeSolarInfoBelowSmallMap = () => {
    d3.select('.solar-info-container').remove();
};

const createSolarInfoBelowSmallMap = (className) => {
    const elements = [
        { title: 'PV', unit: 'TWh/year', value: '-', id: 'solar-pv', x: 0, y: 0 },
        { title: 'CSP', unit: 'TWh/year', value: '-', id: 'solar-csp', x: 150, y: 0 }
    ];

    d3.select('.solar-info-container').remove();

    d3.selectAll('.separator').attr('class', `separator ${className}-sep`);

    solarInfo = svg.append('g')
        .attr('class', 'solar-info-container')
        .attr('transform', `translate(${width - 450}, ${230 + 200 + 50})`)
        .selectAll('.solar-info')
        .data(elements).enter()
        .append('g')
        .attr('class', 'solar-info')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    solarInfo.append('text')
    .attr('class', d => `${d.id}-title solar-title`)
    .classed(className, true)
    .text(d => d.title);

    solarInfo.append('text')
    .attr('class', d => `${d.id}-value solar-value`)
    .attr('y',  30)
    .text(d => d.value);

    solarInfo.append('text')
    .attr('class', d => `${d.id}-unit solar-unit`)
    .attr('y',  60)
    .text(d => d.unit);

}

//when you click on a specific country, the data below that corresponds to that country is attached
const onClickCountry = (data, d) => {
    const population = data.population;
    const foodData = data.foodData;
    const energyData = data.energyData;
    const accessEnergyData =  data.accessEnergyData;

    const pop = population.filter(k => k['Country Code'] === d.country_code)[0];
    const food = foodData.filter(k => k.country_code === d.country_code)[0];
    const access = accessEnergyData.filter(k => k['Country Code'] === d.country_code);

    showCountryDetails({
        region: d.region,
        country_code: d.country_code,
        country_name: d.country_name,
        populationData: pop,
        foodData: food,
        accessData: access
    });
};

// for each country add/ remove region colors
const selectRegionCountries = (region) => {
    let coun = [];
    countriesSelector
    .attr('class', d => {
        const reg = d.properties.SUBREGION;
        if(region.value[0]  === 'All') {
            coun.push({
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN,
                region: d.properties.SUBREGION,
                className: region.className
            });
            const row = regions.filter(k => k.value.indexOf(reg) !== -1)[0];
            return `africa ${row.className} ${d.properties.ADM0_A3}-map`;
        } else if(region.value.indexOf(reg) !== -1){
            coun.push({
                country_code: d.properties.ADM0_A3,
                country_name: d.properties.NAME_EN,
                region: d.properties.SUBREGION,
                className: region.className
            });
            return `africa ${region.className} ${d.properties.ADM0_A3}-map`;
        } else {
            return `africa ${regions[0].className} ${d.properties.ADM0_A3}-map`;
        }
    });

    //sorting the order for foodloss and population and alphabetical
    //coun = sortCountries(coun, 'foodLoss', false);
    coun = _.sortBy(coun, d => d.country_name);
    // coun =  _.sortBy(coun, d => d.food_loss);

    createCountryBoxes(coun);
};

const sortCountries = (countriesData, sortKind='alphabetical', ascending=true) => {
    let sorted;
    if(sortKind === "alphabetical") {
        sorted = _.sortBy(countriesData, d => d.country_name.toLowerCase());
        if(!ascending){
            sorted = sorted.reverse();
        }
    } else if(sortKind === 'foodLoss'){
        sorted = _.chain(countriesData)
        .map(d => {
            const food = allData.foodData.filter(k => k.country_code === d.country_code)[0];
            try {
                d.food_loss = food.food_loss || 0;
            } catch(err) {
                d.food_loss = 0;
                console.log(d);
            }
            return d;
        })
        .sortBy(d => d.food_loss)
        .value();

        if(!ascending){
            sorted = sorted.reverse();
        }
    } else if (sortKind === 'population') {

        sorted = _.chain(countriesData)
        .map(d => {
            const pop = allData.population.filter(k => k['Country Code'] === d.country_code)[0];
            try {
                d.population = pop['2017'] || 0;
            } catch(err) {
                d.population = 0;
                console.log(d);
            }
            return d;
        })
        .sortBy(d => d.population)
        .value();

        if(!ascending){
            sorted = sorted.reverse();
        }
    }

    return sorted;
}

const createCountryBoxes = (data) => {

    const countryBox = d3.select('#country-box-container')
    .selectAll('.country-box')
    .data(data, d => d.country_code);

    countryBox.exit().remove();

    countryBox.enter()
    .append('div')
    .attr('class', d => {
        return `country-box ${d.country_code}-box`;
        // const row = regions.filter(k => k.value.indexOf(d.region) !== -1)[0];
        // return `country-box ${d.country_code}-box ${row.className}-bk`
    })
    .append('div')
    .text(d => d.country_name)
    .on('click', function(d) {
        // console.log(d3.event.x, d3.event.y);
        // d3.select('#country-details-container').style('top', `${d3.event.y}px`);

        // d3.selectAll('.country-box').attr('class', `country-box ${d.country_code}-box`);

        const className = regions.filter(k => k.value.indexOf(d.region) !== -1)[0].className;

        const classNames = _.map(regions, 'className');

        classNames.forEach(cls => {
            d3.selectAll('.country-box').classed(`${cls}-bk`, false);
        });

        countryClicked[d.country_code] = !countryClicked[d.country_code];
        if(countryClicked[d.country_code]) {
            d3.selectAll('.africa').classed('reduce-opacity', true);
            d3.selectAll('.country-box').classed('reduce-opacity', true);

            d3.select(`.${d.country_code}-box`).classed('reduce-opacity', false);
            d3.select(`.${d.country_code}-map`).classed('reduce-opacity', false);

            d3.select('#country-details-container').attr('class', '');
            // d3.select('#country-details-container').classed(`${className}-de`,true);
            d3.select('#country-details-container').style('display', 'block');

            d3.select(`.${d.country_code}-box`).classed(`${className}-bk`, true);

            setMapSize('small', d.country_code);
            createSolarInfoBelowSmallMap(className);

            win.country_code = d.country_code;

            onClickCountry(allData, d);
        } else {
            d3.selectAll('.africa').classed('reduce-opacity', false);
            d3.selectAll('.country-box').classed('reduce-opacity', false);

            d3.select('#country-details-container').attr('class', '');
            d3.select('#country-details-container').style('display', 'none');

            d3.select(`.${d.country_code}-box`).classed(`${className}-bk`, false);

            setMapSize('big');
        }

    });
};

const showCountryDetails = (opts) => {
    console.log(opts);

    const format = d3.format(',');
    const formatPct = d3.format('.2%');

    d3.select('.country-name').text(opts.country_name.toUpperCase());
    if(opts.populationData){
         d3.select('.total-population').text( format(opts.populationData[SELECTED_YEAR]));
         d3.select('.population-year').text(`(${SELECTED_YEAR})`);
    }
    if(opts.foodData){
        //if(opts.foodData.food_loss) {
    //         d3.select('.food-loss').text(opts.foodData.food_loss.toFixed(2));
    //     } else {
    //         d3.select('.food-loss').text(opts.foodData.food_loss || '-');
    //     }

       // d3.select('.crop-facilities').text(opts.foodData.crop_facilities || '');
        // if(opts.foodData.year_food_loss)
        //     d3.select('.food-loss-year').text(`(${opts.foodData.year_food_loss})`);
        // else
        //     d3.select('.food-loss-year').text('');

        if(opts.foodData.year_crop_facilities)
            d3.select('.crop-facilities').text('Yes');
        else
            d3.select('.crop-facilities').text('-');
    }


    /*if(opts.energyData) {
        const renew = d3.select('.renewable-energy').selectAll('li')
        .data(opts.energyData, (d, i) => d.country_code + i );

        renew.exit().remove();

        renew.enter()
        .append('li')
        .text(d => `${d['Project name']} - ${d['Technology']}`);
    }*/

    if(opts.accessData) {
        // console.log(opts.accessData);
        /*const access = d3.select('.access-electricity').selectAll('li')
        .data(opts.accessData, (d, i) => d['Country Code'] + i );

        access.exit().remove();

        access.enter()
        .append('li')
        .text(d => `${d['Indicator Name']}(${d.year}) - ${d['value'].toFixed(2)}`);*/
        if( opts.accessData[1]['value']){
            d3.select('.access-electricity').text(`${ formatPct( opts.accessData[1]['value'] / 100)}`);
        }
    }
};

return win;

})(window);
