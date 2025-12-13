# Guia de Publicação (Deploy) Profissional

Para colocar seu aplicativo no ar para sempre, recomendamos separar o Frontend (Visual) do Backend (Servidor).

## 1. Preparação
Certifique-se de que todo o seu código está no GitHub.

## 2. Publicar o Backend (API) no Render.com
O Render é excelente para hospedar servidores Node.js e bancos de dados.

1. Crie uma conta no [Render.com](https://render.com).
2. Clique em **"New +"** e selecione **"Web Service"**.
3. Conecte seu repositório do GitHub.
4. Preencha os dados:
   - **Name:** `abba-api` (ou outro nome)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Vá na aba **"Environment"** (ou Advanced) e adicione as variáveis de ambiente (copie do seu arquivo `.env`):
   - `PGHOST`: ...
   - `PGDATABASE`: ...
   - `PGUSER`: ...
   - `PGPASSWORD`: ...
   - `PGSSLMODE`: require
6. Clique em **"Create Web Service"**.
7. Aguarde o deploy finalizar. Copie a URL gerada (ex: `https://abba-api.onrender.com`).

## 3. Publicar o Frontend (Visual) na Vercel
A Vercel é a melhor plataforma para React/Vite.

1. Crie uma conta na [Vercel.com](https://vercel.com).
2. Clique em **"Add New..."** -> **"Project"**.
3. Importe seu repositório do GitHub.
4. Nas configurações de **"Environment Variables"**, adicione:
   - **Name:** `VITE_API_URL`
   - **Value:** A URL do seu backend no Render + `/api` (Exemplo: `https://abba-api.onrender.com/api`)
5. Clique em **"Deploy"**.

## Conclusão
Agora você terá dois links:
- O do **Backend** (usado internamente pelo app).
- O do **Frontend** (o link que você vai compartilhar e usar no celular).
