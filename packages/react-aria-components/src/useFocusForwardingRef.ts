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

import {ForwardedRef, MutableRefObject} from 'react';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useObjectRef} from 'react-aria/useObjectRef';

const focusForwardingPatched = new WeakSet<HTMLElement>();

/**
 * Overrides an element's focus() so that calling it focuses the first tabbable
 * descendant instead. This keeps the forwarded ref on the outer element (for styling
 * and layout) while making form libraries that call `ref.focus()` work with compound
 * controls like DateInput.
 */
function patchFocusToFirstTabbable(element: HTMLElement): void {
  if (focusForwardingPatched.has(element)) {
    return;
  }
  focusForwardingPatched.add(element);

  let originalFocus = element.focus.bind(element);
  // HTMLElement.prototype.focus may be an accessor (e.g. after useFocusVisible patches it),
  // so assignment can throw. Define an own property instead.
  Object.defineProperty(element, 'focus', {
    configurable: true,
    value(options?: FocusOptions) {
      // Date/time segments use role="spinbutton". Prefer those, then any other tabbable.
      let first =
        element.querySelector<HTMLElement>('[role="spinbutton"]') ??
        element.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
      if (first) {
        first.focus(options);
      } else {
        originalFocus(options);
      }
    }
  });
}

/**
 * Returns a ref that forwards focus() calls on the mounted element to its first
 * tabbable descendant. The ref still points at the outer element.
 */
export function useFocusForwardingRef<E extends HTMLElement>(
  ref: ForwardedRef<E> | undefined
): MutableRefObject<E | null> {
  let objRef = useObjectRef(ref);
  useLayoutEffect(() => {
    if (objRef.current) {
      patchFocusToFirstTabbable(objRef.current);
    }
  });
  return objRef;
}
