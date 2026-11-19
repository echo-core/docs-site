import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

import styles from './index.module.css';

const description =
  'A personal technology wiki with how-to guides for Linux, self-hosting, and home networking.';

function RackIllustration() {
  return (
    <div className={styles.illustration} aria-hidden="true">
      <div className={styles.rack}>
        {[2, 1, 0].map((level) => (
          <div className={styles.unit} key={level} style={{top: level * 31}}>
            <div className={styles.topFace} />
            <div className={styles.sideFace} />
            <div className={styles.frontFace}><i /><i /><i /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Masthead() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={styles.masthead}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Personal technology wiki</p>
        <Heading as="h1">{siteConfig.title}</Heading>
        <p className={styles.tagline}>{siteConfig.tagline}</p>
        <p className={styles.introduction}>How-to guides for Linux, self-hosting, and home networking.</p>
        <Link className={styles.welcome} to="/docs/welcome">
          Read the wiki
        </Link>
      </div>
      <RackIllustration />
    </header>
  );
}

function TopicList() {
  const topics = usePluginData('homepage-topics');

  return (
    <section className={styles.topics} aria-labelledby="wiki-topics">
      <Heading as="h2" id="wiki-topics">Browse by topic</Heading>
      <div className={styles.topicGrid}>
        {topics.map(({title, href, articles}) => (
          <div className={styles.topic} key={href}>
            <Heading as="h3">
              <Link to={href}>{title}</Link>
            </Heading>
            <ul className={styles.articleList}>
              {articles.map((article) => (
                <li key={article.href}>
                  <Link to={article.href}>{article.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout description={description}>
      <main className={styles.home}>
        <Masthead />
        <TopicList />
      </main>
    </Layout>
  );
}
