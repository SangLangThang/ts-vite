const fs = require('fs');
const path = require('path');

// Read old config
const oldConfigPath = 'D:\\Game\\AutoOld\\3-event 2k Cuồng nộ -TT.json';
const oldConfig = JSON.parse(fs.readFileSync(oldConfigPath, 'utf8'));

// New config structure
const newConfig = {};

// Process each team in old config
Object.values(oldConfig).forEach(teamData => {
  const team = teamData.team || [];
  const dataTeam = teamData.dataTeam || [];

  if (team.length === 0) return;

  const leaderId = team[0]; // First member is leader
  const memberIds = team.slice(1, 5); // Next 4 are members (max 4 members)

  // Process each player in this team
  dataTeam.forEach(playerData => {
    const playerId = playerData.id;
    if (!playerId || playerId === 0) return;

    // Convert old format to new format
    const playerConfig = {
      partyConfig: {},
      battleSkillConfig: {
        changeGemChar: playerData.changeGemChar || playerData.checkAutoChangeGemChar || false,
        hoisinhChar: playerData.hoisinhChar || playerData.hoisinh || false,
        autoAttack: playerData.freeHand !== undefined ? !playerData.freeHand : false,
        skillNormalChar: parseInt(playerData.skillNormalChar) || 99999,
        skillSoloChar: parseInt(playerData.skillSoloChar) || 99999,
        skillSpecialChar: parseInt(playerData.skillSpecialChar) || 99999,
        skillCCChar: parseInt(playerData.skillCCChar) || 99999,
        skillBuffChar: parseInt(playerData.skillBuffChar) || 99999,
        skillClearChar: parseInt(playerData.skillClearChar) || 99999,
        changeGemPet: playerData.changeGemPet || playerData.checkAutoChangeGemPet || false,
        hoisinhPet: playerData.hoisinhPet || false,
        skillNormalPet: parseInt(playerData.skillNormalPet) || 99999,
        skillSoloPet: parseInt(playerData.skillSoloPet) || 99999,
        skillSpecialPet: parseInt(playerData.skillSpecialPet) || 99999,
        skillCCPet: parseInt(playerData.skillCCPet) || 99999,
        skillBuffPet: parseInt(playerData.skillBuffPet) || 99999,
        skillClearPet: parseInt(playerData.skillClearPet) || 99999
      }
    };

    // If this player is the leader, save full team config
    if (playerId === leaderId) {
      playerConfig.partyConfig = {
        member1Id: memberIds[0] || 0,
        member2Id: memberIds[1] || 0,
        member3Id: memberIds[2] || 0,
        member4Id: memberIds[3] || 0,
        qsMemberIndex: 1, // Default to first member as QS
        leaderId: 0 // Leader doesn't need to join another party
      };
    } else {
      // If this player is a member, only save leader id
      playerConfig.partyConfig = {
        member1Id: 0,
        member2Id: 0,
        member3Id: 0,
        member4Id: 0,
        qsMemberIndex: 1,
        leaderId: leaderId // Save the leader's ID to join their party
      };
    }

    newConfig[playerId] = playerConfig;
  });
});

// Write to config.json
const outputPath = 'd:\\Game\\New Tool\\ts\\config.json';
fs.writeFileSync(outputPath, JSON.stringify(newConfig, null, 2), 'utf8');

console.log(`Converted ${Object.keys(newConfig).length} player configs`);
console.log(`Output saved to: ${outputPath}`);
console.log('\nSample config for first player:');
console.log(JSON.stringify(Object.entries(newConfig)[0], null, 2));
