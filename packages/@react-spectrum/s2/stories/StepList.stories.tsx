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

import type {Meta, StoryObj} from '@storybook/react';
import {Step, StepList} from '../src/StepList';

const meta: Meta<typeof StepList> = {
  component: StepList,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    children: {table: {disable: true}}
  },
  tags: ['autodocs'],
  title: 'StepList'
};

export default meta;
type Story = StoryObj<typeof StepList>;

export const Example: Story = {
  render: args => (
    <StepList aria-label="Checkout" defaultLastCompletedStep="account" {...args}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
      <Step id="review">Review</Step>
    </StepList>
  )
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    defaultLastCompletedStep: 'account',
    defaultSelectedKey: 'shipping'
  },
  render: args => (
    <StepList aria-label="Checkout" {...args}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
      <Step id="review">Review</Step>
    </StepList>
  )
};

export const Emphasized: Story = {
  args: {
    isEmphasized: true,
    defaultLastCompletedStep: 'account',
    defaultSelectedKey: 'shipping'
  },
  render: args => (
    <StepList aria-label="Checkout" {...args}>
      <Step id="account">Account</Step>
      <Step id="shipping">Shipping</Step>
      <Step id="payment">Payment</Step>
    </StepList>
  )
};

export const Sizes: Story = {
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      {(['S', 'M', 'L', 'XL'] as const).map(size => (
        <StepList
          key={size}
          aria-label={`Checkout ${size}`}
          size={size}
          defaultLastCompletedStep="account"
          {...args}>
          <Step id="account">Account</Step>
          <Step id="shipping">Shipping</Step>
          <Step id="payment">Payment</Step>
        </StepList>
      ))}
    </div>
  )
};
