import clsx from 'clsx';

import styles from './styles.module.css';

export default function IconDarkMode({className}) {
  return <span aria-hidden="true" className={clsx(className, styles.moon)} />;
}
