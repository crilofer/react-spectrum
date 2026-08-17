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

import {screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('StepList SSR', function () {
  it('should render without errors', async function () {
    await testSSR(
      __filename,
      `
      import {StepList, Step} from '../exports/index.ts';

      <React.StrictMode>
        <StepList aria-label="Checkout">
          <Step id="account">Account</Step>
          <Step id="shipping">Shipping</Step>
          <Step id="payment">Payment</Step>
        </StepList>
      </React.StrictMode>
    `,
      () => {
        let options = screen.getAllByRole('listitem');
        expect(options.map(o => o.textContent)).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Account'),
            expect.stringContaining('Shipping'),
            expect.stringContaining('Payment')
          ])
        );
      }
    );

    let options = screen.getAllByRole('listitem');
    expect(options.map(o => o.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Account'),
        expect.stringContaining('Shipping'),
        expect.stringContaining('Payment')
      ])
    );
  });
});
