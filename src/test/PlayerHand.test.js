import React from 'react';
import Enzyme, {shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as deck from '../util/deck';
import PlayerHand from '../components/PlayerHand';
import Card from '../components/Card';

Enzyme.configure({ adapter: new Adapter() });

describe('PlayerHand component render tests', () => {
  test('it renders', () => {
    const wrapper = shallow(<PlayerHand hand={[]} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it contains 2 Card components when given 2 card objects', () => {
    const wrapper = shallow(<PlayerHand hand={[new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')]} />);
    expect(wrapper.find(Card)).toHaveLength(2);
  });
})