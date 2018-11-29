import React from 'react';
import Enzyme, {shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as deck from '../util/deck';
import Card from '../components/Card';

Enzyme.configure({ adapter: new Adapter() });

describe('Card component render tests', () => {
  test('it renders', () => {
    const wrapper = shallow(<Card />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it contains a card title and emoji symbol when given a card object', () => {
    const wrapper = shallow(<Card shown card={new deck.Card(14, 'Hearts')} />);
    expect(wrapper.find('.card-title').text()).toEqual('A');
    expect(wrapper.find('.card-suit').text()).toEqual('♥️');
  });

  test('it shows a cardback image when shown prop is false', () => {
    const wrapper = shallow(<Card shown={false} card={new deck.Card(14, 'Hearts')} />);
    expect(wrapper.find('.card-title')).toHaveLength(0);
    expect(wrapper.find('.card-suit')).toHaveLength(0);
    expect(wrapper.find('img')).toHaveLength(1);
  })
})

