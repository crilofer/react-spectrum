import {themes} from 'storybook/theming';
import {addons} from 'storybook/manager-api';
import {FORCE_RE_RENDER} from 'storybook/internal/core-events';
// temporary until we have a better place to grab it from
import * as packageJSON from '../../../packages/@adobe/react-spectrum/package.json';

const SECONDARY = '#22c55e';

// Ensure sidebar component icons stay green even if another addon resets the theme.
if (typeof document !== 'undefined') {
  let style = document.createElement('style');
  style.setAttribute('data-rsp-secondary', 'true');
  style.textContent = `
    #icon--component [fill],
    #icon--component path {
      fill: ${SECONDARY} !important;
    }
  `;
  document.head.appendChild(style);
}

addons.register('theme-switcher', api => {
  let query = window.matchMedia('(prefers-color-scheme: dark)');
  let update = () => {
    let theme = {
      ...(query.matches ? themes.dark : themes.normal),
      colorSecondary: SECONDARY,
      brandTitle: `React Spectrum<br />v${packageJSON.version}`,
      brandUrl: 'https://react-spectrum.corp.adobe.com'
    };
    api.setOptions({theme});
    addons.getChannel().emit(FORCE_RE_RENDER);
  };

  addons.getChannel().on('storiesConfigured', update);
  query.addListener(update);
});
