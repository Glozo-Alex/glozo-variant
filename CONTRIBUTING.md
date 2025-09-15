# Руководство по участию в разработке

Спасибо за интерес к участию в разработке Glozo Variant! Это руководство поможет вам начать работу с проектом.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- Git
- Аккаунт на GitHub

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd glozo-variant
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp .env.example .env.local
   # Отредактируйте .env.local с вашими настройками
   ```

4. **Запустите проект в режиме разработки**
   ```bash
   npm run dev
   ```

## 🌿 Git Workflow

### Структура веток

- `main` - основная ветка с стабильным кодом
- `develop` - ветка для разработки
- `feature/*` - ветки для новых функций
- `bugfix/*` - ветки для исправления багов
- `hotfix/*` - ветки для критических исправлений

### Процесс разработки

1. **Создайте feature ветку**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Разрабатывайте и коммитьте**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Отправьте ветку**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Создайте Pull Request**
   - Перейдите на GitHub
   - Создайте PR из вашей ветки в `develop`
   - Заполните шаблон PR

5. **После одобрения и merge**
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/your-feature-name
   ```

## 📝 Соглашения о коммитах

Мы используем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Типы коммитов

- `feat`: новая функция
- `fix`: исправление бага
- `docs`: изменения в документации
- `style`: форматирование, отсутствие изменений в логике
- `refactor`: рефакторинг кода
- `test`: добавление или изменение тестов
- `chore`: изменения в инструментах, конфигурации

### Примеры

```bash
feat(auth): add OAuth2 login
fix(ui): resolve button alignment issue
docs: update API documentation
refactor(components): extract reusable button component
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Тесты в watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage
```

### Написание тестов

- Unit тесты для компонентов и утилит
- Integration тесты для API
- E2E тесты для критических пользовательских сценариев

## 🎨 Стиль кода

### ESLint и Prettier

Проект использует ESLint и Prettier для поддержания единого стиля кода.

```bash
# Проверка стиля
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование
npm run format
```

### Соглашения

- Используйте TypeScript для всех новых файлов
- Следуйте принципам React Hooks
- Используйте функциональные компоненты
- Применяйте принципы SOLID
- Пишите самодокументируемый код

## 📁 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── ui/             # Базовые UI компоненты
│   └── ...             # Специфичные компоненты
├── pages/              # Страницы приложения
├── contexts/           # React контексты
├── hooks/              # Кастомные хуки
├── services/           # API сервисы
├── types/              # TypeScript типы
├── utils/              # Утилиты
└── lib/                # Библиотеки и конфигурация
```

## 🐛 Сообщение о багах

1. Проверьте, не был ли баг уже зарегистрирован
2. Создайте новый issue с шаблоном "Bug Report"
3. Предоставьте подробную информацию:
   - Шаги для воспроизведения
   - Ожидаемое поведение
   - Фактическое поведение
   - Информация об окружении

## ✨ Предложение новых функций

1. Создайте issue с шаблоном "Feature Request"
2. Опишите проблему, которую решает функция
3. Предложите решение
4. Обсудите с командой перед началом разработки

## 🔄 Процесс Code Review

### Для авторов PR

- Убедитесь, что все тесты проходят
- Обновите документацию при необходимости
- Добавьте тесты для новых функций
- Следуйте соглашениям о коммитах

### Для ревьюеров

- Проверьте логику и архитектуру
- Убедитесь в качестве кода
- Проверьте тесты и документацию
- Будьте конструктивными в комментариях

## 📚 Дополнительные ресурсы

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Получение помощи

- Создайте issue для вопросов
- Используйте GitHub Discussions для общих вопросов
- Обратитесь к команде в Slack/Discord

## 📄 Лицензия

Проект использует [MIT License](LICENSE).

---

Спасибо за ваш вклад в развитие Glozo Variant! 🚀
