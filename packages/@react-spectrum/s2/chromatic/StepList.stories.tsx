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
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/StepList'
};

export default meta;
type Story = StoryObj<typeof StepList>;

const steps = (
  <>
    <Step id="cat">Cat</Step>
    <Step id="dog">Dog</Step>
    <Step id="monkey">Monkey</Step>
    <Step id="skunk">Skunk</Step>
  </>
);

export const HorizontalS: Story = {
  args: {size: 'S'},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const HorizontalM: Story = {
  args: {selectedKey: 'monkey'},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const HorizontalL: Story = {
  args: {size: 'L', selectedKey: 'monkey', disabledKeys: ['dog']},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const HorizontalXL: Story = {
  args: {size: 'XL', isDisabled: true},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const VerticalS: Story = {
  args: {size: 'S', orientation: 'vertical'},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const VerticalM: Story = {
  args: {orientation: 'vertical', selectedKey: 'monkey'},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const VerticalL: Story = {
  args: {size: 'L', orientation: 'vertical', selectedKey: 'monkey', disabledKeys: ['dog']},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const VerticalXL: Story = {
  args: {size: 'XL', orientation: 'vertical', isDisabled: true},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};

export const Emphasized: Story = {
  args: {isEmphasized: true, selectedKey: 'monkey', disabledKeys: ['dog']},
  render: args => (
    <StepList aria-label="Animals" {...args}>
      {steps}
    </StepList>
  )
};
