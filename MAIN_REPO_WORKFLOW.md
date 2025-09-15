# Workflow для работы с основным репозиторием

Этот документ описывает процесс работы с основным репозиторием Glozo Variant и синхронизации изменений.

## 🔄 Процесс синхронизации с основным репозиторием

### 1. Настройка upstream репозитория

Если основной репозиторий еще не настроен как upstream:

```bash
# Добавить основной репозиторий как upstream
git remote add upstream <URL_ОСНОВНОГО_РЕПОЗИТОРИЯ>

# Проверить настройки
git remote -v
```

### 2. Синхронизация изменений

#### Получение изменений из основного репозитория

```bash
# Переключиться на main ветку
git checkout main

# Получить изменения из upstream
git fetch upstream

# Слить изменения в локальную main
git merge upstream/main

# Отправить обновленную main в origin
git push origin main
```

#### Обновление develop ветки

```bash
# Переключиться на develop
git checkout develop

# Слить изменения из main
git merge main

# Отправить обновленную develop
git push origin develop
```

### 3. Создание Pull Request в основной репозиторий

#### Подготовка изменений

1. **Создайте feature ветку от develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Разработайте и закоммитьте изменения**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Отправьте ветку**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Создание PR

1. **Создайте Pull Request в основном репозитории**
   - Перейдите на GitHub основного репозитория
   - Создайте PR из `your-username/glozo-variant:feature/your-feature-name` в `main:develop`
   - Заполните шаблон PR

2. **После одобрения и merge в основной репозиторий**
   ```bash
   # Вернитесь в develop
   git checkout develop
   
   # Получите изменения из upstream
   git fetch upstream
   git merge upstream/develop
   
   # Удалите локальную feature ветку
   git branch -d feature/your-feature-name
   
   # Отправьте обновленную develop
   git push origin develop
   ```

## 📋 Чек-лист для PR в основной репозиторий

### Перед созданием PR

- [ ] Код соответствует стандартам проекта
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] CHANGELOG.md обновлен
- [ ] DEVELOPMENT_LOG.md обновлен
- [ ] Коммиты следуют conventional commits
- [ ] PR имеет описательное название
- [ ] PR описание заполнено по шаблону

### После merge в основной репозиторий

- [ ] Синхронизированы изменения из upstream
- [ ] Локальные ветки обновлены
- [ ] Удалены ненужные feature ветки
- [ ] DEVELOPMENT_LOG.md обновлен с информацией о merge

## 🔧 Настройка автоматической синхронизации

### GitHub Actions для автоматической синхронизации

Создайте файл `.github/workflows/sync-upstream.yml`:

```yaml
name: Sync with Upstream

on:
  schedule:
    - cron: '0 2 * * *'  # Каждый день в 2:00 UTC
  workflow_dispatch:  # Ручной запуск

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Sync with upstream
        run: |
          git remote add upstream ${{ secrets.UPSTREAM_REPO_URL }}
          git fetch upstream
          git checkout main
          git merge upstream/main
          git push origin main
          
          git checkout develop
          git merge main
          git push origin develop
```

### Настройка secrets

В настройках репозитория добавьте:
- `UPSTREAM_REPO_URL` - URL основного репозитория

## 📊 Отслеживание изменений

### DEVELOPMENT_LOG.md

Обновляйте файл `DEVELOPMENT_LOG.md` при каждом значимом изменении:

```markdown
### 2024-12-19 - Название сессии
**Участники**: AI Assistant + User

**Цели сессии**:
- [x] Задача 1
- [ ] Задача 2

**Выполненные задачи**:
1. Описание задачи 1
2. Описание задачи 2

**Созданные PR в основной репозиторий**:
- [PR #123](link) - Описание изменений
```

### CHANGELOG.md

Обновляйте `CHANGELOG.md` при каждом релизе или значимом изменении.

## 🚨 Решение конфликтов

### При конфликтах при merge

1. **Определите конфликтующие файлы**
   ```bash
   git status
   ```

2. **Разрешите конфликты вручную**
   - Откройте файлы с конфликтами
   - Найдите маркеры конфликтов (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Выберите нужные изменения
   - Удалите маркеры конфликтов

3. **Завершите merge**
   ```bash
   git add .
   git commit -m "resolve merge conflicts"
   ```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте статус git: `git status`
2. Проверьте remote репозитории: `git remote -v`
3. Проверьте логи: `git log --oneline -10`
4. Создайте issue в репозитории для получения помощи

## 🔗 Полезные команды

```bash
# Просмотр всех веток
git branch -a

# Просмотр remote репозиториев
git remote -v

# Просмотр последних коммитов
git log --oneline -10

# Просмотр изменений в файле
git diff filename

# Отмена последнего коммита (если не отправлен)
git reset --soft HEAD~1

# Принудительная отправка (осторожно!)
git push --force-with-lease origin branch-name
```

---

*Последнее обновление: 2024-12-19*
