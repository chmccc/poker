import { createBasePlayerData } from '../../util/helpers';
import { getDecision } from '../../util/engine/ai';

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
    const decisionObj = getDecision(dummyPlayerData, 'ai1');
    expect(/fold|call|raise/g.test(decisionObj.decision)).toBe(true);
  });

  test('it returns fold decision when unable to call', () => {
    dummyPlayerData.ai1.currentBet = 0;
    dummyPlayerData.ai1.balance = 20;
    const decisionObj = getDecision(dummyPlayerData, 'ai1');
    expect(decisionObj.decision).toBe('fold');
  });

  test('it is capable of returning all 3 decisions when run many times (300x)', () => {
    dummyPlayerData.ai1.currentBet = 10;
    dummyPlayerData.ai1.balance = 100;
    const required = ['fold', 'call', 'raise'];
    const results = Array(300)
      .fill('')
      .map(() => getDecision(dummyPlayerData, 'ai1').decision);
    expect(results).toEqual(expect.arrayContaining(required));
  });

  test('it always meets the minimum to call when calling or raising (100x)', () => {
    dummyPlayerData.ai1.currentBet = 10;
    dummyPlayerData.ai1.balance = 100;
    for (let i = 0; i < 100; i++) {
      const decisionObj = getDecision(dummyPlayerData, 'ai1');
      if (decisionObj.decision !== 'fold') {
        expect(decisionObj.totalAmt).toBeGreaterThanOrEqual(20);
      }
    }
  });

  test('when raising, it includes an amount divisible by 10 and never more than 200 (500x)', () => {
    dummyPlayerData.ai1.currentBet = 0;
    dummyPlayerData.ai1.balance = 1000;
    let gotARaise = false;
    for (let i = 0; i < 500; i++) {
      const decisionObj = getDecision(dummyPlayerData, 'ai1');
      if (decisionObj.decision === 'raise') {
        gotARaise = true;
        expect(typeof decisionObj.raiseAmt).toBe('number');
        expect(decisionObj.raiseAmt).toBeGreaterThanOrEqual(10);
        expect(decisionObj.raiseAmt).toBeLessThanOrEqual(200);
        expect(decisionObj.raiseAmt % 10).toEqual(0);
      }
    }
    expect(gotARaise).toEqual(true);
  });
});
