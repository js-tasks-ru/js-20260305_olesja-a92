## To start project:

Для старта проекта необходимо выполнить следующие команды:

* `npm install` - установит необходимые зависимости

**Note:** У вас уже должна быть установлена Nodejs 
Проверить текущие версии можно набрав в консоли/терминале следующие команды: `node -v` и `npm -v`.

Версии требуемые проектом указаны в `package.json` в поле `engines`  

## To run tests:

### To run all tests
Чтобы запустить тесты, воспользуйтесь командой:

`npm run test`

### To run tests from a specific directory

Чтобы запустить тесты из определенной директории, воспользуйтесь командой:

`npm run test -- 02-javascript-data-types/1-sort-strings/**/*.spec.js`

"02-javascript-data-types" - это имя директории модуля  
"1-sort-strings" - имя директории задачи  

### To run a single test

Чтобы запустить только один тест, можно воспользоваться командой:

`npm run test:specific -- '<describeString> <itString>'`

к примеру команда:

`npm run test:specific -- 'javascript-data-types/sort-strings'`

выполнит весь блок `describe`, а команда 

`npm run test:specific -- 'javascript-data-types/sort-strings should correctly sort strings started from uppercase'`

выполнит только блок `it` с соответствующим названием.  
Более подробно про запуск тестов можно посмотреть в документации [Vitest](https://vitest.dev/guide/cli.html#-t-testnamepattern)

## To run type-check:

Чтобы проверить типы TypeScript без генерации файлов:

`npm run typecheck`

Чтобы скомпилировать `.ts` в `.js` (опционально, Vite делает это сам при запуске dev server):

`npm run build:ts`

## To run dev server:

Для каждого модуля есть отдельный dev server (Vite).  
Vite сам компилирует TypeScript, запускать `tsc --watch` не нужно.
Для запуска конкретной задачи:

- `npm run dev:task -- 05-dom-document-loading/1-notification`
- или `npm run dev:05:1-notification` (алиасы есть для всех задач 04-10)

Открывайте нужный `index.html` внутри модуля, например:

`http://localhost:5173`
