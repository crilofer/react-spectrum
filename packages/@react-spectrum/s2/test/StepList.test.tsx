/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act} from '@testing-library/react';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {Step, StepList} from '../src/StepList';
import userEvent from '@testing-library/user-event';

describe('S2 StepList', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it('renders a Spectrum 2 stepper and allows returning to a completed step', async function () {
    let onSelectionChange = jest.fn();
    let {getByRole, getAllByRole} = render(
      <StepList
        aria-label="Checkout"
        defaultLastCompletedStep="account"
        defaultSelectedKey="shipping"
        onSelectionChange={onSelectionChange}>
        <Step id="account">Account</Step>
        <Step id="shipping">Shipping</Step>
        <Step id="payment">Payment</Step>
      </StepList>
    );

    expect(getByRole('list')).toBeInTheDocument();
    let steps = getAllByRole('link');
    expect(steps).toHaveLength(3);
    expect(steps[1]).toHaveAttribute('aria-current', 'step');

    await user.click(steps[0]);
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
    expect(onSelectionChange).toHaveBeenCalledWith('account');
  });

  it('supports size, orientation, and emphasis props', function () {
    let {getByRole, rerender} = render(
      <StepList aria-label="Checkout" size="L" orientation="vertical" isEmphasized>
        <Step id="account">Account</Step>
        <Step id="shipping">Shipping</Step>
      </StepList>
    );
    let list = getByRole('list');
    expect(list).toHaveAttribute('data-orientation', 'vertical');
    expect(list).toHaveAttribute('data-size', 'L');

    rerender(
      <StepList aria-label="Checkout" size="S" orientation="horizontal">
        <Step id="account">Account</Step>
        <Step id="shipping">Shipping</Step>
      </StepList>
    );
    list = getByRole('list');
    expect(list).toHaveAttribute('data-orientation', 'horizontal');
    expect(list).toHaveAttribute('data-size', 'S');
  });
});
