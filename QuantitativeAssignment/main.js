// MY STEPS 
// 1.Change values to numbers 
// 2. get country and indicator codes for zambia only  
// 3.create the svg
// 4.create groups for rural, urban, and total 
// 5. append text and dates to each group of rural, urban and total
// 6. create the horizontal line for each group
// 7. create group which contains the circles for each group 
// 8. then filter data for the circle groups which attaches the country data to the circles
// 9. Attach new vertical line group to only rural and make it extend to totals 

const columns = ['Indicator Code', 'Country Name', 'Country Code', 'Indicator Name'];
const indicators = [
    { name: '1.2_ACCESS.ELECTRICITY.RURAL', title: 'RURAL', position: 0 },
    { name: '1.1_ACCESS.ELECTRICITY.TOT', title: 'TOTAL', position: 2 },
    { name: '1.3_ACCESS.ELECTRICITY.URBAN', title: 'URBAN', position: 1 },
];


const indicator_values = indicators.map( d => d.name);
console.log(indicator_values);

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 1360 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const distanceBetweenCircles = 40;

let svg, line, circleSizeScale, colorScale, allCountriesData;

/*
[
    {
        key1: value1,
        key2: value2
    },
    {
        key1: value3,
        key2: value4
    }   
]
*/
const se4data = d3.csv('./SE4ALLData.csv', d => {
    const keys = d3.keys(d); // [key1, key2]
    const temp = {};
    
    keys.forEach( key => {
        if(key) {
            if (columns.indexOf(key) === -1){
                temp[key] = +d[key] || 0; // if it is a number kind then make it a number. if it is undefined then make it 0
            } else {
                temp[key] = d[key];
            }
        }
    });
    return temp;
});

const se4series = d3.csv('./SE4ALLSeries.csv');
    
Promise.all([se4data, se4series])
.then( d => {
    const data = d[0].filter( row => {
        return row['Country Code'] === 'ZMB' && indicator_values.indexOf(row['Indicator Code']) !== -1;
    });
    allCountriesData = d[0].filter( row => {
        return indicator_values.indexOf(row['Indicator Code']) !== -1; //this filters for all countries not just zambia with similar indicator codes for total
    });
    const series = d[1];
    // console.log(data);
    // console.log(allCountriesData);
    Chart();
    drawChart(data);
});

const similarPercentageTotal = (value, year) => {
    const min = value * 0.98; //other countries have total within 2 percent of zambia's values listed under totals
    const max = value * 1.02;
    const result = allCountriesData.filter(d => {
        return d['Indicator Code'] === '1.1_ACCESS.ELECTRICITY.TOT' &&
               d[year] >= min && d[year] < max &&
               d['Country Code'] !== 'ZMB'; //do not include zambia in this because it will list at the bottom as well 
    })
    .map( d => d['Country Name']); //write the country name 
    
    return result;
};

const Chart = () => {
    
    tooltip = d3.select("body")
	    .append("div")
	    .classed('tooltip', true)
    	.text("a simple tooltip");    
    
    svg = d3.select('#chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    circleSizeScale = d3.scaleLinear()
        .range([5, 22]);
        
    colorScale = d3.scaleLinear()
        .range(['#FFC300', '#099EDA']) //yellow (smallest) to green (middle) to blue (largest values)

};

// Created function that I can use later on in creating line and circle group
const createYearArray = (d) => {
    const keys = d3.keys(d);
    const newArray = [];
    keys.forEach( key => {
        if(columns.indexOf(key) === -1) {
            const newObject = {};
            newObject.indicator_code = d['Indicator Code'];
            newObject.year = key;
            newObject.value = d[key];
            newArray.push(newObject);
        } 
    });
    return newArray;   
}

const drawChart = (data) => {
    
    // data.filter( d => )
    
    circleSizeScale.domain([0, 76]);
    colorScale.domain([0, 76]);
    
    // array that contains the groups
    const container_g = svg.selectAll('g') 
        .data(data).enter()
        .append('g')
        .attr('transform', (d,i) => { //call this before you can call translate or rotate or skew
            const pos = indicators.filter( indicator => indicator.name === d['Indicator Code'])[0].position;
            return `translate(50, ${pos * 150 + 50})` // moves the x and y paramenters 
        }) //three groups here appending text  
    
    console.log(container_g);
    // d = value in the context of what is passed to the .data()
    // i = index in the context of what is passed to the .data()
    
     //write 1990 and 2016 at the end of each line 
     container_g.append('g')
     .classed('years', true)
     .selectAll('text').data([1990, 2016]).enter()
     .append('text')
     .style('fill', '#fff')
     .attr('x', (d, i) => {
         if(i === 0) {
             return -50;
         } else {
             return 27 * distanceBetweenCircles;
         }
     })
     .text(String);
    
    //write rural, urban, and total for each line
     container_g.append('text')
     .classed('label', true)
     .attr('y', -22)
     .attr('x', -70)
    .text( d => {
      return indicators.filter( indicator => indicator.name === d['Indicator Code'])[0]['title']
    })
    
    container_g.append('line')
    .attr('x1', 0)
    .attr('x1', 0)
    .attr('x2', 26 * distanceBetweenCircles)
    .attr('y2', 0);
    
    container_g.append('g').classed('vertical-lines', true)
        .selectAll('line')
        .data((d, i) => {
            if(i === 0) {
                return createYearArray(d);
            } else {
                return [];
            }
        }).enter() //creating the vertical lines
        .append('line')
        .style('fill', 'transparent')
        .style('stroke', 'white')
        .style('stroke-width', 0.5)
        .style('stroke-dasharray', '2,8') // 2 is length
        .attr('x1', (d, i) => i* distanceBetweenCircles)
        .attr('y1', 0)
        .attr('x2',  (d, i) => i* distanceBetweenCircles)
        .attr('y2', (2 * 150) )
    
    
    const circles = container_g.append('g')
    .classed('circles', true)
    
    
    const circleGroup = circles.selectAll('.circle')
        .data( d => {
            return createYearArray (d);
        }).enter()
        .append('g')
        .classed('circle', true)
        .attr('title', d => d.value)
        .attr('transform',  (d, i) => `translate(${i* distanceBetweenCircles}, 0)`)
        
        
//create the little box with the percentages for circles
    circleGroup.append('circle')
        .attr('r', d => {
            // console.log(d.value, circleSizeScale(d.value));
            return circleSizeScale(d.value);
        })
        .style('fill', d => colorScale(d.value))
        .on("mouseover", d => tooltip.style("visibility", "visible").text(d.value.toFixed(2)) )
	    .on("mouseout", d => tooltip.style("visibility", "hidden") );
	    
//write the name of similar countires with similar percentages under total circles
    circleGroup.selectAll('text')
    .data(d => {
        const result = [];
        if(d.indicator_code === '1.1_ACCESS.ELECTRICITY.TOT') {
             const val = similarPercentageTotal(d.value, d.year);
             val.forEach( k => {
                 const temp = {
                     country_name: k
                 };
                result.push(temp); 
             });
        }
        return result;
    }).enter()
    .append('text')
    .style('fill', '#fff')
    .attr('y', (d, i) => i * 20 + 50)
    .style('font-size', '10px')
    .text( d => {
        return d.country_name;
    });
    
    
    
};