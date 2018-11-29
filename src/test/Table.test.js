import React from 'react';
import Enzyme, {shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as deck from '../util/deck';
import Table from '../Table';
import Card from '../Card';

Enzyme.configure({ adapter: new Adapter() });

describe('Table component render tests', () => {
  test('it renders', () => {
    const wrapper = shallow(<Table cards={[]} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it contains 3 Card components when given 3 card object', () => {
    const wrapper = shallow(<Table cards={[new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts'), new deck.Card(12, 'Hearts')]} />);
    expect(wrapper.find(Card)).toHaveLength(3);
  });
})