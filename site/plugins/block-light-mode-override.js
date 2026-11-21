export default function blockLightModeOverride() {
  return {
    name: 'block-light-mode-override',
    injectHtmlTags() {
      // Run before the classic theme processes data attributes from the URL.
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: `(() => {
              const url = new URL(window.location.href);
              for (const key of [...url.searchParams.keys()]) {
                if (key.toLowerCase() === 'docusaurus-data-theme') {
                  url.searchParams.delete(key);
                }
              }
              if (url.href !== window.location.href) {
                window.history.replaceState(window.history.state, '', url);
              }
            })();`,
          },
        ],
      };
    },
  };
}
