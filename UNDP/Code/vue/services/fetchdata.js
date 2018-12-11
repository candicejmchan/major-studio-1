((win) => {

    const services = {};

    /* global d3 */
    services.fetchData = () => {
      const popData = d3.csv('data/population.csv');
      const foodData = d3.json('data/fooddata.json');
      const countries = d3.json('data/countries.json');
      const accessEnergy = d3.csv('data/SE4ALLData.1.csv');
      const aphlisData = d3.json('data/data_2000.json');
      return Promise.all([popData, foodData, countries, accessEnergy, aphlisData ]);
    };

    win.services = services;
})(window)
