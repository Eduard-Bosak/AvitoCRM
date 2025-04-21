import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Typography, Accordion, AccordionSummary, AccordionDetails,
  Box, Chip, Paper, IconButton, TextField, InputAdornment, alpha,
  Grid, Divider, Card, Button, Tooltip, useTheme, useMediaQuery, Fade,
  Grow, Zoom, SvgIcon, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, FormHelperText, FormControl, InputLabel, OutlinedInput,
  Snackbar, Alert, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { styled } from '@mui/system';

// Стилизованные компоненты для технологичного дизайна
const TechBackdrop = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  overflow: 'hidden',
  opacity: 0.8,
}));

const GlowingCircle = styled('div')(({ theme, color = '#3f51b5', size = 300, opacity = 0.3, top = 0, left = 0 }) => ({
  position: 'absolute',
  top: `${top}px`,
  left: `${left}px`,
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
  opacity: opacity,
  filter: 'blur(40px)',
}));

const FloatingParticle = styled(motion.div)(({ theme, size = 6, color = '#4fc3f7' }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  background: color,
  borderRadius: '50%',
  filter: 'blur(1px)',
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.7)
    : alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'transform 0.3s, box-shadow 0.3s',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, rgba(0,0,0,0) 100%)`,
    zIndex: 0,
  },
}));

const AnimatedAccordion = styled(Accordion)(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
}));

const HighlightedChip = styled(Chip)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(to right, transparent 0%, ${alpha('#fff', 0.3)} 50%, transparent 100%)`,
    transition: 'left 1.5s ease-in-out',
  },
  '&:hover::after': {
    left: '100%',
  },
}));

// Интерфейс для данных формы
interface FeedbackFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Интерфейс для ошибок валидации
interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

/**
 * FAQ-страница с современным технологичным дизайном
 * Использует продвинутые анимации, эффект стекла и 3D эффекты
 */
