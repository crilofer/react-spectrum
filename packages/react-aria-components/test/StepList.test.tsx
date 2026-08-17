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
import {pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {Step, StepList} from '../src/StepList';
import userEvent from '@testing-library/user-event';

const items = [
  {id: 'step-one', name: 'Step 1'},
  {id: 'step-two', name: 'Step 2'},
  {id: 'step-three', name: 'Step 3'},
  {id: 'step-four', name: 'Step 4'}
];

function renderStepList(props: React.ComponentProps<typeof StepList> = {}) {
  return render(
    <StepList id="steplist-id" aria-label="steplist-test" {...props}>
      <Step id="step-one">Step 1</Step>
      <Step id="step-two">Step 2</Step>
      <Step id="step-three">Step 3</Step>
      <Step id="step-four">Step 4</Step>
    </StepList>
  );
}

describe('StepList', function () {
  let onSelectionChange = jest.fn();
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
    onSelectionChange.mockReset();
  });

  it('renders with default class names and selects the first step', function () {
    const tree = renderStepList({onSelectionChange});
    const stepList = tree.getByRole('list');
    expect(stepList).toHaveClass('react-aria-StepList');
    expect(stepList).toHaveAttribute('id', 'steplist-id');
    expect(stepList).toHaveAttribute('aria-label', 'steplist-test');

    const stepListItems = tree.getAllByRole('link');
    expect(stepListItems.length).toBe(4);
    for (let item of tree.getAllByRole('listitem')) {
      expect(item).toHaveClass('react-aria-Step');
    }

    const stepOne = stepListItems[0];
    expect(stepOne).toHaveAttribute('aria-current', 'step');
    expect(stepOne).toHaveAttribute('tabIndex', '0');
    expect(stepOne.textContent).not.toContain('Completed');
    expect(onSelectionChange).toHaveBeenCalledWith('step-one');

    for (let i = 1; i < stepListItems.length; i++) {
      expect(stepListItems[i]).toHaveAttribute('aria-disabled', 'true');
      expect(stepListItems[i].textContent).toContain('Not');
      expect(stepListItems[i]).not.toHaveAttribute('tabindex');
    }
  });

  it('supports a dynamic items collection', function () {
    const tree = render(
      <StepList aria-label="steplist-test" items={items} defaultLastCompletedStep="step-two">
        {item => <Step id={item.id}>{item.name}</Step>}
      </StepList>
    );
    const stepListItems = tree.getAllByRole('link');
    expect(stepListItems.map(item => item.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Step 1'),
        expect.stringContaining('Step 2'),
        expect.stringContaining('Step 3'),
        expect.stringContaining('Step 4')
      ])
    );
    expect(stepListItems[2]).toHaveAttribute('aria-current', 'step');
  });

  it('includes step state text in the accessible name via aria-labelledby', function () {
    const tree = renderStepList({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      onSelectionChange
    });
    const stepListItems = tree.getAllByRole('link');

    for (let link of stepListItems) {
      let labelledby = link.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      let ids = labelledby!.split(' ');
      expect(ids).toHaveLength(3);
      for (let id of ids) {
        expect(document.getElementById(id)).toBeTruthy();
      }
    }

    let currentStep = stepListItems[2];
    let currentIds = currentStep.getAttribute('aria-labelledby')!.split(' ');
    expect(document.getElementById(currentIds[1])!.textContent).toContain('Current');

    let completedStep = stepListItems[0];
    let completedIds = completedStep.getAttribute('aria-labelledby')!.split(' ');
    expect(document.getElementById(completedIds[1])!.textContent).toContain('Completed');

    let notCompletedStep = stepListItems[3];
    let notCompletedIds = notCompletedStep.getAttribute('aria-labelledby')!.split(' ');
    expect(document.getElementById(notCompletedIds[1])!.textContent).toContain('Not');
  });

  it('exposes render props and data attributes on each step', function () {
    const tree = renderStepList({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      disabledKeys: ['step-one']
    });
    const steps = tree.getAllByRole('listitem');
    expect(steps[0]).toHaveAttribute('data-completed');
    expect(steps[0]).toHaveAttribute('data-disabled');
    expect(steps[2]).toHaveAttribute('data-selected');
    expect(steps[2]).not.toHaveAttribute('data-disabled');
    expect(steps[3]).not.toHaveAttribute('data-selected');
    expect(steps[3]).not.toHaveAttribute('data-completed');
  });

  it('allows the user to click completed steps and the immediate next step only', async function () {
    const tree = renderStepList({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    const stepOne = stepListItems[0];
    expect(stepOne).not.toHaveAttribute('aria-current');
    expect(stepOne.textContent).toContain('Completed');
    await user.click(stepOne);
    expect(stepOne).toHaveAttribute('aria-current', 'step');
    expect(onSelectionChange).toHaveBeenCalledWith('step-one');

    const stepThree = stepListItems[2];
    await user.click(stepThree);
    expect(stepThree).toHaveAttribute('aria-current');
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-three');
    onSelectionChange.mockReset();

    const stepFour = stepListItems[3];
    await user.click(stepFour);
    expect(stepFour).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('allows the user to change the selected step via tab and enter, not arrows', async function () {
    const tree = renderStepList({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    expect(stepListItems[2]).toHaveAttribute('aria-current', 'step');

    await user.tab();
    expect(document.activeElement).toBe(stepListItems[0]);
    await user.tab();
    expect(document.activeElement).toBe(stepListItems[1]);
    await user.tab();
    expect(document.activeElement).toBe(stepListItems[2]);

    await user.tab({shift: true});
    expect(document.activeElement).toBe(stepListItems[1]);
    await user.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('step-two');
    expect(stepListItems[1]).toHaveAttribute('aria-current');
    onSelectionChange.mockReset();

    await user.keyboard('{ArrowUp}');
    expect(stepListItems[1]).toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should not allow the user to click disabled steps', async function () {
    const tree = renderStepList({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      disabledKeys: ['step-one'],
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    await user.click(stepListItems[0]);
    expect(stepListItems[0]).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should disable all steps when the step list is disabled', async function () {
    const tree = renderStepList({
      defaultLastCompletedStep: 'step-two',
      isDisabled: true,
      onSelectionChange
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-three');
    onSelectionChange.mockReset();
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    for (let stepListItem of stepListItems) {
      expect(stepListItem).toHaveAttribute('aria-disabled', 'true');
    }

    expect(stepListItems[2]).toHaveAttribute('aria-current');
    await user.click(stepListItems[1]);
    expect(stepListItems[1]).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should not allow the user to click previous steps when the step list is readonly', async function () {
    const tree = renderStepList({
      defaultSelectedKey: 'step-four',
      defaultLastCompletedStep: 'step-three',
      isReadOnly: true,
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    for (let stepListItem of stepListItems) {
      expect(stepListItem).toHaveAttribute('aria-disabled', 'true');
    }
    expect(tree.getAllByRole('listitem')[0]).toHaveAttribute('data-readonly');

    expect(stepListItems[3]).toHaveAttribute('aria-current');
    await user.click(stepListItems[0]);
    expect(stepListItems[0]).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('fires onLastCompletedStepChange when selection jumps ahead of the last completed step', function () {
    const onLastCompletedStepChange = jest.fn();
    const {getByLabelText, rerender} = render(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        defaultLastCompletedStep="step-one"
        onLastCompletedStepChange={onLastCompletedStepChange}
        onSelectionChange={onSelectionChange}
        selectedKey="step-one">
        <Step id="step-one">Step 1</Step>
        <Step id="step-two">Step 2</Step>
        <Step id="step-three">Step 3</Step>
        <Step id="step-four">Step 4</Step>
      </StepList>
    );
    const stepList = getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    expect(stepListItems[0]).toHaveAttribute('aria-current');
    expect(onLastCompletedStepChange).not.toHaveBeenCalled();

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        selectedKey="step-three">
        <Step id="step-one">Step 1</Step>
        <Step id="step-two">Step 2</Step>
        <Step id="step-three">Step 3</Step>
        <Step id="step-four">Step 4</Step>
      </StepList>
    );

    expect(onLastCompletedStepChange).toHaveBeenCalledWith('step-two');
    expect(stepListItems[1].textContent).toContain('Completed');
  });

  it('does not update the selected step when last completed step is controlled', function () {
    const onLastCompletedStepChange = jest.fn();
    const {getByLabelText, rerender} = render(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        lastCompletedStep="step-one"
        onSelectionChange={onSelectionChange}
        onLastCompletedStepChange={onLastCompletedStepChange}>
        <Step id="step-one">Step 1</Step>
        <Step id="step-two">Step 2</Step>
        <Step id="step-three">Step 3</Step>
        <Step id="step-four">Step 4</Step>
      </StepList>
    );
    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-two');
    const stepList = getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        onSelectionChange={onSelectionChange}
        lastCompletedStep="step-three">
        <Step id="step-one">Step 1</Step>
        <Step id="step-two">Step 2</Step>
        <Step id="step-three">Step 3</Step>
        <Step id="step-four">Step 4</Step>
      </StepList>
    );

    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(stepListItems[1]).toHaveAttribute('aria-current');
    expect(stepListItems[2].textContent).toContain('Completed');
  });

  it('supports a custom className and DOM props', function () {
    const tree = render(
      <StepList className="my-steplist" data-foo="bar" aria-label="steplist-test">
        <Step className="my-step" data-bar="foo" id="one">
          One
        </Step>
      </StepList>
    );
    expect(tree.getByRole('list')).toHaveClass('my-steplist');
    expect(tree.getByRole('list')).toHaveAttribute('data-foo', 'bar');
    expect(tree.getByRole('listitem')).toHaveClass('my-step');
    expect(tree.getByRole('listitem')).toHaveAttribute('data-bar', 'foo');
  });
});
