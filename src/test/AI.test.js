import React from 'react';
import Enzyme, {shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as deck from '../util/deck';
import AI from '../components/AI';
import Card from '../components/Card';

Enzyme.configure({ adapter: new Adapter() });

describe('AI component render tests', () => {
  test('it renders', () => {
    const wrapper = shallow(<AI data={{ cards: [], id: 'ai1' }} showCards={false} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it contains 2 Card components when given 2 card objects', () => {
    const wrapper = mount(<AI data={{ cards: [new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')], id: 'ai1' }} showCards={true} />);
    expect(wrapper.find(Card)).toHaveLength(2);
    expect(wrapper.find('.card-title')).toHaveLength(2);
  });

  test('it does not display card fronts when it is not meant to', () => {
    const wrapper = mount(<AI data={{ cards: [new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')], id: 'ai1' }} showCards={false} />);
    expect(wrapper.find('.card-title')).toHaveLength(0);
    expect(wrapper.find('img')).toHaveLength(2);
  })
})