<div align="center">

# 🧸 ToyShop Mini App

Telegram Mini App для магазина handmade-игрушек.

**React · FastAPI · PostgreSQL · Docker · Nginx**

</div>

---

## О проекте

ToyShop Mini App — pet-проект интернет-магазина внутри Telegram.

Пользователь может смотреть товары, добавлять их в корзину и оформлять заказ.  
Администратор может добавлять, редактировать и скрывать товары.

Проект сделан, чтобы на практике разобраться во fullstack-разработке, backend/frontend-интеграции и деплое приложения на VPS.

## Возможности

- витрина товаров по категориям;
- карточки товаров с фото, описанием и ценой;
- корзина и оформление заказа;
- админское управление товарами;
- загрузка изображений;
- уведомления мастеру о заказах;
- деплой на VPS с доменами и HTTPS.

## Стек

| Часть | Технологии |
|---|---|
| Frontend | React, Vite, JavaScript, Telegram Mini Apps |
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL |
| Infra | Docker, Docker Compose, Nginx, Let's Encrypt, VPS |

## Архитектура

```text
Telegram Mini App
        ↓
React frontend
        ↓
FastAPI backend
        ↓
PostgreSQL
