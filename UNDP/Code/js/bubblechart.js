(function(win){
    let svg;
    const margin = { top: 40, right: 20, bottom: 50, left: 65 };
    const width = 540 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const xscale = d3.scaleLinear()
        .range([0, width]);



    const yscale = d3.scaleLinear()
        .range([height, 0]);


    const rscale = d3.scaleLinear()
        .range([5, 15]);

    const colorScale = d3.scaleLinear()
        //.range(['#ffffcc', '#fc4e2a'])
        .range(['#2A373D','#FAFAFA'])

    const xAxis = d3.axisBottom(xscale);
    const yAxis = d3.axisLeft(yscale)
        .tickFormat(d => {
            return `${d/1000}k`;
        })

    const createBubbleChart = (alphisData, accessEnergyData, country_code) => {
        initChart();
        // const countryData = filterDataByCountry(data, country_code);
        const yearData = filterDataByYear(alphisData, accessEnergyData, SELECTED_YEAR);

        // console.log(yearData);

        xscale.domain(d3.extent(yearData, d => d.access_electricity));
        yscale.domain(d3.extent(yearData, d => d.total));
        rscale.domain(d3.extent(yearData, d => d.total));
        colorScale.domain(d3.extent(yearData, d => d["Harvesting/field drying"]))

        drawChart(yearData, country_code);
        drawAxes();
    };

    const removeBubbleChart = () => {
        console.log('removing bubble chart');
        d3.select('#bubble-chart svg').remove();
    };

    /*const filterDataByCountry = (alphisData, accessEnergyData, country_code) => {
        const alphis = data.filter(d => d.country_code === country_code);

    }*/

    const filterDataByYear = (alphisData, accessEnergyData, year) => {
        const alphis = _.chain(alphisData)
            .filter(d => +d.year === +year)
            .map(d => {
                d.total = 0;
                _.keys(d)
                    .filter(key => ['country_code', 'country'].indexOf(key) === -1)
                    .forEach(key => {
                        d.total += d[key];
                    });

                let energy = accessEnergyData.filter(k => {
                    return k['Country Code'] === d.country_code;
                    // (k['Indicator Code' === '1.1_ACCESS.ELECTRICITY.TOT']) &&
                    // (k['year'] === SELECTED_YEAR)
                })[1];

                try {
                    const yeardata = energy.yeardata.filter(k => k.year === SELECTED_YEAR)[0];

                    if(energy) {
                        d.access_electricity = yeardata.value;
                    }
                } catch(err) {
                    console.log(d);
                    d.access_electricity = 0;
                }

                return d;
            })
            .value();

        return alphis;
    }

    const initChart = () => {
        console.log('adding bubble chart');
        svg = d3.select('#bubble-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    };

    const drawChart = (data, country_code) => {
        // console.log(data);
        const grp = svg.selectAll('.bubble')
        .data(data).enter()
        .append('g').attr('class', 'bubble')
        .attr('transform', d => {
            return `translate(${xscale(d.access_electricity)}, ${yscale(d.total)})`;
        })
        .on('mouseover', function(d) {
           const body = `<div>
               <h4>${d.country}</h4>
               <table class="table">
                   <thead>
                    <tr><th>Access to Electricity (% of total population)</th><td>${d['access_electricity'].toFixed(2)}</td>
                       <tr><th>Value Chain Stage</th><th>Amount Loss(t)</th></tr>
                   </thead>
                   <tbody>
                  <tr><td>Harvesting/field drying</td><td>${d['Harvesting/field drying'].toFixed(2)}</td></tr>
                    <tr><td>Platform drying</td><td>${d['Platform drying'].toFixed(2)}</td></tr>
                    <tr><td>Threshing and Shelling</td><td>${d['Threshing and Shelling'].toFixed(2)}</td></tr>
                    <tr><td>Winnowing</td><td>${d['Winnowing'].toFixed(2)}</td></tr>
                    <tr><td>Transport to farm</td><td>${d['Transport to farm'].toFixed(2)}</td></tr>
                    <tr><td>Farm storage</td><td>${d['Farm storage'].toFixed(2)}</td></tr>
                    <tr><td>Transport to market</td><td>${d['Transport to market'].toFixed(2)}</td></tr>
                    <tr><td>Market storage</td><td>${d['Market storage'].toFixed(2)}</td></tr>
                   </tbody>
               </table>
            </div>`;

           d3.select('.tooltip-d3')
            .style('top', `${d3.event.clientY}px`)
            .style('left', `${d3.event.clientX}px`)
            .style('display', 'block')
            .html(body);
        })
        .on('mouseout', d => {
            d3.select('.tooltip-d3')
                .transition()
                .delay(10000)
                .style('display', 'none')
        });

        grp.append('circle')
        .attr('r', d => rscale(d.total))
        // .style('stroke', 'blue')
        .style('fill', d => {
            return colorScale(d["Harvesting/field drying"]);
            /*if(d.country_code === country_code) {
                return '#00ff00';
            } else {
                return 'rgba(255,0,0,0.5)';
            }*/
        });

        grp
        .filter(d => d.country_code === country_code)
        .append('circle')
        .attr('r', d => rscale(d.total) + 4)
        .style('fill', 'transparent')
        .style('stroke', '#ffffff');

        const countryExists = _.find(data, d => d.country_code === country_code);
        // console.log(countryExists);

        if(!countryExists) {
            d3.select('#bubble-chart svg').append('text')
            .attr('x', 0)
            .attr('y', 20)
            .style('fill', '#737373')
            .text('No data for this country this year')
        }

        // x axis - access to electricity
        // y axis - total food loss
    };

    const drawAxes = () => {
        d3.select('.axes').remove();

        const axes = svg.append("g")
            .attr("g", "axes");

        axes.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")
    //   .attr("transform", "rotate(90)")
      .attr("y", 0 - margin.left)
      .attr("x", 400 - (height / 2))
      .attr("dy", "26em")
      .style("text-anchor", "middle")
      .style('fill', '#ffff')
      .text("Total Access to Electricity (% of Population)");

        axes.append("g")
            .call(yAxis);

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 3 - margin.left)
      .attr("x",2 - (height / 2))
      .attr("dy", "0.7em")
      .style("text-anchor", "middle")
      .style('fill', '#ffff')
      .text("Total Food Loss in Value Chain (t)");


    }

    //   // text label for the x axis
//   svg.append("text")
//       .attr("transform",
//             "translate(" + (width/2) + " ," +
//                           (height + margin.top + 20) + ")")
//       .style("text-anchor", "middle")
//       .text("Date");

//   // Add the y Axis
//   svg.append("g")
//       .call(d3.axisLeft(y));

//   // text label for the y axis
//   svg.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 0 - margin.left)
//       .attr("x",0 - (height / 2))
//       .attr("dy", "1em")
//       .style("text-anchor", "middle")
//       .text("Value");

// });

    win.bubble = {
        createBubbleChart: createBubbleChart,
        removeBubbleChart: removeBubbleChart
    };

    return win;

})(window);
