# Projeto final do NES

Este projeto consiste em:

- **Backend** em Flask (Python), com suporte a SQLite, JWT para autenticação e rotas para gerenciar a lista de faculdades (endereços `/api/register`, `/api/login`, `/api/schools`, etc.).
- **Frontend** em React, com integração de **drag-and-drop** (via `@hello-pangea/dnd`), salvando a lista de faculdades tanto no **localStorage** quanto no **backend** (se o usuário estiver autenticado).
- **Autenticação** usando [React Auth Kit](https://github.com/react-auth-kit/react-auth-kit).

A aplicação permite:
1. **Registro** de usuários (persistência em SQLite).
2. **Login** para obter um token JWT (armazenado localmente via React Auth Kit).
3. **Manutenção da lista de faculdades** (drag-and-drop, adicionar, editar, remover).
4. **Sincronização** local (localStorage) e servidor (SQLite) usando `last_modified`.

---

## Instruções de Instalação

### 1) Backend (Flask)

1. Acesse a pasta **backend**:
```
cd backend
```

2. Instale as dependências:
```
pip install -r requirements.txt
```

3. Inicie o servidor Flask:
```
python app.py
```
Por padrão, rodará em [http://127.0.0.1:5000](http://127.0.0.1:5000).

> **Observação**: Em produção, configure a variável de ambiente `JWT_SECRET_KEY`. No desenvolvimento local, ela pode ser definida no próprio código ou via `os.environ`.

### 2) Frontend (React)

1. Acesse a pasta **frontend**:
```
cd ../frontend
```

2. Instale as dependências:
```
npm install
```

3. Inicie o servidor de desenvolvimento:
```
npm run dev
```
Por padrão, rodará em [http://localhost:5173](http://localhost:5173).
