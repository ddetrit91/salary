import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './OnboardingTour.module.css';

export const TOUR_STEPS = [
  {
    id: 'welcome',
    target: '[data-tour="logo"]',
    title: 'Добро пожаловать в Salary Tracker!',
    icon: '👋',
    preferredPlacement: 'bottom',
    description: {
      where: 'Главная панель вашего финансового трекера.',
      how: 'Сервис автоматически объединяет ваши доходы и траты в единую систему без сложной бухгалтерии.',
      benefit: 'Вы избавляетесь от финансового хаоса, точно знаете свой свободный остаток и перестаёте терять деньги на спонтанных покупках.',
    },
  },
  {
    id: 'balance-cards',
    target: '[data-tour="balance-cards"]',
    title: 'Карточки баланса и свободный капитал',
    icon: '💳',
    preferredPlacement: 'bottom',
    description: {
      where: 'Верхний блок карточек на главной странице.',
      how: 'Зелёная карточка считает все поступления, красная — все траты, а синяя мгновенно вычисляет ваш чистый остаток (Баланс = Доходы − Расходы).',
      benefit: 'В любую секунду вы точно знаете, сколько свободных денег у вас на руках, исключая риск влезть в долги или кредитки.',
    },
  },
  {
    id: 'add-button',
    target: '[data-tour="add-button"]',
    title: 'Быстрое добавление за 5 секунд',
    icon: '➕',
    preferredPlacement: 'left',
    description: {
      where: 'Круглая плавающая кнопка «+» в правом нижнем углу экрана.',
      how: 'Нажмите «+», выберите «Расход» или «Доход», укажите сумму и выберите категорию (продукты, аренда, зарплата). Можно добавить комментарий.',
      benefit: 'Внесение покупки занимает всего несколько секунд прямо на кассе магазина. Ни один чек не потеряется и не забудется.',
    },
  },
  {
    id: 'nav-history',
    target: '[data-tour="nav-history"]',
    title: 'История транзакций и экспорт в Excel',
    icon: '📜',
    preferredPlacement: 'bottom',
    description: {
      where: 'Вкладка «История» в верхнем меню.',
      how: 'Хранит полный список операций с поиском по комментариям, фильтрами по датам и категориям, а также кнопкой выгрузки таблицы в Excel.',
      benefit: 'Вы всегда можете поднять траты за любой прошлый месяц, сверить выписку по банку или сохранить аккуратный отчёт для семейного бюджета.',
    },
  },
  {
    id: 'nav-analytics',
    target: '[data-tour="nav-analytics"]',
    title: 'Аналитика и поиск «утечек» бюджета',
    icon: '📊',
    preferredPlacement: 'bottom',
    description: {
      where: 'Вкладка «Аналитика» в верхнем меню.',
      how: 'Интерактивная круговая диаграмма показывает долю каждой категории трат, а столбчатый график — динамику доходов и расходов помесячно.',
      benefit: 'Позволяет наглядно обнаружить скрытые переплаты (подписки, фастфуд, такси) и легко высвободить средства для важных накоплений.',
    },
  },
  {
    id: 'user-controls',
    target: '[data-tour="user-controls"]',
    title: 'Тёмная тема и подсказки всегда под рукой',
    icon: '🌙',
    preferredPlacement: 'bottom',
    description: {
      where: 'Правый блок в шапке сайта.',
      how: 'Кнопка 🌙/☀️ мгновенно переключает день и ночь, а кнопка 💡 «Обучение» позволяет заново открыть этот тур в любой момент.',
      benefit: 'Комфорт для глаз в вечернее время суток со смартфона или ноутбука, а подсказки по функциям сервиса доступны в один клик.',
    },
  },
];

const ONBOARDING_KEY = 'salary_tracker_onboarding_completed';

