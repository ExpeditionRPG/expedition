module.exports = {
  adventurers: 4,
  difficulty: 0,
  multitouch: true,
  tutorialVisibility: {},
  encounters: {},
  difficultySettings: [
    {
      name: "Tutorial",
      roundTimeMillis: 20000,
      damageMultiplier: 0.5,
      helpLevel: 2,
    },
    {
      name: "Easy",
      roundTimeMillis: 15000,
      damageMultiplier: 0.75,
      helpLevel: 1,
    },
    {
      name: "Normal",
      roundTimeMillis: 10000,
      damageMultiplier: 1.0,
      helpLevel: 0,
    },
    {
      name: "Hard",
      roundTimeMillis: 8000,
      damageMultiplier: 1.5,
      helpLevel: 0,
    },
    {
      name: "Impossible",
      roundTimeMillis: 6000,
      damageMultiplier: 2.0,
      helpLevel: 0,
    }
  ],
};