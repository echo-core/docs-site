import OriginalIcon from '@theme-original/DocCard/Heading/Icon';

import styles from './styles.module.css';

export default function DocCardHeadingIcon(props) {
  if (props.item.type !== 'category' || props.icon !== '🗃') {
    return <OriginalIcon {...props} />;
  }

  return (
    <OriginalIcon
      {...props}
      icon={
        <span aria-hidden="true" className={styles.badge}>
          <span className={styles.folder} />
        </span>
      }
    />
  );
}
