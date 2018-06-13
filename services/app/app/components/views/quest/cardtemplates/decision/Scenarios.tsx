import {ScenarioType} from './Types'

const scenarios: ScenarioType[] = [
  {
    persona: 'Light',
    skill: 'Athletics',

    prelude: 'Out of the corner of your eye, you spot a medicinal herb. If you get to it quickly, you could use it for healing.',

    success: {type: 'SUCCESS', text: 'You grab the herb, pick off a leaf, and chew it down before the enemy gets a hit on you.', instructions: ['The adventurer that succeeded the check regains 2 health']},
    failure: {type: 'FAILURE', text: 'You trip and fall; the enemy gets in a hit on you.', instructions: ['All adventurers that rolled for the check lose 1 health']},
    nonevent: {type: 'INTERRUPTED', text: 'The enemy cuts you off before you can get to the herb.', instructions: []},
    retry: {type: 'RETRY', text: 'Just a little further!', instructions: []},
  },
  {
    persona: 'Dark',
    skill: 'Athletics',

    prelude: 'An enemy appears to be... carrying something. You try to trip them up and steal it for yourself.',

    success: {type: 'SUCCESS', text: 'A well placed kick, and the loot drops to the ground. You snatch it up!', instructions: ['The adventurer that succeeded the check  gains 1 Tier I loot']},
    failure: {type: 'FAILURE', text: 'They trip you first!', instructions: ['One adventurer that rolled for the check loses 1 Tier I loot']},
    nonevent: {type: 'INTERRUPTED', text: 'In the chaos of combat, your fancy footwork fails to fool the fiend. No loot for you, this time.', instructions: []},
    retry: {type: 'RETRY', text: 'The enemy dodges... but you see another chance!', instructions: []},
  },
  {
    persona: 'Light',
    skill: 'Knowledge',

    prelude: 'There\'s something oddly familiar about this combat...',

    success: {type: 'SUCCESS', text: 'You recall a forgotten technique you read once; maybe you can put it to use...', instructions: ['The adventurer that succeeded the check learns 1 ability']},
    failure: {type: 'FAILURE', text: 'You\'re not feelying particularly knowledgeable about your next action.', instructions: ['The last adventurer to roll for this check must play the top ability card of their deck as D20=1.']},
    nonevent: {type: 'INTERRUPTED', text: 'The noise of battle shakes you out of your reverie... back to fighting!', instructions: []},
    retry: {type: 'RETRY', text: 'The thought remains, just out of reach...', instructions: []},
  },
  {
    persona: 'Dark',
    skill: 'Knowledge',

    prelude: 'You remember stories of a hidden trap common to this place - if only you remembered more...',

    success: {type: 'SUCCESS', text: 'You spot it - a pressure plate - and warn your party before they draw near.', instructions: ['All adventurers that rolled for the check gain 1 Persona.']},
    failure: {type: 'FAILURE', text: 'In your search, you accidentally touch a pressure plate and spring the trap - a mind-fog envelops the party!', instructions: ['All adventurers that rolled for the check lose 1 Persona.']},
    nonevent: {type: 'INTERRUPTED', text: 'You shrug. Surely if it was that important you\'d have remembered by now. You keep fighting.', instructions: []},
    retry: {type: 'RETRY', text: 'The thought remains, just out of reach...', instructions: []},
  },
  {
    persona: 'Light',
    skill: 'Charisma',

    prelude: 'One of the enemies appears reluctant to fight; perhaps you can reason with them?',

    success: {type: 'SUCCESS', text: 'Your logic seems to have had an effect - but not enough for them to abandon the fight.', instructions: ['Cancel the lowest tier enemy\'s next surge effect (place a token on them to track)']},
    failure: {type: 'FAILURE', text: 'Your words only serve to anger the foe!', instructions: ['Carry out the surge effect of the lowest tier enemy']},
    nonevent: {type: 'INTERRUPTED', text: 'You\'re drowned out by the noise of battle.', instructions: []},
    retry: {type: 'RETRY', text: 'You try unsuccessfully to catch the enemy\'s attention.', instructions: []},
  },
  {
    persona: 'Dark',
    skill: 'Charisma',

    prelude: 'You think you know just the way to get under the enemy\'s skin.',

    success: {type: 'SUCCESS', text: 'With a rather pointed insult, you bring levity to your party.', instructions: ['Deal 2 damage to an enemy.', 'One adventurer regains 1 health.']},
    failure: {type: 'FAILURE', text: 'Your insult falls flat, and the enemy gets a hit on you while you\'re distracted!', instructions: ['All adventurers that rolled for the check lose 1 health.']},
    nonevent: {type: 'INTERRUPTED', text: 'You\'re drowned out by the noise of battle.', instructions: []},
    retry: {type: 'RETRY', text: 'You can\'t think up the right words... you ask an ally for help', instructions: []},
  },
];

declare type ScenarioMap = {[skill: string]: {[persona: string]: ScenarioType[]}};

function buildMap(s: ScenarioType[]): ScenarioMap {
  const result: ScenarioMap = {};
  for (const s of scenarios) {
    if (!result[s.skill]) {
      result[s.skill] = {[s.persona]: [s]};
    } else if (!result[s.skill][s.persona]) {
      result[s.skill][s.persona] = [s];
    } else {
      result[s.skill][s.persona].push(s);
    }
  }
  return result;
}

const map = buildMap(scenarios);
export default map;
