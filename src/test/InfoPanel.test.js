import React from 'react';
import Enzyme, {shallow, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { InfoMessagesQueue } from '../util/infoMessagesQueue';
import InfoPanel from '../components/InfoPanel';

Enzyme.configure({ adapter: new Adapter() });

let q;

describe('InfoPanel component render tests', () => {
  beforeEach(() => {
    q = new InfoMessagesQueue();
  });

  xtest('it renders, with no content initially', () => {
    const wrapper = shallow(<InfoPanel messages={q} />);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.info-message')).toHaveLength(0)
  });

  xtest('it renders one message', () => {
    const wrapper = shallow(
      <InfoPanel
        messages={q.add('test1')}
      />);
    expect(wrapper.find('.info-message')).toHaveLength(1);
    expect(wrapper.text('.info-message')).toContain('test1');
  });

  xtest('it renders 4 messages', () => {
    const msgs = ['test1', 'test2', 'test3', 'test4'];
    const wrapper = mount(
      <InfoPanel
        messages={q.add(...msgs)}
      />);
    wrapper.find('.info-message').forEach((pNode, i) => {
      expect(pNode.text()).toContain(msgs[i]);
    })
  });

})