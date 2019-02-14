import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as deck from '../util/deck';
import AI from '../components/AI';
import CardComponent from '../components/Card';

Enzyme.configure({ adapter: new Adapter() });

xdescribe('AI component render tests', () => {
  test('it renders', () => {
    const wrapper = shallow(<AI data={{ hand: [], id: 'ai1' }} showCards={false} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it contains 2 Card components when given 2 card objects', () => {
    const wrapper = mount(
      <AI
        data={{
          hand: [new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')],
          id: 'ai1',
          active: true,
        }}
        showCards={true}
      />
    );
    expect(wrapper.find(CardComponent)).toHaveLength(2);
    expect(wrapper.find('.card-title')).toHaveLength(2);
  });

  test('it does not display card fronts when it is not meant to', () => {
    const wrapper = mount(
      <AI
        data={{
          hand: [new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')],
          id: 'ai1',
          active: true,
        }}
        showCards={false}
      />
    );
    expect(wrapper.find('.card-title')).toHaveLength(0);
    expect(wrapper.find('img')).toHaveLength(2);
  });

  xtest('it displays "Folded!" when the AI has folded', () => {
    const wrapper = mount(
      <AI
        data={{
          hand: [new deck.Card(14, 'Hearts'), new deck.Card(13, 'Hearts')],
          id: 'ai1',
          active: false,
        }}
        showCards={true}
      />
    );
    expect(wrapper.find('p')).toHaveLength(1);
    expect(wrapper.text('.card-title')).toMatch(/.?Folded!.?/);
  });
});
