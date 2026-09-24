import styles from './EmptyState.module.css';

function EmptyState({ 
  title = 'Пока ничего нет', 
  description = 'Здесь появятся данные, когда вы добавите первую запись.', 
  actionLabel, 
  onAction,
  icon = '📭'
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {/* Кнопка действия рендерится только если переданы и текст, и обработчик */}
      {actionLabel && onAction && (
        <button className={styles.actionButton} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;