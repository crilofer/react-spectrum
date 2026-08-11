import {themes} from 'storybook/theming';
import {addons} from 'storybook/manager-api';
import {FORCE_RE_RENDER} from 'storybook/internal/core-events';
// temporary until we have a better place to grab it from
import * as packageJSON from '../../../packages/@adobe/react-spectrum/package.json';

addons.register('theme-switcher', api => {
  let query = window.matchMedia('(prefers-color-scheme: dark)');
  let update = () => {
    let base = query.matches ? themes.dark : themes.normal;
    api.setOptions({
      theme: {
        ...base,
        brandTitle: `React Spectrum<br />v${packageJSON.version}`,
        brandUrl: 'https://react-spectrum.corp.adobe.com',
        // Used by Storybook for sidebar "component" icons (and other accents)
        colorSecondary: '#1EA7FD'
      }
    });
    addons.getChannel().emit(FORCE_RE_RENDER);
  };

  addons.getChannel().on('storiesConfigured', update);
  query.addListener(update);
});
