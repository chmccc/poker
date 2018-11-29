import React from 'react';
import Enzyme, {shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as deck from '../util/deck';
import PlayerDashboard from '../components/PlayerDashboard';
import Card from '../components/Card';

Enzyme.configure({ adapter: new Adapter() });

describe('PlayerDashboard component render tests', () => {
  test('it renders', () => {
    const wrapper = shallow(<PlayerDashboard data={{ hand: [] }}/>);
    expect(wrapper.exists()).toBe(true);
  });

  test('it renders Cards when given player hand data', () => {
    const wrapper = mount(<PlayerDashboard data={{ hand: [new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')] }} />);
    expect(wrapper.find(Card)).toHaveLength(2);
  });
})