export default function FAQPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Состояние для поиска
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояние для активной категории
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Состояние для открытого вопроса
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Реф для отслеживания прокрутки
  const containerRef = useRef(null);
  const { scrollY } = useScroll({ container: containerRef });
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  
  // Частицы для эффекта технологичности
  const [particles, setParticles] = useState<Array<{
    x: number; 
    y: number; 
    size: number; 
    color: string;
    initialX: number;
    initialY: number;
  }>>([]);
  
  // Создаем частицы при загрузке страницы
  useEffect(() => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      alpha(theme.palette.warning.main, 0.7),
    ];
    
    const newParticles = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
    }));
    
    setParticles(newParticles);
  }, [theme]);
  
  // Список категорий с иконками и цветами
  const categories = [
    { id: 'general', label: 'Общие вопросы', icon: InfoIcon, color: 'primary' },
    { id: 'usage', label: 'Использование', icon: HelpOutlineIcon, color: 'success' },
    { id: 'settings', label: 'Настройки', icon: SettingsIcon, color: 'warning' },
    { id: 'projects', label: 'Проекты', icon: AccountTreeIcon, color: 'info' },
    { id: 'learning', label: 'Обучение', icon: SchoolIcon, color: 'secondary' }
  ];
  
  // Данные FAQ
  const faqData = [
    {
      id: '1',
      category: 'general',
      question: 'Что такое Project Management System?',
      answer: `Project Management System — это инструмент для управления проектами и задачами. 
      Он позволяет создавать проекты, доски задач и отслеживать их выполнение.
      Система поддерживает канбан-доски для визуального отображения рабочего процесса.`
    },
    {
      id: '2',
      category: 'usage',
      question: 'Как создать новую задачу?',
      answer: `Чтобы создать новую задачу, перейдите на страницу "Задачи" или "Канбан", нажмите кнопку "Создать задачу", 
      заполните необходимые поля и нажмите "Сохранить". Задача будет добавлена в выбранный проект или доску.`
    },
    {
      id: '3',
      category: 'settings',
      question: 'Как настроить уведомления?',
      answer: `Для настройки уведомлений перейдите в раздел "Настройки" через главное меню. 
      В подразделе "Уведомления" вы можете выбрать типы событий, о которых хотите получать уведомления, 
      и способы их получения (электронная почта, веб-уведомления).`
    },
    {
      id: '4',
      category: 'projects',
      question: 'Как добавить пользователя в проект?',
      answer: `Чтобы добавить пользователя в проект, откройте страницу проекта, перейдите на вкладку "Участники" 
      и нажмите "Добавить участника". Введите email пользователя и выберите его роль в проекте. 
      После этого пользователь получит уведомление о приглашении.`
    },
    {
      id: '5',
      category: 'usage',
      question: 'Как переместить задачу между статусами?',
      answer: `На канбан-доске вы можете переместить задачу между статусами несколькими способами:
      1. Перетащите карточку задачи из одной колонки в другую (drag-and-drop).
      2. Откройте задачу и измените статус в выпадающем списке.
      3. Используйте контекстное меню задачи (правый клик) и выберите новый статус.`
    },
    {
      id: '6',
      category: 'general',
      question: 'Какие типы проектов поддерживает система?',
      answer: `Система поддерживает различные типы проектов: разработка программного обеспечения, 
      маркетинг, дизайн, управление продуктами и другие. Для каждого типа проекта можно настроить 
      соответствующие этапы работы (статусы задач) и метрики для отслеживания прогресса.`
    },
    {
      id: '7',
      category: 'learning',
      question: 'Где найти обучающие материалы?',
      answer: `Обучающие материалы доступны в разделе "Обучение" в главном меню. 
      Там вы найдете видеоуроки, пошаговые инструкции и документацию по использованию всех функций системы. 
      Для новых пользователей рекомендуем начать с "Быстрого старта".`
    },
    {
      id: '8',
      category: 'projects',
      question: 'Как создать отчет по проекту?',
      answer: `Для создания отчета по проекту перейдите на страницу проекта и выберите вкладку "Отчеты". 
      Нажмите "Создать отчет", выберите тип отчета (общий прогресс, время выполнения, распределение задач по исполнителям) 
      и укажите период. Отчет можно экспортировать в PDF или Excel.`
    },
    {
      id: '9',
      category: 'settings',
      question: 'Как изменить тему интерфейса?',
      answer: `Для изменения темы интерфейса перейдите в "Настройки" через главное меню. 
      В разделе "Интерфейс" вы можете выбрать светлую или темную тему, а также настроить цветовую схему приложения 
      в соответствии с вашими предпочтениями.`
    },
    {
      id: '10',
      category: 'learning',
      question: 'Как использовать канбан-доску эффективно?',
      answer: `Для эффективного использования канбан-доски:
      1. Ограничивайте количество задач в работе (WIP limit).
      2. Регулярно обновляйте статусы задач.
      3. Используйте цветовые метки для приоритетов.
      4. Проводите регулярные встречи у доски для синхронизации команды.
      5. Анализируйте метрики времени прохождения задач через доску.`
    },
  ];
  
  // Функция фильтрации FAQ по поисковому запросу и категории
  const filteredFAQ = faqData.filter(faq => {
    const matchSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchCategory = !activeCategory || faq.category === activeCategory;
    
    return matchSearch && matchCategory;
  });
  
  // Функция для подсветки совпадений с улучшенным стилем
  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) {
      return text;
    }
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <motion.span
          key={index}
          initial={{ backgroundColor: alpha(theme.palette.warning.main, 0.7) }}
          animate={{ backgroundColor: alpha(theme.palette.warning.main, 0.3) }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          style={{ 
            borderRadius: '3px', 
            padding: '0 2px',
            fontWeight: 500,
          }}
        >
          {part}
        </motion.span>
      ) : part
    );
  };
  
  // Очистка поиска
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  // Обработчик клика по категории
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === activeCategory) {
      setActiveCategory(null); // Сброс фильтра при повторном клике
    } else {
      setActiveCategory(categoryId);
    }
  };
  
  // Обработчик изменения раскрытого вопроса
  const handleAccordionChange = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  // Состояние для формы обратной связи
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Обработка отправки формы
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    // Если есть ошибки, не отправляем форму
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    // Имитация отправки на сервер
    setIsSubmitting(true);
    
    // Задержка для демонстрации загрузки
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Сбрасываем форму через некоторое время
      setTimeout(() => {
        setFeedbackFormOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }, 1500);
    }, 1500);
  };
  
  // Обработка изменений в полях формы
  const handleFormChange = (field: keyof FeedbackFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
    
    // Очищаем ошибку для поля при вводе
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: undefined
      });
    }
  };
  
  // Валидация формы
  const validateForm = (data: FeedbackFormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Валидация имени
    if (!data.name.trim()) {
      errors.name = 'Имя обязательно';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errors.email = 'Email обязателен';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Введите корректный email';
    }
    
    // Валидация телефона
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    if (!data.phone.trim()) {
      errors.phone = 'Телефон обязателен';
    } else if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Введите корректный номер телефона';
    }
    
    // Валидация сообщения
    if (!data.message.trim()) {
      errors.message = 'Сообщение обязательно';
    } else if (data.message.trim().length < 10) {
      errors.message = 'Сообщение должно содержать минимум 10 символов';
    }
    
    return errors;
  };

  // Закрытие уведомления об успехе
  const handleCloseSuccessAlert = () => {
    setSubmitSuccess(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }} ref={containerRef}>
      {/* Технологичный фон с эффектами */}
      <TechBackdrop>
        <GlowingCircle color={theme.palette.primary.main} size={500} opacity={0.15} top={-200} left={-100} />
        <GlowingCircle color={theme.palette.secondary.main} size={400} opacity={0.1} top={300} left={isMobile ? -200 : 700} />
        <GlowingCircle color={theme.palette.info.main} size={300} opacity={0.08} top={500} left={isMobile ? 150 : 300} />
        
        {/* Анимированные частицы */}
        {particles.map((particle, index) => (
          <FloatingParticle
            key={index}
            size={particle.size}
            color={particle.color}
            initial={{ 
              x: `${particle.initialX}%`, 
              y: `${particle.initialY}%`,
              opacity: 0.2 + Math.random() * 0.5
            }}
            animate={{
              x: [
                `${particle.initialX}%`, 
                `${particle.initialX + (Math.random() * 10 - 5)}%`, 
                `${particle.initialX}%`
              ],
              y: [
                `${particle.initialY}%`, 
                `${particle.initialY + (Math.random() * 10 - 5)}%`, 
                `${particle.initialY}%`
              ],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 5 + Math.random() * 10,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
          />
        ))}
        
        {/* Геометрические декоративные элементы */}
        <Box
          component={motion.div}
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            top: '30%',
            left: '-5%',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <Box
          component={motion.div}
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            top: '60%',
            right: '-10%',
          }}
          animate={{
            rotate: -360,
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </TechBackdrop>

      {/* Заголовок страницы с продвинутой анимацией */}
      <motion.div
        style={{ y, opacity }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          type: "spring",
          stiffness: 100 
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
          <motion.div
            animate={{ 
              background: [
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
              fontWeight: 700,
            }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                letterSpacing: -0.5,
                mb: 1,
              }}
            >
              FAQ
            </Typography>
          </motion.div>
          
          <Typography 
            variant="h6" 
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Часто задаваемые вопросы
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600,
              mx: 'auto',
              mb: 2,
            }}
          >
            Ответы на популярные вопросы о работе с нашей системой
          </Typography>
          
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AutoAwesomeIcon 
                sx={{ 
                  fontSize: 28,
                  color: theme.palette.warning.main,
                  filter: 'drop-shadow(0 0 5px rgba(255,167,38,0.5))'
                }} 
              />
            </motion.div>
          </Box>
        </Box>
      </motion.div>
      
      {/* Улучшенный блок поиска со стеклянным эффектом */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassPaper
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ maxWidth: 700, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Поиск по вопросам и ответам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <motion.div
                        animate={{ rotate: searchTerm ? [0, 15, 0, -15, 0] : 0 }}
                        transition={{ duration: 0.5, repeat: searchTerm ? 0 : 0 }}
                      >
                        <SearchIcon color="action" />
                      </motion.div>
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        aria-label="clear search" 
                        onClick={() => setSearchTerm('')}
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            transform: 'rotate(90deg)'
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 6px 25px ${alpha(theme.palette.common.black, 0.1)}`,
                    },
                    '&:focus-within': {
                      boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    }
                  }
                }}
                sx={{ mb: 3 }}
                variant="outlined"
              />
              
              {/* Фильтр по категориям с улучшенной стилизацией */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5, 
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HighlightedChip
                        label={category.label}
                        icon={<IconComponent />}
                        color={isActive ? category.color as any : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                        onClick={() => handleCategoryClick(category.id)}
                        sx={{ 
                          px: 1,
                          py: 2.5,
                          borderRadius: 3,
                          fontWeight: isActive ? 500 : 400,
                          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          boxShadow: isActive 
                            ? `0 5px 15px ${alpha(theme.palette[category.color as any].main, 0.25)}`
                            : 'none',
                          '&:hover': {
                            boxShadow: `0 5px 15px ${alpha(theme.palette[category.color as any].main, 0.2)}`,
                          },
                          '& .MuiChip-icon': {
                            transition: 'all 0.3s',
                            opacity: isActive ? 1 : 0.7,
                          },
                          '&:hover .MuiChip-icon': {
                            transform: 'scale(1.2)',
                            opacity: 1,
                          }
                        }}
                      />
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          </motion.div>
        </GlassPaper>
      </motion.div>
      
      {/* Результаты фильтрации и поиска */}
      {filteredFAQ.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <LiveHelpIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              По вашему запросу ничего не найдено
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Попробуйте изменить запрос или сбросить фильтры
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory(null);
              }}
              sx={{ mt: 2 }}
            >
              Сбросить все фильтры
            </Button>
          </Box>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          {/* Вопросы FAQ с улучшенными 3D эффектами и анимациями */}
          <Grid item xs={12}>
            <AnimatePresence>
              {filteredFAQ.map((faq, index) => {
                // Найдем категорию для отображения цвета
                const categoryInfo = categories.find(c => c.id === faq.category);
                const color = categoryInfo?.color || 'primary';
                
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <AnimatedAccordion 
                      expanded={expandedQuestion === faq.id}
                      onChange={() => handleAccordionChange(faq.id)}
                      sx={{
                        mb: 2.5,
                        borderRadius: 2,
                        borderLeft: `4px solid ${theme.palette[color as any].main}`,
                        boxShadow: expandedQuestion === faq.id 
                          ? `0 8px 25px ${alpha(theme.palette[color as any].main, 0.15)}`
                          : `0 4px 15px ${alpha(theme.palette.common.black, 0.05)}`,
                        background: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.background.paper, 0.7)
                          : alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&::before': {
                          display: 'none',
                        },
                        '&:hover': {
                          boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.1)}`,
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <motion.div
                            animate={{
                              rotate: expandedQuestion === faq.id ? 180 : 0,
                              scale: expandedQuestion === faq.id ? 1.2 : 1
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ExpandMoreIcon 
                              sx={{ 
                                color: expandedQuestion === faq.id 
                                  ? theme.palette[color as any].main 
                                  : theme.palette.text.secondary
                              }} 
                            />
                          </motion.div>
                        }
                        aria-controls={`panel${faq.id}-content`}
                        id={`panel${faq.id}-header`}
                        sx={{
                          transition: 'all 0.3s',
                          minHeight: 64,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette[color as any].main, 0.05),
                          },
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center', 
                          width: '100%',
                          position: 'relative'
                        }}>
                          {/* Иконка категории */}
                          {expandedQuestion === faq.id && (
                            <Box
                              component={motion.div}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0 }}
                              sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette[color as any].main, 0.1),
                                color: theme.palette[color as any].main
                              }}
                            >
                              {(() => {
                                const CategoryIcon = categoryInfo?.icon || InfoIcon;
                                return <CategoryIcon fontSize="small" />;
                              })()}
                            </Box>
                          )}
                          
                          <Typography 
                            variant={expandedQuestion === faq.id ? 'h6' : 'subtitle1'} 
                            fontWeight={expandedQuestion === faq.id ? 600 : 500}
                            sx={{ 
                              flexGrow: 1,
                              transition: 'all 0.3s',
                              textShadow: expandedQuestion === faq.id 
                                ? `0 0 1px ${alpha(theme.palette[color as any].main, 0.3)}`
                                : 'none'
                            }}
                          >
                            {highlightMatch(faq.question, searchTerm)}
                          </Typography>
                          
                          <Chip 
                            label={categoryInfo?.label} 
                            size="small"
                            color={color as any}
                            variant={expandedQuestion === faq.id ? "filled" : "outlined"}
                            sx={{ 
                              ml: 2, 
                              display: { xs: 'none', sm: 'flex' },
                              transition: 'all 0.3s',
                              transform: expandedQuestion === faq.id ? 'scale(1.05)' : 'scale(1)',
                              boxShadow: expandedQuestion === faq.id 
                                ? `0 2px 8px ${alpha(theme.palette[color as any].main, 0.25)}`
                                : 'none',
                            }}
                          />
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                        <Divider 
                          sx={{ 
                            mb: 2,
                            background: `linear-gradient(to right, ${theme.palette[color as any].main}, transparent)`,
                            height: '2px',
                            border: 'none',
                            opacity: 0.7
                          }} 
                        />
                        
                        <Typography 
                          variant="body1" 
                          component={motion.div}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          sx={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.8,
                            color: theme.palette.text.primary,
                            position: 'relative',
                            px: { xs: 0, sm: 2 }
                          }}
                        >
                          {highlightMatch(faq.answer, searchTerm)}
                        </Typography>
                        
                        {/* Декоративный элемент для технологичности */}
                        <Box
                          component={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: { xs: 'none', md: 'block' },
                            opacity: 0.1,
                            background: `conic-gradient(from 0deg, ${theme.palette[color as any].dark}, ${theme.palette[color as any].light})`
                          }}
                        />
                      </AccordionDetails>
                    </AnimatedAccordion>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Grid>
        </Grid>
      )}
      
      {/* Блок с дополнительной информацией и обратной связью */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassPaper 
          sx={{ 
            mt: 5, 
            p: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Декоративный элемент */}
          <Box
            component={motion.div}
            animate={{
              background: [
                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
                `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.3)} 0%, transparent 70%)`,
                `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.3)} 0%, transparent 70%)`,
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 2,
              zIndex: -1,
            }}
          />
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative' }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <LightbulbIcon sx={{ color: theme.palette.warning.main }} />
                  </motion.div>
                  Не нашли ответ на свой вопрос?
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ maxWidth: 500 }}
                >
                  Свяжитесь с нами, и мы постараемся помочь вам в решении вашего вопроса.
                  Также вы можете ознакомиться с обучающими материалами или справочной документацией.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  endIcon={<FeedbackIcon />}
                  onClick={() => setFeedbackFormOpen(true)}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(to right, transparent 0%, ${alpha('#fff', 0.3)} 50%, transparent 100%)`,
                      transition: 'left 0.8s ease-in-out',
                    },
                    '&:hover::after': {
                      left: '100%',
                    }
                  }}
                >
                  Задать вопрос
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  endIcon={<SchoolIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    borderWidth: 2,
                    borderColor: alpha(theme.palette.secondary.main, 0.5),
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: theme.palette.secondary.main,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    }
                  }}
                >
                  Обучение
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </GlassPaper>
      </motion.div>
      
      {/* Модальное окно формы обратной связи */}
      <Dialog 
        open={feedbackFormOpen} 
        onClose={() => !isSubmitting && setFeedbackFormOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.9)
              : alpha(theme.palette.background.paper, 0.9),
          }
        }}
        TransitionComponent={Zoom}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {/* Декоративные элементы */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.07),
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              left: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.secondary.main, 0.05),
              zIndex: 0,
            }}
          />
          
          <DialogTitle sx={{ 
            fontWeight: 600, 
            pt: 3, 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <FeedbackIcon color="primary" />
            Задать вопрос
            
            <IconButton 
              aria-label="close"
              onClick={() => !isSubmitting && setFeedbackFormOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pb: 3 }}>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
              Заполните форму, и мы свяжемся с вами в ближайшее время, чтобы ответить на ваш вопрос
            </Typography>
            
            {/* Форма обратной связи */}
            <form onSubmit={handleSubmitFeedback}>
              <Stack spacing={2.5}>
                <FormControl variant="outlined" fullWidth error={!!formErrors.name}>
                  <InputLabel htmlFor="name-input">Ваше имя</InputLabel>
                  <OutlinedInput
                    id="name-input"
                    value={formData.name}
                    onChange={handleFormChange('name')}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color={formErrors.name ? "error" : "action"} />
                      </InputAdornment>
                    }
                    label="Ваше имя"
                    disabled={isSubmitting}
                    placeholder="Иван Иванов"
                    sx={{ borderRadius: 2 }}
                  />
                  {formErrors.name && (
                    <FormHelperText error>{formErrors.name}</FormHelperText>
                  )}
                </FormControl>
                
                <FormControl variant="outlined" fullWidth error={!!formErrors.email}>
                  <InputLabel htmlFor="email-input">Email</InputLabel>
                  <OutlinedInput
                    id="email-input"
                    value={formData.email}
                    onChange={handleFormChange('email')}
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailIcon color={formErrors.email ? "error" : "action"} />
                      </InputAdornment>
                    }
                    label="Email"
                    placeholder="example@mail.com"
                    disabled={isSubmitting}
                    sx={{ borderRadius: 2 }}
                  />
                  {formErrors.email && (
                    <FormHelperText error>{formErrors.email}</FormHelperText>
                  )}
                </FormControl>
                
                <FormControl variant="outlined" fullWidth error={!!formErrors.phone}>
                  <InputLabel htmlFor="phone-input">Телефон</InputLabel>
                  <OutlinedInput
                    id="phone-input"
                    value={formData.phone}
                    onChange={handleFormChange('phone')}
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneIcon color={formErrors.phone ? "error" : "action"} />
                      </InputAdornment>
                    }
                    label="Телефон"
                    placeholder="+7 (999) 123-45-67"
                    disabled={isSubmitting}
                    sx={{ borderRadius: 2 }}
                  />
                  {formErrors.phone && (
                    <FormHelperText error>{formErrors.phone}</FormHelperText>
                  )}
                </FormControl>
                
                <FormControl variant="outlined" fullWidth error={!!formErrors.message}>
                  <InputLabel htmlFor="message-input">Ваш вопрос</InputLabel>
                  <OutlinedInput
                    id="message-input"
                    value={formData.message}
                    onChange={handleFormChange('message')}
                    label="Ваш вопрос"
                    multiline
                    rows={4}
                    placeholder="Опишите подробно ваш вопрос..."
                    disabled={isSubmitting}
                    sx={{ borderRadius: 2 }}
                  />
                  {formErrors.message && (
                    <FormHelperText error>{formErrors.message}</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </form>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => !isSubmitting && setFeedbackFormOpen(false)} 
              disabled={isSubmitting}
              variant="outlined"
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSubmitFeedback} 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting}
              endIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
              sx={{
                borderRadius: 2,
                minWidth: 150,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </DialogActions>
          
          {/* Анимированный успех при отправке формы */}
          <Zoom in={submitSuccess}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              zIndex: 5,
            }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: theme.palette.success.main,
                    filter: `drop-shadow(0 0 10px ${alpha(theme.palette.success.main, 0.5)})`,
                  }}
                />
              </motion.div>
              
              <Typography
                variant="h6"
                sx={{ mt: 2, fontWeight: 600 }}
              >
                Спасибо за ваш вопрос!
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center', maxWidth: 300 }}
              >
                Мы получили ваше сообщение и свяжемся с вами в ближайшее время
              </Typography>
            </Box>
          </Zoom>
        </Box>
      </Dialog>

      {/* Уведомление об успешной отправке формы */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccessAlert}
          severity="success"
          variant="filled"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{
            width: '100%',
            boxShadow: 4,
            '& .MuiAlert-icon': {
              fontSize: '1.25rem',
            }
          }}
        >
          Ваш вопрос успешно отправлен!
        </Alert>
      </Snackbar>
    </Container>
  );
}