export function OnboardingTour({ isOpen, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({
    top: 0,
    left: 0,
    placement: 'bottom',
    arrowTop: null,
    arrowLeft: null,
  });
  const tooltipRef = useRef(null);

  const step = TOUR_STEPS[currentStep];

  // Вычисление позиции элемента и тултипа
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(el);
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
      borderRadius: computedStyle.borderRadius || '12px',
    });

    // Плавный скролл к элементу, если он не зафиксирован и не виден полностью
    const inView =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth;

    if (!inView && computedStyle.position !== 'fixed') {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    // Измеряем реальные размеры карточки тултипа (если уже отрисована)
    const cardEl = tooltipRef.current;
    const measuredWidth = cardEl ? cardEl.offsetWidth : 0;
    const measuredHeight = cardEl ? cardEl.offsetHeight : 0;

    const tooltipWidth = measuredWidth || Math.min(420, window.innerWidth - 32);
    // По умолчанию берём реальную высоту карточки (около 400-430px для подробных шагов)
    const tooltipHeight = measuredHeight || 420;
    const margin = 18;
    const padding = 16;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    let placement = step.preferredPlacement || 'bottom';

    // Адаптивный выбор стороны, если предпочитаемое направление не помещается
    if (placement === 'left') {
      if (spaceLeft < tooltipWidth + margin) {
        placement = spaceAbove >= spaceBelow ? 'top' : 'bottom';
      }
    } else if (placement === 'right') {
      if (spaceRight < tooltipWidth + margin) {
        placement = spaceAbove >= spaceBelow ? 'top' : 'bottom';
      }
    } else if (placement === 'bottom') {
      if (spaceBelow < tooltipHeight + margin && spaceAbove > spaceBelow) {
        placement = 'top';
      }
    } else if (placement === 'top') {
      if (spaceAbove < tooltipHeight + margin && spaceBelow > spaceAbove) {
        placement = 'bottom';
      }
    }

    let top = 0;
    let left = 0;

    if (placement === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (placement === 'top') {
      top = rect.top - tooltipHeight - margin;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - margin;
    } else if (placement === 'right') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + margin;
    }

    // Строгая защита: нижняя часть карточки НИКОГДА не должна уходить вниз экрана
    // Верхняя часть также не может выходить выше верхнего края
    const maxTop = Math.max(padding, window.innerHeight - tooltipHeight - padding);
    top = Math.max(padding, Math.min(top, maxTop));

    const maxLeft = Math.max(padding, window.innerWidth - tooltipWidth - padding);
    left = Math.max(padding, Math.min(left, maxLeft));

    // Вычисляем положение стрелочки так, чтобы она точно указывала на центр целевого элемента
    let arrowTop = null;
    let arrowLeft = null;

    if (placement === 'left' || placement === 'right') {
      const targetCenterY = rect.top + rect.height / 2;
      arrowTop = targetCenterY - top - 7;
      arrowTop = Math.max(20, Math.min(arrowTop, tooltipHeight - 34));
    } else {
      const targetCenterX = rect.left + rect.width / 2;
      arrowLeft = targetCenterX - left - 7;
      arrowLeft = Math.max(20, Math.min(arrowLeft, tooltipWidth - 34));
    }

    setTooltipPos({ top, left, placement, arrowTop, arrowLeft });
  }, [isOpen, step]);

  // Слушатель скролла, ресайза окна и отслеживание изменения размера самого тултипа
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });
    const timer = setTimeout(updatePosition, 60);

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && tooltipRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });
      resizeObserver.observe(tooltipRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isOpen, currentStep, updatePosition]);

  const handleClose = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setCurrentStep(0);
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Навигация клавишами стрелок и Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleNext, handlePrev]);

  if (!isOpen || !step) return null;

  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className={styles.tourOverlay} role="dialog" aria-modal="true">
      {/* Затемняющий фон */}
      <div className={styles.backdrop} onClick={handleClose} />

      {/* Выделяющая рамка со свечением вокруг целевого элемента */}
      {targetRect && (
        <div
          className={styles.spotlight}
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            borderRadius: targetRect.borderRadius,
          }}
        />
      )}

      {/* Карточка тултипа со стрелкой */}
      <div
        ref={tooltipRef}
        className={`${styles.tooltipCard} ${styles[`placement_${tooltipPos.placement}`]}`}
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
        }}
      >
        {/* Анимированная стрелка-указатель */}
        <div
          className={styles.arrowPointer}
          style={{
            top: tooltipPos.arrowTop != null ? `${tooltipPos.arrowTop}px` : undefined,
            left: tooltipPos.arrowLeft != null ? `${tooltipPos.arrowLeft}px` : undefined,
          }}
        >
          <div className={styles.arrowHead} />
          <div className={styles.arrowPulseRing} />
        </div>

        {/* Верхняя панель карточки */}
        <div className={styles.cardHeader}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>{step.icon}</span>
            <span>Шаг {currentStep + 1} из {TOUR_STEPS.length}</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            title="Пропустить обучение (Esc)"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Заголовок */}
        <h3 className={styles.title}>{step.title}</h3>

        {/* Информационный блок: Где находится, Как работает, Зачем нужно */}
        <div className={styles.infoContent}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>📍 Где находится:</span>
            <span className={styles.infoText}>{step.description.where}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>⚡ Как работает:</span>
            <span className={styles.infoText}>{step.description.how}</span>
          </div>
          <div className={`${styles.infoRow} ${styles.benefitRow}`}>
            <span className={styles.infoLabel}>💎 Зачем нужно & польза:</span>
            <span className={styles.infoText}>{step.description.benefit}</span>
          </div>
        </div>

        {/* Нижняя панель с прогресс-точками и кнопками */}
        <div className={styles.cardFooter}>
          {/* Индикатор шагов */}
          <div className={styles.dotsContainer}>
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`${styles.dot} ${idx === currentStep ? styles.activeDot : ''}`}
                onClick={() => setCurrentStep(idx)}
                title={`Перейти к шагу ${idx + 1}`}
              />
            ))}
          </div>

          {/* Кнопки переключения */}
          <div className={styles.actions}>
            {currentStep > 0 && (
              <button
                className={styles.backBtn}
                onClick={handlePrev}
                type="button"
              >
                ← Назад
              </button>
            )}
            <button
              className={styles.nextBtn}
              onClick={handleNext}
              type="button"
            >
              {isLastStep ? '🚀 Понятно, начать работу!' : 'Далее →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingTour;
