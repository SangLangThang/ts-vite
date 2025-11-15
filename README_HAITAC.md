# Hải Tặc Event Flow

## Overview
The Hải Tặc event is an automated party-based farming system where a leader with 4 fixed members cycles through multiple rotating members to repeatedly catch NPC 42550 (Hải Tặc).

## Party Structure
- **Leader**: 1 player (coordinates the event)
- **Fixed Members**: 4 players (members 1, 2, 3, 4)
- **Rotating Members**: Multiple players (join one at a time, catch NPC, then leave)

Total party size during event: **5 players** (Leader + 4 Fixed + 1 Rotating)

## Event Flow

### 1. Initialization
1. Leader configures:
   - 4 fixed member IDs (member1Id, member2Id, member3Id, member4Id)
   - Rotating member IDs (comma-separated list)
2. First rotating member sends party invite to leader
3. Leader's `currentEvent` is set to `'haitac'`
4. Leader stores rotating members list and sets index to 0

### 2. Party Formation
1. First rotating member joins party (party becomes 5 members)
2. System triggers `autoCatchHaiTac()`
3. Leader sends `trainon` packet (enables auto-walking)
4. Walking interval starts (every 2 seconds)

### 3. Walking Pattern
Leader automatically walks between coordinates:
```
Point 1: (1462, 1155)
Point 2: (1642, 1135)
Point 3: (1522, 1215)
```
Repeats: Point 1 → Point 2 → Point 3 → Point 1...

### 4. Battle Encounter
When battle starts (`account.battle === 1`):
- Walking interval stops temporarily
- `handleHaiTacBattle()` is called each turn
- Battle continues until NPC is caught or battle ends

### 5. Battle Completion
- Walking interval resumes after battle ends
- If NPC 42550 was caught by rotating member:
  - Leader's walking interval stops
  - Leader sends `trainoff` packet
  - Rotating member leaves party
  - System moves to next rotating member

### 6. Rotation Cycle
When rotating member leaves:
1. Check if more rotating members exist
2. If yes:
   - Increment `currentRotatingIndex`
   - Next rotating member sends invite to leader
   - Process repeats from step 2
3. If no more members:
   - Clear `currentEvent`
   - Clear `rotatingMembers` list
   - Event ends

## Battle Skills Configuration

### Leader Skills
- **Character**: Always uses skill **18001** (self-buff)
- **Pet**: Uses priority skills (see Fixed Members Pet)

### Rotating Member Skills
- **Character**: Always uses skill **15002** (catch skill)
- **Pet**: None (no pet attacks)

### Fixed Members (2, 3, 4) Skills

#### When NPC 42550 NOT Found:
- **Character**: Skill **17001** (defense)
- **Pet**: Skill **17001** (defense)

#### When NPC 42550 Found:
Skills follow priority order (first available skill is used):

**Character Priority:**
1. `skillClearChar` (if configured and > 0)
2. `skillSpecialChar` (if configured and > 0)
3. `skillNormalChar` (if configured and > 0)
4. **10000** (default attack)

**Pet Priority:**
1. `skillClearPet` (if configured and > 0)
2. `skillSpecialPet` (if configured and > 0)
3. `skillNormalPet` (if configured and > 0)
4. **10000** (default attack)

**Note**: Skills with value 99999 are ignored (treated as not configured)

## Skill Priority Summary

```
Priority Order (Highest to Lowest):
1. skillClear   - Clear/Sweep skill (high damage AoE)
2. skillSpecial - Special skill (boss/elite damage)
3. skillNormal  - Normal attack skill
4. 10000        - Default basic attack
```

## Key Functions

### `autoCatchHaiTac(account, leaderId)`
- Initializes walking pattern
- Sends `trainon` packet
- Creates interval for automated walking
- Interval ID stored in `account.haitacIntervalId`

### `handleHaiTacBattle(account, leaderId)`
- Handles battle logic during Hải Tặc event
- Detects NPC 42550 presence
- Assigns appropriate skills to each party member
- Executes attacks for all members

### `findHaiTacNPC(battleInfo)`
- Searches slots 0-9 for NPC 42550
- Returns hex location if found, null otherwise

## Special Behavior

### Auto-Walking
- Only runs when NOT in battle (`account.battle === 0`)
- Automatically stops during battle
- Resumes after battle ends
- Stops permanently when rotating member catches NPC

### Party Management
- Leader automatically accepts rotating member invites
- Rotating members don't occupy fixed member slots
- Fixed members remain in party throughout event
- Only rotating members cycle in/out

### Battle Targeting
- All attacks target NPC 42550 location when present
- Defense skills when NPC not found
- Leader's skill 18001 targets self (buff)

## Event Termination

Event ends when:
1. All rotating members have completed their cycle
2. Leader manually stops the event
3. Leader leaves party
4. Party is disbanded

## Error Handling
- Missing rotating member: Logs error, event continues
- Battle packet errors: Ignored silently
- Invalid party state: Event clears automatically

## Configuration Example

```typescript
// Leader configuration
leader.party = {
  member1Id: 100001,  // Fixed member 1
  member2Id: 100002,  // Fixed member 2
  member3Id: 100003,  // Fixed member 3
  member4Id: 100004,  // Fixed member 4
  rotatingMembers: [200001, 200002, 200003], // Rotating members list
  currentRotatingIndex: 0
};
leader.currentEvent = 'haitac';

// Fixed member battle skills
fixedMember.battleSkillConfig = {
  skillClearChar: 15001,    // Priority 1
  skillSpecialChar: 14001,  // Priority 2
  skillNormalChar: 10001,   // Priority 3
  skillClearPet: 15002,     // Priority 1
  skillSpecialPet: 14002,   // Priority 2
  skillNormalPet: 10002     // Priority 3
};
```

## Notes
- NPC ID for Hải Tặc: **42550**
- Leader skill: **18001** (self-buff)
- Rotating member skill: **15002** (catch)
- Defense skill: **17001**
- Default attack: **10000**
