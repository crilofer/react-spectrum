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
  AriaLabelingProps,
  forwardRefType,
  GlobalDOMAttributes,
  Collection as ICollection,
  Key,
  Node
} from '@react-types/shared';
import {AriaStepListProps, useStepList} from 'react-aria/private/steplist/useStepList';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  DOMRenderProps,
  RenderProps,
  SlotProps,
  StyleProps,
  useContextProps,
  useRenderProps,
  useSlottedContext
} from './utils';
import {Collection} from 'react-aria/Collection';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {CollectionNode} from 'react-aria/private/collections/BaseCollection';
import {CollectionProps, CollectionRendererContext} from './Collection';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import intlMessages from '../intl/*.json';
import {mergeProps} from 'react-aria/mergeProps';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {StepListState, useStepListState} from 'react-stately/private/steplist/useStepListState';
import {useId} from 'react-aria/useId';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useNumberFormatter} from 'react-aria/useNumberFormatter';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useStepListItem} from 'react-aria/private/steplist/useStepListItem';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface StepListProps<T>
  extends
    Omit<AriaStepListProps<T>, 'children' | 'items'>,
    CollectionProps<T>,
    StyleProps,
    SlotProps,
    AriaLabelingProps,
    DOMRenderProps<'ol', undefined>,
    GlobalDOMAttributes<HTMLOListElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-StepList'
   */
  className?: string;
}

export interface StepRenderProps {
  /**
   * Whether the step is currently selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the step is completed.
   *
   * @selector [data-completed]
   */
  isCompleted: boolean;
  /**
   * Whether the step is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the step list is read only. Steps stay focusable but are not activatable.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export interface StepProps
  extends
    RenderProps<StepRenderProps, 'li'>,
    AriaLabelingProps,
    GlobalDOMAttributes<HTMLLIElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Step'
   */
  className?: ClassNameOrFunction<StepRenderProps>;
  /**
   * A unique id for the step. Maps to the collection key (v3 `Item` `key`).
   */
  id?: Key;
}

export const StepListContext =
  createContext<ContextValue<StepListProps<any>, HTMLOListElement>>(null);
export const StepListStateContext = createContext<StepListState<any> | null>(null);

/**
 * A StepList displays a linear sequence of steps, such as a checkout or onboarding flow.
 */
export const StepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepList<
  T extends object
>(props: StepListProps<T>, ref: ForwardedRef<HTMLOListElement>) {
  [props, ref] = useContextProps(props, ref, StepListContext);

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <StepListInner props={props} collection={collection} listRef={ref} />}
    </CollectionBuilder>
  );
});

interface StepListInnerProps<T extends object> {
  props: StepListProps<T>;
  collection: ICollection<Node<T>>;
  listRef: ForwardedRef<HTMLOListElement>;
}

function StepListInner<T extends object>({props, collection, listRef}: StepListInnerProps<T>) {
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let objectRef = useObjectRef(listRef);
  let state = useStepListState({
    ...props,
    collection,
    children: undefined
  });
  let {listProps} = useStepList({...props, children: undefined}, state, objectRef);
  let DOMProps = filterDOMProps(props, {global: true, labelable: true});

  return (
    <dom.ol
      render={props.render}
      ref={objectRef}
      {...mergeProps(DOMProps, listProps)}
      slot={props.slot || undefined}
      style={props.style}
      className={props.className ?? 'react-aria-StepList'}>
      <StepListContext.Provider value={props}>
        <StepListStateContext.Provider value={state}>
          <CollectionRoot collection={collection} />
        </StepListStateContext.Provider>
      </StepListContext.Provider>
    </dom.ol>
  );
}

class StepNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A Step represents an individual item in a `<StepList>`.
 */
export const Step = /*#__PURE__*/ createLeafComponent(
  StepNode,
  function Step(props: StepProps, forwardedRef: ForwardedRef<HTMLLIElement>, item: Node<unknown>) {
    let state = useContext(StepListStateContext)!;
    let {isDisabled: isListDisabled, isReadOnly = false} = useSlottedContext(StepListContext)!;
    let ref = useObjectRef(forwardedRef);
    let linkRef = useObjectRef<HTMLAnchorElement>(null);
    let {stepProps} = useStepListItem({key: item.key}, state, linkRef);

    let isSelected = state.selectedKey === item.key;
    let isCompleted = state.isCompleted(item.key);
    let isDisabled = !!(isListDisabled || state.disabledKeys.has(item.key));
    let values: StepRenderProps = {
      isSelected,
      isCompleted,
      isDisabled,
      isReadOnly
    };

    let renderProps = useRenderProps({
      ...item.props,
      children: item.rendered,
      values,
      defaultClassName: 'react-aria-Step'
    });

    let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
    let numberFormatter = useNumberFormatter();
    let stepStateText = isSelected
      ? stringFormatter.format('steplist.current')
      : isCompleted
        ? stringFormatter.format('steplist.completed')
        : stringFormatter.format('steplist.notCompleted');

    let markerId = useId();
    let stateId = useId();
    let labelId = useId();

    let DOMProps = filterDOMProps(props as any, {global: true, labelable: true});
    delete DOMProps.id;

    return (
      <dom.li
        {...DOMProps}
        {...renderProps}
        ref={ref}
        data-selected={isSelected || undefined}
        data-completed={isCompleted || undefined}
        data-disabled={isDisabled || undefined}
        data-readonly={isReadOnly || undefined}>
        <a {...stepProps} ref={linkRef} aria-labelledby={`${markerId} ${stateId} ${labelId}`}>
          <span id={markerId} data-step-marker="" aria-hidden="true">
            {numberFormatter.format((item.index || 0) + 1)}
          </span>
          <VisuallyHidden id={stateId}>{stepStateText}</VisuallyHidden>
          <span id={labelId} data-step-label="" aria-hidden="true">
            {renderProps.children}
          </span>
          {item.nextKey != null && <span data-step-separator="" aria-hidden="true" />}
        </a>
      </dom.li>
    );
  }
);
