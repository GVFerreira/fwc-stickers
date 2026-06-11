# ⚽ FIFA WC 2026 — Álbum de Figurinhas Tracker

App pessoal para controlar as figurinhas do álbum da Copa do Mundo 2026.

## Stack

- **Next.js 15** (App Router)
- **Prisma** (ORM)
- **MongoDB Atlas** (banco de dados)
- **Vercel** (deploy)

## Setup local

### 1. Clone e instale

```bash
git clone <seu-repo>
cd fifa-stickers
npm install
```

### 2. Configure o banco

Crie um cluster gratuito no [MongoDB Atlas](https://cloud.mongodb.com), depois:

```bash
cp .env.example .env.local
# Edite .env.local com sua connection string
```

### 3. Gere o Prisma client

```bash
npx prisma generate
```

### 4. Rode o app

```bash
npm run dev
```

Acesse `http://localhost:3000`

### 5. Inicialize o álbum

Na primeira vez, clique em **"Inicializar Álbum"** ou acesse:

```
POST http://localhost:3000/api/seed
```

Isso cria todas as 980 figurinhas no banco como "não coladas".

---

## Como usar

- **Clicar numa figurinha cinza** → marca como colada (verde ✓)
- **Clicar numa figurinha verde** → remove (volta ao cinza)
- **Barra de busca** → filtra por nome do time ou prefixo (ex: BRA, FWC)
- **Filtros** → ver todas / só coladas / só faltando
- **Stats** → painel superior mostra total, coladas, faltando e % de progresso

---

## Deploy na Vercel

1. Push para GitHub
2. Import no [Vercel](https://vercel.com)
3. Adicione a variável `DATABASE_URL` nas Environment Variables do projeto
4. Deploy ✅

---

## Estrutura do álbum

| Seção | Figurinhas |
|-------|-----------|
| FWC (especiais) | FWC00–FWC19 = 20 |
| 48 seleções × 20 | = 960 |
| **Total** | **980** |

Os grupos A–L têm 4 times cada. Os prefixos dos times seguem o padrão do álbum Panini oficial — atualize `src/lib/stickers-data.ts` com os prefixos corretos quando o álbum for lançado.

## Atualizar times

Quando o álbum oficial sair com os 48 times confirmados, edite o array `TEAMS` em:

```
src/lib/stickers-data.ts
```

Cada time tem:
```ts
{ code: "BRA", name: "Brazil", flag: "🇧🇷", group: "C" }
```

`code` = prefixo das figurinhas no álbum (ex: `BRA` → `BRA00`–`BRA19`)
