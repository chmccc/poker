import { getDecision } from '../../util/ai';
import { createBasePlayerData } from '../../util/helpers';

describe('prototype version tests for getNextMove', () => {
  let dummyPlayerData;
  beforeEach(() => {
    // set base playerData and other players' bets
    dummyPlayerData = createBasePlayerData();
    dummyPlayerData.player.currentBet = 30;
    dummyPlayerData.ai2.currentBet = 10;
    dummyPlayerData.ai3.currentBet = 30;
  });

  test('it returns either a fold, call, or raise', () => {
    dummyPlayerData.ai1.currentBet = 0;
    dummyPlayerData.ai1.balance = 100;
    const choiceObj = getDecision(dummyPlayerData, 'ai1');
    expect(/fold|call|raise/g.test(choiceObj.choice)).toBe(true);
  });

  test('it returns fold choice when unable to call', () => {
    dummyPlayerData.ai1.currentBet = 0;
    dummyPlayerData.ai1.balance = 20;
    const choiceObj = getDecision(dummyPlayerData, 'ai1');
    expect(choiceObj.choice).toBe('fold');
  });

  test('it is capable of returning all 3 choices when run many times (300x)', () => {
    dummyPlayerData.ai1.currentBet = 10;
    dummyPlayerData.ai1.balance = 100;
    const required = ['fold', 'call', 'raise'];
    const results = Array(300)
      .fill('')
      .map(() => getDecision(dummyPlayerData, 'ai1').choice);
    expect(results).toEqual(expect.arrayContaining(required));
  });

  test('when raising, it includes an amount divisible by 10 and never more than 200 (500x)', () => {
    dummyPlayerData.ai1.currentBet = 0;
    dummyPlayerData.ai1.balance = 1000;
    let gotARaise = false;
    for (let i = 0; i < 500; i++) {
      const choiceObj = getDecision(dummyPlayerData, 'ai1');
      if (choiceObj.choice === 'raise') {
        gotARaise = true;
        expect(typeof choiceObj.raise).toBe('number');
        expect(choiceObj.raise).toBeGreaterThanOrEqual(10);
        expect(choiceObj.raise).toBeLessThanOrEqual(200);
        expect(choiceObj.raise % 10).toEqual(0);
      }
    }
    expect(gotARaise).toEqual(true);
  });
});
