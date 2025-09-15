#!/bin/bash

# Скрипт для настройки upstream репозитория
# Использование: ./scripts/setup-upstream.sh <UPSTREAM_URL>

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка аргументов
if [ $# -eq 0 ]; then
    print_error "Необходимо указать URL upstream репозитория"
    echo "Использование: $0 <UPSTREAM_URL>"
    echo "Пример: $0 https://github.com/username/glozo-variant.git"
    exit 1
fi

UPSTREAM_URL=$1

print_message "Настройка upstream репозитория: $UPSTREAM_URL"

# Проверка, что мы в git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Не найден git репозиторий"
    exit 1
fi

# Проверка текущих remote репозиториев
print_message "Проверка текущих remote репозиториев..."
git remote -v

# Проверка, существует ли уже upstream
if git remote get-url upstream > /dev/null 2>&1; then
    print_warning "Upstream уже настроен:"
    git remote get-url upstream
    read -p "Хотите обновить upstream URL? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url upstream "$UPSTREAM_URL"
        print_success "Upstream URL обновлен"
    else
        print_message "Upstream не изменен"
        exit 0
    fi
else
    # Добавление upstream
    print_message "Добавление upstream репозитория..."
    git remote add upstream "$UPSTREAM_URL"
    print_success "Upstream добавлен"
fi

# Проверка подключения к upstream
print_message "Проверка подключения к upstream..."
if git ls-remote upstream > /dev/null 2>&1; then
    print_success "Подключение к upstream успешно"
else
    print_error "Не удается подключиться к upstream репозиторию"
    print_error "Проверьте URL и права доступа"
    exit 1
fi

# Получение информации о upstream
print_message "Получение информации о upstream репозитории..."
git fetch upstream

# Показать ветки upstream
print_message "Доступные ветки в upstream:"
git branch -r | grep upstream

# Синхронизация main ветки
print_message "Синхронизация main ветки..."
git checkout main
git merge upstream/main || {
    print_warning "Обнаружены конфликты при merge main ветки"
    print_warning "Разрешите конфликты вручную и выполните:"
    print_warning "  git add ."
    print_warning "  git commit"
    print_warning "  git push origin main"
}

# Синхронизация develop ветки
print_message "Синхронизация develop ветки..."
git checkout develop
git merge main || {
    print_warning "Обнаружены конфликты при merge develop ветки"
    print_warning "Разрешите конфликты вручную и выполните:"
    print_warning "  git add ."
    print_warning "  git commit"
    print_warning "  git push origin develop"
}

# Отправка изменений
print_message "Отправка изменений в origin..."
git push origin main
git push origin develop

# Финальная проверка
print_message "Финальная проверка remote репозиториев..."
git remote -v

print_success "Настройка upstream завершена успешно!"
print_message "Теперь вы можете:"
print_message "  1. Создавать feature ветки от develop"
print_message "  2. Создавать PR в upstream репозиторий"
print_message "  3. Синхронизироваться с upstream: git fetch upstream && git merge upstream/main"
