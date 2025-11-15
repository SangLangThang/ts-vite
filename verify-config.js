const config = require('./config.json');

const leaders = ['10280', '11469', '23957', '25360', '26879'];
leaders.forEach(id => {
  const pc = config[id];
  if (pc) {
    const team = pc.partyConfig;
  }
});

