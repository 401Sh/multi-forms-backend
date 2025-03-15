# Multi forms backend - NestJS + TypeScript + TypeORM + JWT

## Цель проекта

Разработать бэкенд, который будет являться упрощенным аналогом бэкенда Google Форм.

#### Задачи

- [X] Регистрация и авторизация по JWT через логин и пароль
- [X] Cоздание формы, поддерживающей поля: текстовое, radio, checkbox
- [X] Получение, изменение и удаление формы по id
- [X] Отправка ответа на форму по id
- [X] Получение всех своих созданных форм
- [X] Создание Postman коллекции для тестирования
- [X] Использование Swagger UI
- [X] 
Добавить docker-compose.yaml и Dockerfile файлы для развертывания базы данных и самого приложения в Docker контейнере.
- [X] Реализовать опциональную фильтрацию и сортировку    <--- реализовано для **/surveys/public** и **/surveys/self**

#### Проблемы проекта

- Монолитная структура при использовании nest.
- Плохая реализация функции создания ответов на анкету.
- При запуске проекта в докере TypeORM не подключается к MariaDB при установки своего внешнего порта для БД в .env.
- Функция получения анкеты для респондента возвращает лишние поля (поле isCorrect) несмотря на то, что данное поле не указано в выборке проекции. Однако данное поле возвращается всегда со значением false, что в целом может быть временным решением.

#### Технологии

- **TypeScript** - статическая типизация для повышения надежности кода.
- **TypeORM** - работа с БД.
- **NestJS** - обработка маршрутов.
- **JWT (jsonwebtoken, passport-jwt)** – аутентификация на основе токенов.

# Запуск в Docker

Для запуска проекта в Docker необходимо создать файл .env в корне каталога и настроить его. Пример конфигурации, который можно использовать, уже добавлен в .env файле. (переменная HOST используется только при локальном запуске).

## Сборка и запуск контейнера

```bash
# в корне проекта
$ docker-compose up --build
```

## Доступ

После того, как проект и БД будут запущены, доступ к Swagger документации можно будет получить по адресу:
- http://localhost:8000/api/docs

Сами роуты начинаются со следующего url:
- http://localhost:8000/api

# Локальный запуск

Для локального запуска проекта потребуется создать файл .env в корне каталога и настроить его. Пример конфигурации, который можно использовать, уже добавлен в .env файле.
Также потребуется база данных, для создания которой в корне проекта есть db.docker-compose.yml с образом mariadb.
Шаги по установке и запуску можно видеть ниже.

## Установка

```bash
# в корне проекта
$ npm install
```

## Создание и запуск контейнера с базой данных

```bash
# в корне проекта
$ docker-compose -f db.docker-compose.yml up -d
```
После запуска контейнера можно будет просматривать данные в БД через adminer, который можно открыть по адресу localhost:8080 (пароль, логин и название БД для входа должны быть указаны в .env)

## Запуск

```bash
# development
$ npm run start
```
После того как проект и БД будут запущены, доступ к проекту можно будет получить по адресу localhost:{PORT}/api, а к Swagger — по адресу localhost:{PORT}/api/docs.

## Доступ

После того, как проект и БД будут запущены, доступ к Swagger документации можно будет получить по адресу:
- http://localhost:8000/api/docs

Сами роуты начинаются со следующего url:
- http://localhost:8000/api

## Postman

Доступ к Postman коллекции, использовавшейся для данного проекта, можно получить по следующей ссылке:
- https://test55-2882.postman.co/workspace/test-Workspace~7a5e7312-c10a-4177-8d85-195063dfebbd/collection/36663044-65b9c818-5fb7-4e75-83b8-e6c12736541f?action=share&creator=36663044

Или использовав json файл из папки ./postman для импорта в приложение Postman

## Структура БД

