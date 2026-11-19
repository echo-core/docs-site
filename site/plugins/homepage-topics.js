function collectArticleIds(items) {
  return items.flatMap((item) => {
    if (item.type === 'doc' || item.type === 'ref') {
      return [item.id];
    }
    if (item.type === 'category') {
      const descendants = collectArticleIds(item.items);
      return item.link?.type === 'doc'
        ? [item.link.id, ...descendants]
        : descendants;
    }
    return [];
  });
}

export default function homepageTopics() {
  return {
    name: 'homepage-topics',
    allContentLoaded({allContent, actions}) {
      const {loadedVersions} = allContent['docusaurus-plugin-content-docs'].default;
      const {docs, sidebars} = loadedVersions.find((version) => version.isLast);
      const docsById = new Map(docs.map((doc) => [doc.id, doc]));
      const topics = [];

      for (const category of sidebars.tutorialSidebar) {
        if (category.type !== 'category' || category.link?.type !== 'generated-index') {
          continue;
        }
        const articles = [...new Set(collectArticleIds(category.items))]
          .map((id) => docsById.get(id))
          .filter((doc) => doc && !doc.unlisted)
          .map((doc) => ({title: doc.title, href: doc.permalink}));
        topics.push({title: category.label, href: category.link.permalink, articles});
      }

      actions.setGlobalData(topics);
    },
  };
}
