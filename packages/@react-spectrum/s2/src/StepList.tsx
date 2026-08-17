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

import {
  Step as AriaStep,
  StepListProps as AriaStepListProps,
  StepProps as AriaStepProps,
  StepList as RACStepList
} from 'react-aria-components/StepList';
import {ContextValue} from 'react-aria-components/slots';
import {controlFont, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {css} from '../style/style-macro' with {type: 'macro'};
import {DOMRef, DOMRefValue, GlobalDOMAttributes, Orientation} from '@react-types/shared';
import {forwardRefType} from './types';
import {size, style} from '../style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface StepListStyleProps {
  /**
   * The size of the step list.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * The orientation of the step list.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /**
   * Whether the step list should be displayed with an emphasized style.
   *
   * @default false
   */
  isEmphasized?: boolean;
}

export interface StepListProps<T extends object>
  extends
    Omit<
      AriaStepListProps<T>,
      'children' | 'style' | 'className' | 'render' | keyof GlobalDOMAttributes
    >,
    StepListStyleProps,
    StyleProps {
  /** The children of the StepList. */
  children: ReactNode | ((item: T) => ReactNode);
}

export interface StepProps extends Omit<
  AriaStepProps,
  'children' | 'style' | 'className' | 'render' | keyof GlobalDOMAttributes
> {
  /** The children of the step. */
  children: ReactNode;
}

export const StepListContext =
  createContext<ContextValue<Partial<StepListProps<any>>, DOMRefValue<HTMLOListElement>>>(null);

const InternalStepListContext = createContext<StepListStyleProps>({});

const listStyles = style<StepListStyleProps>(
  {
    display: 'flex',
    flexDirection: {
      default: 'row',
      orientation: {
        vertical: 'column'
      }
    },
    flexWrap: 'nowrap',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    gap: {
      default: 16,
      size: {
        S: size(10),
        M: 16,
        L: 20,
        XL: 24
      },
      orientation: {
        vertical: 0
      }
    },
    font: controlFont()
  },
  getAllowedOverrides()
);

const itemStyles = style<
  StepListStyleProps & {
    isSelected?: boolean;
    isCompleted?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }
>({
  display: 'flex',
  minWidth: 0,
  color: {
    default: 'neutral-subdued',
    isCompleted: 'neutral',
    isSelected: {
      default: 'neutral',
      isEmphasized: 'accent'
    },
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isCompleted: 'LinkText',
      isSelected: 'Highlight',
      isDisabled: 'GrayText'
    }
  }
});

const innerStyles = css(`
  & a {
    display: flex;
    align-items: baseline;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    outline: none;
    cursor: default;
  }
  & a:not([aria-disabled]) {
    cursor: pointer;
  }
  & [data-step-marker] {
    box-sizing: border-box;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid currentColor;
    font-weight: bold;
  }
  &[data-completed] [data-step-marker],
  &[data-selected] [data-step-marker] {
    border-style: none;
    background: currentColor;
    color: var(--spectrum-white, #fff);
  }
  & a:focus-visible [data-step-marker] {
    outline: 2px solid var(--spectrum-focus-indicator-color, Highlight);
    outline-offset: 2px;
  }
  & [data-step-separator] {
    flex: 0 0 auto;
  }
  & [data-step-separator]::before {
    content: "›";
    display: inline-block;
  }
  :dir(rtl) & [data-step-separator]::before {
    transform: scaleX(-1);
  }
`);

const verticalInnerStyles = css(`
  & a {
    display: grid;
    grid-template-areas: "marker label" "line label";
    grid-template-columns: min-content 1fr;
    align-items: start;
    column-gap: 8px;
  }
  & [data-step-marker] {
    grid-area: marker;
  }
  & [data-step-label] {
    grid-area: label;
  }
  & [data-step-separator] {
    grid-area: line;
    justify-self: center;
    width: 2px;
    min-height: 32px;
    background-image: linear-gradient(currentColor 60%, transparent 0%);
    background-size: 2px 10px;
    background-repeat: repeat-y;
  }
  & [data-step-separator]::before {
    content: none;
  }
`);

const markerSizeStyles = css(`
  &[data-size=S] [data-step-marker] {
    width: 8px;
    height: 8px;
    font-size: 0;
  }
  &[data-size=M] [data-step-marker] {
    width: 16px;
    height: 16px;
    font-size: 12px;
  }
  &[data-size=L] [data-step-marker] {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }
  &[data-size=XL] [data-step-marker] {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  &[data-size=M]:not([data-completed]):not([data-selected]) [data-step-marker] {
    color: transparent;
  }
`);

/** A StepList displays a linear sequence of steps, such as a checkout or onboarding flow. */
export const StepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepList<
  T extends object
>(props: StepListProps<T>, ref: DOMRef<HTMLOListElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, StepListContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    size = 'M',
    orientation = 'horizontal',
    isEmphasized = false,
    children,
    ...otherProps
  } = props;

  return (
    <InternalStepListContext.Provider value={{size, orientation, isEmphasized}}>
      <RACStepList
        {...otherProps}
        ref={domRef}
        style={UNSAFE_style}
        data-orientation={orientation}
        data-size={size}
        className={
          UNSAFE_className +
          listStyles({size, orientation}, styles) +
          ' ' +
          markerSizeStyles
        }>
        {children}
      </RACStepList>
    </InternalStepListContext.Provider>
  );
});

/** An individual Step for a StepList. */
export const Step = /*#__PURE__*/ (forwardRef as forwardRefType)(function Step(
  {children, ...props}: StepProps,
  ref: DOMRef<HTMLLIElement>
) {
  let {
    size = 'M',
    orientation = 'horizontal',
    isEmphasized = false
  } = useContext(InternalStepListContext) ?? {};
  let domRef = useDOMRef(ref);
  return (
    <AriaStep
      {...props}
      ref={domRef}
      data-size={size}
      className={({isSelected, isCompleted, isDisabled, isReadOnly}) =>
        itemStyles({
          size,
          orientation,
          isEmphasized,
          isSelected,
          isCompleted,
          isDisabled,
          isReadOnly
        }) +
        ' ' +
        innerStyles +
        (orientation === 'vertical' ? ' ' + verticalInnerStyles : '') +
        ' ' +
        markerSizeStyles
      }>
      {children}
    </AriaStep>
  );
});
