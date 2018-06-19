import {PartsFieldComponent} from '../redux/PartsField';
import * as common from '../common';
import {fromJS} from 'immutable';
import React from "react";
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

let field;
let selectPart;

beforeEach(() => {
    field = fromJS(common.getField(2));
    selectPart = jest.fn();
});


test('test PartsField Component', () => {
    const component = renderer.create(
        <PartsFieldComponent
            player={0}
            field={field}
            selectedGroupId={-2}
            selectPart={selectPart}
        />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('test click', () => {
    const wrapper = shallow(<PartsFieldComponent
        player={0}
        field={field}
        selectedGroupId={-2}
        selectPart={selectPart}
    />);
    expect(wrapper.find('rect').length).toBe(4);
    wrapper.find('rect').first().simulate('click');
    expect(selectPart.mock.calls.length).toBe(1);
});

