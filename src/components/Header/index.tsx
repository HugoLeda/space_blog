import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>
        <img src="/images/Logo.svg"/>
      </h1>
    </header>
  )
}