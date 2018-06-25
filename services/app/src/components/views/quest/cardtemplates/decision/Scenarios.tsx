import {PersonaType, ScenarioType, SkillType} from './Types';

function simpleScenario(persona: PersonaType, skill: SkillType, prelude: string, successText: string, successInstructions: string[], failureText: string, failureInstructions: string[], noneventText: string, retryText: string): ScenarioType {
  return {
    persona,
    skill,
    prelude,
    success: {type: 'SUCCESS', text: successText, instructions: successInstructions},
    failure: {type: 'FAILURE', text: failureText, instructions: failureInstructions},
    nonevent: {type: 'INTERRUPTED', text: noneventText, instructions: []},
    retry: {type: 'RETRY', text: retryText, instructions: []},
  };
}

// TODO: Scenarios could use some kind of QDL-based conditional, e.g. you could have certain cases where scenarios only
// happen when there's guaranteed to be more than one enemy, or if all other adventurers are dead, etc.
// TODO: Rewards can be throttled up and down with difficulty by only showing e.g. 1 of 3 instructions if it's an easy check, or 2 if normal, or 3 if hard.
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
  simpleScenario(
    'Light',
    'Athletics',
    'You spot a heavy object. You may be able to put it to use.',
    'You hoist the object and hurl it at the nearest enemy!',
    ['Deal 2 damage to one target'],
    'You strain hard, but fail to lift it.',
    ['All adventurers that rolled for the check lose 1 health'],
    'You try to move the object, but it\'s too heavy.',
    'You think it moved a little! You call over an ally to help.'),
  simpleScenario(
    'Light',
    'Athletics',
    'You spot something you can climb up that will give you the high ground!',
    'You climb with ease!',
    ['The adventurer that succeeded the check gains +3 damage next round.'],
    'Your hand slips free; you smack into the ground.',
    ['The last adventurer to roll for this check takes 1 damage.'],
    'You struggle to hold on, but slip back to the ground',
    'You struggle to find a hold; you call an ally to help boost you up.'),
  simpleScenario(
    'Light',
    'Athletics',
    'From your training, you remember an awesome maneouver - time to try it out!',
    'You land a flying kick on the nearest enemy! Everyone stops fighting momentarily to watch, impressed.',
    ['All adventurers that rolled for the check gain 1 health.', '1 target takes 1 damage.'],
    'You leap up, but the enemy swats you back down.',
    ['The last adventurer to roll for this check takes 1 damage.'],
    'You reconsider... the time has passed.',
    'You never were good at that maneuver, though. Best let someone else try it. You call out the plan to an ally.'),
  {
    persona: 'Dark',
    skill: 'Athletics',

    prelude: 'An enemy appears to be... carrying something. You try to trip them up and steal it for yourself.',

    success: {type: 'SUCCESS', text: 'A well placed kick, and the loot drops to the ground. You snatch it up!', instructions: ['The adventurer that succeeded the check  gains 1 Tier I loot']},
    failure: {type: 'FAILURE', text: 'They trip you first!', instructions: ['One adventurer that rolled for the check loses 1 Tier I loot']},
    nonevent: {type: 'INTERRUPTED', text: 'In the chaos of combat, your fancy footwork fails to fool the fiend. No loot for you, this time.', instructions: []},
    retry: {type: 'RETRY', text: 'The enemy dodges... but you see another chance!', instructions: []},
  },
  simpleScenario(
    'Dark',
    'Athletics',
    'An enemy has let their guard down... now is your chance to strike!',
    'Your attack hits true!',
    ['Deal 2 damage to one target.', 'Reduce damage taken this round by 1'],
    'Your attack goes wide; you leave yourself open to retaliation!',
    ['The last adventurer to roll for this check takes 1 damage.'],
    'The enemy closes their guard before you get a good hit in.',
    'Your attack goes wide, but there\'s another chance!'),
  simpleScenario(
    'Dark',
    'Athletics',
    'You see some loose dust on the ground - you could use it to blind the enemy temporarily...',
    'You scoop up a handful of the debris and toss it at the nearest enemy, which starts clawing at their eyes in rage!',
    ['Enemies deal 2 less damage next round'],
    'As you crouch down, an enemy sees you drop your guard and strikes!',
    ['All adventurers that rolled for the check take +1 damage from enemies next round'],
    'You try to scoop up the dust, but it slips through your fingers',
    'The dust slips through your fingers; try again.'),
  {
    persona: 'Light',
    skill: 'Knowledge',

    prelude: 'There\'s something oddly familiar about this combat...',

    success: {type: 'SUCCESS', text: 'You recall a forgotten technique you read once; maybe you can put it to use...', instructions: ['The adventurer that succeeded the check learns 1 ability']},
    failure: {type: 'FAILURE', text: 'You\'re not feelying particularly knowledgeable about your next action.', instructions: ['The last adventurer to roll for this check must play the top ability card of their deck as D20=1.']},
    nonevent: {type: 'INTERRUPTED', text: 'The noise of battle shakes you out of your reverie... back to fighting!', instructions: []},
    retry: {type: 'RETRY', text: 'The thought remains, just out of reach...', instructions: []},
  },
  simpleScenario(
    'Light',
    'Knowledge',
    'It feels like you\'ve been here before...',
    'You sprint over to an unassuming spot and pry at the ground. A hatch opens, revealing loot! Just in time for the fight.',
    ['Each adventurer that rolled for this check draws 1 Tier I Loot.'],
    'You try to ignore the feeling, but fail to do so before being clobbered by the enemy.',
    ['Each adventurer that rolled for this check takes 1 damage.'],
    'You ignore the feeling and keep fighting.',
    'The thought remains, just out of reach...'),
  {
    persona: 'Dark',
    skill: 'Knowledge',

    prelude: 'You remember stories of a hidden trap common to this place - if only you remembered more...',

    success: {type: 'SUCCESS', text: 'You spot it - a pressure plate - and warn your party before they draw near.', instructions: ['All adventurers that rolled for the check gain 1 Persona.']},
    failure: {type: 'FAILURE', text: 'In your search, you accidentally touch a pressure plate and spring the trap - a mind-fog envelops the party!', instructions: ['All adventurers that rolled for the check lose 1 Persona.']},
    nonevent: {type: 'INTERRUPTED', text: 'You shrug. Surely if it was that important you\'d have remembered by now. You keep fighting.', instructions: []},
    retry: {type: 'RETRY', text: 'The thought remains, just out of reach...', instructions: []},
  },
  simpleScenario(
    'Dark',
    'Knowledge',
    'Your anatomical knowledge could come in handy here...',
    'You hit the enemy right where it hurts most!',
    ['Deal 3 damage to 1 target'],
    'Perhaps said knowledge was a little fuzzy... that\'s no weak spot!',
    ['Enemies take 1 less damage from abilities this round'],
    'Meh, you\'ll just keep attacking as you did before.',
    'You communicate the plan to an ally.'),
  {
    persona: 'Light',
    skill: 'Charisma',

    prelude: 'One of the enemies appears reluctant to fight; perhaps you can reason with them?',

    success: {type: 'SUCCESS', text: 'Your logic seems to have had an effect - but not enough for them to abandon the fight.', instructions: ['Cancel the lowest tier enemy\'s next surge effect (place a token on them to track)']},
    failure: {type: 'FAILURE', text: 'Your words only serve to anger the foe!', instructions: ['Carry out the surge effect of the lowest tier enemy']},
    nonevent: {type: 'INTERRUPTED', text: 'You\'re drowned out by the noise of battle.', instructions: []},
    retry: {type: 'RETRY', text: 'You try unsuccessfully to catch the enemy\'s attention.', instructions: []},
  },
  simpleScenario(
    'Light',
    'Charisma',
    'You spy a chance to lighten your allies\' moods.',
    'The party laughs at your inside joke, emboldened.',
    ['All adventurers that did not roll for the check regain 1 health.'],
    'Your levity falls flat with your companions. The enemy thinks it\'s pretty funny, though.',
    ['All enemies with nonzero health regain 1 health.'],
    'Your chance is squandered in the heat of combat.',
    'You set the tone for an inside joke and leave it to another party member to deliver the punchline.'),
  {
    persona: 'Dark',
    skill: 'Charisma',

    prelude: 'You think you know just the way to get under the enemy\'s skin.',

    success: {type: 'SUCCESS', text: 'With a rather pointed insult, you bring levity to your party.', instructions: ['Deal 2 damage to an enemy.', 'One adventurer regains 1 health.']},
    failure: {type: 'FAILURE', text: 'Your insult falls flat, and the enemy gets a hit on you while you\'re distracted!', instructions: ['All adventurers that rolled for the check lose 1 health.']},
    nonevent: {type: 'INTERRUPTED', text: 'You\'re drowned out by the noise of battle.', instructions: []},
    retry: {type: 'RETRY', text: 'You can\'t think up the right words... you ask an ally for help', instructions: []},
  },
  simpleScenario(
    'Dark',
    'Charisma',
    'You hear the enemy call out in a language you can almost understand...',
    'You interpret true, and anticipate their next move!',
    ['Carry out the effects of an enemy\'s surge on itself, replacing "enemy" for "adventurer" and vice versa'],
    'You bungle the translation and dodge right; the enemy strikes left!',
    ['The last adventurer to roll for this check takes 1 damage.'],
    'You ignore their words and focus on the combat.',
    'Perhaps someone else knows what they\'re saying?'),
];

declare interface ScenarioMap {[skill: string]: {[persona: string]: ScenarioType[]};}

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
