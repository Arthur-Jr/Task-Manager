# Projeto Task Manager

# Contexto
Gerenciador de tarefas.

## Técnologias usadas

Front-end:
> Desenvolvido usando: React, HTML5, ES6

Back-end:
> Desenvolvido usando: NodeJS, ExpressJS, MongoDB, ES6

## Clonando o projeto

Copie e cole em seu terminal:

```git clone git@github.com:Arthur-Jr/Task-Manager.git ```

## Instalando Dependências

> Backend

Na raiz do projeto:
```bash
cd back-end/ 
``` 
depois instale as dependências do back-end:
```bash
npm install
``` 

> Frontend

Na raiz do projeto:
```bash
cd front-end/
``` 
depois instale as dependências do front-end:
```bash
npm install
``` 
## Executando aplicação

* Para rodar o back-end:

  É necessário o mongodb estar ativo:
  ```bash
  sudo service mongod start 
  ```
  
  depois pode iniciar a aplicação:
  ```
  cd back-end/ && npm start
  ```

* Para rodar o front-end:

  Em outra aba do terminal:
  ```
    cd front-end/ && npm start
  ```

## Executando Testes

* Para rodar todos os testes:
  > Backend
  
  É necessário parar a aplicação do back-end para rodar os testes do mesmo, CTRL + C no terminal em que a aplicação do back-end
  está rodando ira para-lo.
  
  E agora só rodar o test:
  ```
    cd back-end/ && npm test
  ```
  
 * Teste com a Porcentagem de cobertura:

    ```
    cd back-end/ && npm run test:coverage
    ```