Для обеспечения работы данного проекта база данных содержит 7 сущностей: **User**, **Survey**, **Question**, **Answer**, **Response**, **QuestionOption** и **AnswerOption** в качестве промежуточной таблицы для связи Многие-ко-многим.
  - Один **User** может иметь несколько созданных **Survey**
  - Одна **Survey** может иметь несколько **Question**
  - Один **Question** может иметь несколько **QuestionOption**
  - Одна **Survey** может иметь несколько **Response** (информация о респондентах минимальна, так как опросы анонимны)
  - Один **User** может создать несколько **Response** (редактировать ответы после отправки нельзя)
  - Один **Response** может или должен (в зависимости от обязательности вопроса) иметь несколько **Answer**
  - Один **Question** может иметь несколько **Answer** от разных респондентов
  - Один **Answer** может иметь несколько выбранных **QuestionOption**, также один **QuestionOption** может быть выбран в нескольких **Answer** разными респондентами

![модель базы данных](db.schema.png)

## Структура проекта

```
src/
│
│── auth/               # Модуль аунтентификации и авторизации
│   ├── dto
│   ├── entities/       # Сущности модуля аунтентификации и авторизации
│   ├── strategies      # Стратегии валидации токенов
│
│── configs/
│── database/           # Файлы настройки базы данных
│── guards/             # Guards для токенов jwt
│
│── questions/          # Модуль вопросов анкеты
│   ├── dto
│   ├── entities/       # Сущности модуля вопросов
│   ├── enums/          # Перечисления для вопросов
│
│── responses/          # Модуль ответов на анкеты
│   ├── entities/       # Сущности модуля ответов
│
│── surveys/            # Модуль анкет
│   ├── dto
│   ├── entities/       # Сущности модуля анкет
│   ├── enums/          # Перечисления для анкет
│
│── users/              # Модуль пользователей
│   ├── dto
│   ├── entities/       # Сущности модуля пользователей
│
│── app.controller.ts
│── app.module.ts
│── app.service.ts
.env
tsconfig.json
package.json
```

## Используемые роуты

### Модуль users

- protected(accesstoken) **GET    /users/self**            - Получение своих данных
- protected(accesstoken) **GET    /users/**                - Получение списка пользователей
- protected(accesstoken) **GET    /users/:userId**         - Получение данных конкретного пользователя
- protected(accesstoken) **PATCH  /users/self**            - Обновление своих данных
- protected(accesstoken) **DELETE /users/self**            - Удаление своего аккаунта

### Модуль auth

- not protected            **POST    /auth/signup**    - Регистрация
- not protected            **POST    /auth/signin**    - Авторизация
- protected(accesstoken)   **DELETE  /auth/logout**    - Удаление сессии
- protected(refreshtoken)  **POST    /auth/refresh**   - Обновление токенов

### Модуль surveys

- protected(accesstoken)   **POST   /surveys/**                      - Создание новой анкеты
- protected(accesstoken)   **GET    /surveys/self**                  - Получение своих анкет
- not protected            **GET    /surveys/public**                - Просмотр публичных анкет
- protected(accesstoken)   **GET    /surveys/:surveyId**             - Получение данных своей анкеты
- protected(accesstoken)   **PATCH  /surveys/:surveyId**             - Обновление своей анкеты
- protected(accesstoken)   **DELETE /surveys/:surveyId**             - Удаление своей анкеты

### Модуль questions

- protected(accesstoken)   **POST   /surveys/:surveyId/questions**             - Создание нового вопроса в анкете
- protected(accesstoken)   **PATCH  /surveys/:surveyId/questions/:questionId** - Обновление данных вопроса
- protected(accesstoken)   **DELETE /surveys/:surveyId/questions/:questionId** - Удаление вопроса

### Модуль responses

- protected(accesstoken) **GET   /surveys/:surveyId/form**          - Просмотр конкретной анкеты для заполнения
- protected(accesstoken) **POST  /surveys/:surveyId/responses**     - Отправка заполненного ответа
- protected(accesstoken) **GET   /surveys/:surveyId/responses**     - Получение ответов на свою анкету