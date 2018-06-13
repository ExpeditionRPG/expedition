import {ScenarioType} from './Types'

const scenarios: ScenarioType[] = [
  {
    persona: 'Light',
    skill: 'Athletics',

    prelude: 'Out of the corner of your eye, you spot a medicinal herb. If you run to it quickly, you could use it for healing.',

    success: {type: 'SUCCESS', text: 'You grab the herb, pick off a leaf, and chew it down before the enemy gets a hit on you.', instructions: ['Regain 2 health']},
    failure: {type: 'FAILURE', text: 'You trip and fall; the enemy gets in a hit on you.', instructions: ['Lose 2 health']},
    nonevent: {type: 'INTERRUPTED', text: 'The enemy cuts you off before you can get to the herb.', instructions: []},
    retry: null,
  },
  {
    persona: 'Dark',
    skill: 'Athletics',

    prelude: 'An enemy appears to be... carrying something. You try to trip them up and steal it for yourself.',

    success: {type: 'SUCCESS', text: 'A well placed kick, and the loot drops to the ground. You snatch it up!', instructions: ['Gain 1 Tier I loot']},
    failure: {type: 'FAILURE', text: 'They trip you first!', instructions: ['Lose 1 Tier I loot']},
    nonevent: {type: 'INTERRUPTED', text: 'In the chaos of combat, your fancy footwork fails to fool the fiend. No loot for you, this time.', instructions: []},
    retry: null,
  },
  {
    persona: 'Light',
    skill: 'Knowledge',

    prelude: 'There\'s something oddly familiar about this combat...',

    success: {type: 'SUCCESS', text: 'You recall a forgotten technique you read once; maybe you can put it to use...', instructions: ['Learn 1 ability']},
    failure: {type: 'FAILURE', text: 'You\'re not feelying particularly knowledgeable about your next action.', instructions: ['Your next ability counts as a failure.']},
    nonevent: {type: 'INTERRUPTED', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Dark',
    skill: 'Knowledge',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', text: 'You see an opportunity to strike right where it hurts most!', instructions: ['Deal 1 damage to an enemy']},
    failure: {type: 'FAILURE', text: 'You attempt a dark blood ritual, but forgot it was just a ritual to that makes your blood dark.', instructions: ['Lose 1 health']},
    nonevent: {type: 'INTERRUPTED', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Light',
    skill: 'Charisma',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', text: 'You succeed!', instructions: ['Cancel the lowest tier enemy\'s next surge effect (place a token on them to track)']},
    failure: {type: 'FAILURE', text: 'You fail!', instructions: ['Carry out the surge effect of the lowest tier enemy']},
    nonevent: {type: 'INTERRUPTED', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Dark',
    skill: 'Charisma',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', text: 'You succeed!', instructions: ['Regain 1 hp']},
    failure: {type: 'FAILURE', text: 'You fail!', instructions: ['Lose 1 hp']},
    nonevent: {type: 'INTERRUPTED', text: 'Nothing happens.', instructions: []},
    retry: null,
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
