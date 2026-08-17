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

import {Key} from '@react-types/shared';
import {Meta, StoryObj} from '@storybook/react';
import React, {useState} from 'react';
import {Step, StepList} from '../src/StepList';
import './styles.css';

export default {
  title: 'React Aria Components/StepList',
  component: StepList
} as Meta<typeof StepList>;

export type StepListStory = StoryObj<typeof StepList>;

export const StepListExample: StepListStory = {
  render: (args: any) => (
    <StepList aria-label="Checkout" {...args}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
    </StepList>
  )
};

interface ItemValue {
  id: string;
  name: string;
}

let items: Array<ItemValue> = [
  {id: 'account', name: 'Account'},
  {id: 'shipping', name: 'Shipping'},
  {id: 'payment', name: 'Payment'},
  {id: 'review', name: 'Review'}
];

export const DynamicStepListExample: StepListStory = {
  render: (args: any) => (
    <StepList aria-label="Checkout" {...args} items={items} defaultLastCompletedStep="shipping">
      {(item: ItemValue) => <Step id={item.id}>{item.name}</Step>}
    </StepList>
  )
};

export const ControlledStepListExample: StepListStory = {
  render: (args: any) => <ControlledStepList {...args} />
};

function ControlledStepList(args: any) {
  let [selectedKey, setSelectedKey] = useState<Key>('shipping');
  let [lastCompletedStep, setLastCompletedStep] = useState<Key | null>('account');
  return (
    <StepList
      {...args}
      aria-label="Checkout"
      selectedKey={selectedKey}
      onSelectionChange={setSelectedKey}
      lastCompletedStep={lastCompletedStep}
      onLastCompletedStepChange={setLastCompletedStep}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
    </StepList>
  );
}

export const DisabledStepListExample: StepListStory = {
  args: {
    isDisabled: true,
    defaultLastCompletedStep: 'account',
    defaultSelectedKey: 'shipping'
  },
  render: (args: any) => (
    <StepList aria-label="Checkout" {...args}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
    </StepList>
  )
};

export const ReadOnlyStepListExample: StepListStory = {
  args: {
    isReadOnly: true,
    defaultLastCompletedStep: 'account',
    defaultSelectedKey: 'shipping'
  },
  render: (args: any) => (
    <StepList aria-label="Checkout" {...args}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
    </StepList>
  )
};
