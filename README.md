# SPCasting

Aplicação web para vagas temporárias, perfis de freelancers e seleção de candidatos. Frontend em React, TypeScript, Vite, Tailwind CSS e React Router; autenticação e dados usam Firebase. Municípios e estados vêm da API oficial do IBGE.

## Rodar localmente

1. Instale as dependências: `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Preencha os valores de configuração do app Web Firebase descritos abaixo.
4. Execute `npm run dev`.

Verificações: `npm run build` e `npm run lint`.

## Firebase necessário

Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e registre um app Web. Em **Configurações do projeto > Geral > Seus apps > SDK de configuração**, copie os valores para `.env.local`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

A configuração do SDK Web é entregue ao navegador e não é uma credencial administrativa. Restrinja a chave por domínio no Google Cloud quando publicar; as permissões dos dados dependem das Security Rules, nunca de esconder a chave.

No Console do Firebase:

1. Em **Authentication > Sign-in method**, habilite **E-mail/senha** e **Google**. Inclua `localhost` e o domínio publicado em **Authorized domains**.
2. Crie o banco em **Firestore Database** (modo de produção).
3. Publique regras e índices com Firebase CLI, depois de escolher o projeto em `firebase use --add`:

   ```sh
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   A configuração está em `firebase.json`; não é necessário criar servidor Express ou backend próprio.

## Conta administrativa única

1. Crie a conta SPCasting em **Authentication > Users**, usando o provedor E-mail/senha habilitado.
2. Copie o UID dessa conta.
3. No Firestore Console, crie manualmente `users/{UID}` com `uid` igual ao UID e os campos `name`, `email`, `phone`, `birthDate`, `instagram`, `cities: []`, `compositeUrl: ""`, `compositePath: ""`, `compositeType: null`, `role: "admin"`, `createdAt` e `updatedAt` (timestamps).
4. Entre pelo `/login`. A conta administrativa só é provisionada pelo Console. Regras impedem que um freelancer altere seu `role` para `admin`.

Não crie documento admin por formulário e nunca inclua credenciais de conta de serviço no frontend.

## Arquivos do Firebase

- `firestore.rules`: perfis privados, vagas publicáveis, candidatura própria e alterações administrativas.
- `firestore.indexes.json`: isenção de índice para os dados binários dos
  composites; as listagens não dependem de índices compostos.

Os composites são divididos em documentos de até 400 KiB na subcoleção
`users/{uid}/compositeChunks`. O arquivo continua privado, pode ter até 10 MB e
só pode ser lido pelo proprietário ou pelo admin. Essa solução usa a franquia
gratuita do Firestore e não requer Firebase Storage, bucket, CORS ou plano
Blaze.

## Limite conhecido do MVP

A data da vaga é comparada em horário local; oportunidades passadas deixam de aparecer e são exibidas como encerradas. A persistência definitiva de `finished` acontece ao carregar a lista administrativa. Para encerramento pontual mesmo sem ninguém acessar o painel, a próxima etapa de produção é uma função agendada do Firebase (Cloud Functions), sem necessidade de servidor Express.

O fluxo de seleção usa transação Firestore e contador na vaga para evitar ultrapassar `maxWorkers`. A API do IBGE não requer chave. Não há chave real no repositório; preencha apenas `.env.local` no seu ambiente.
