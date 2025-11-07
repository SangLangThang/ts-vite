const config = require('./config.json');

const leaders = ['10280', '11469', '23957', '25360', '26879'];
leaders.forEach(id => {
  const pc = config[id];
  if (pc) {
    const team = pc.partyConfig;
    console.log(`Leader ${id}: members=[${team.member1Id}, ${team.member2Id}, ${team.member3Id}, ${team.member4Id}], leaderId=${team.leaderId}`);
  }
});

console.log('\n\nTotal players converted:', Object.keys(config).length);
