# SPCasting - Instruções do Projeto

## Objetivo

Este projeto é uma aplicação web para a agência SPCasting gerenciar
vagas temporárias e selecionar freelancers.

Sempre considere estas regras ao criar ou modificar funcionalidades.

## Stack

- React
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- API de Localidades do IBGE
- Lucide React

Não criar backend Node/Express sem solicitação.

## Usuários

Existem dois tipos:

- freelancer
- admin

Existe apenas uma conta administrativa da SPCasting.

Freelancers podem entrar usando:

- email + senha
- Google

Nunca permitir que um freelancer altere seu próprio role para admin.

## Perfil do freelancer

Campos:

- nome
- email
- telefone
- data de nascimento
- Instagram
- cidades[]
- composite

O freelancer pode cadastrar várias cidades.

## Cidades

Usar a API oficial de Localidades do IBGE.

Representação:

interface City {
id: number;
name: string;
uf: string;
}

Sempre comparar cidades pelo ID do IBGE.

## Composite

Cada freelancer possui apenas um composite.

Formatos:

- PDF
- JPG
- JPEG
- PNG
- WEBP

Tamanho máximo: 10 MB.

Armazenar no Firebase Storage.

Um novo upload substitui o anterior.

## Vagas

Cada vaga possui:

- title
- name
- description
- dailyRate
- date
- startTime
- endTime
- city
- location
- maxWorkers
- status
- createdAt
- updatedAt

Status:

- open
- closed
- finished

Somente vagas "open" aparecem como novas oportunidades.

## Candidaturas

Cada candidatura possui:

- jobId
- userId
- status
- createdAt
- selectedAt

Status:

- applied
- selected

Não existe status rejected.

Não permitir candidatura duplicada.

Para se candidatar:

1. usuário autenticado
2. perfil completo
3. composite cadastrado
4. cidade da vaga presente nas cidades do freelancer
5. vaga aberta
6. usuário ainda não inscrito

## Seleção

Admin pode selecionar candidatos.

Quando selecionados >= maxWorkers:

open -> closed

Nunca permitir selecionados > maxWorkers.

Usar transações Firestore quando necessário.

Se um selecionado for removido ou cancelar e houver espaço:

closed -> open

Uma vaga finished nunca deve ser reaberta automaticamente.

## Cancelamento

Freelancer pode cancelar sua candidatura.

Admin também pode remover candidato.

Se uma candidatura comum for removida, ela simplesmente desaparece
das inscrições do freelancer.

## Vagas encerradas

Admin pode encerrar manualmente.

Vagas cuja data já passou devem ser consideradas encerradas.

Status:

finished

Vagas encerradas não aparecem como oportunidades.

## WhatsApp

Admin pode abrir conversa com candidato pelo WhatsApp.

Mensagem inicial pode utilizar:

"Olá, [nome]! Tudo bem? Aqui é da SPCasting. Estou entrando em contato
sobre a vaga [nome da vaga]."

## Firestore

Coleções principais:

users
jobs
applications

Evitar duplicação de dados.

Applications deve referenciar userId e jobId.

## Segurança

Freelancer:

- lê/edita somente próprio perfil
- não altera role
- não acessa dados de outros freelancers
- não acessa composites de outros usuários
- cria/cancela somente próprias candidaturas
- não pode definir status selected
- não gerencia vagas

Admin:

- gerencia vagas
- visualiza candidatos
- visualiza composites
- seleciona candidatos
- remove candidatos

As regras devem existir no Firebase Security Rules.
Não confiar apenas no frontend.

## Organização

Manter:

src/
components/
pages/
contexts/
hooks/
services/
types/
utils/
routes/

Chamadas Firebase devem ficar em services.

Evitar lógica Firebase diretamente dentro dos componentes.

Não usar `any` sem necessidade.

Criar componentes reutilizáveis.

## Interface

- Mobile-first
- Responsiva
- Moderna
- Profissional
- Limpa
- Cards
- Bordas arredondadas
- Sombras discretas
- Loading
- Skeletons quando apropriado
- Toasts
- Estados vazios
- Confirmações para ações destrutivas

Priorizar principalmente a experiência mobile dos freelancers.

## Regra para alterações

Antes de implementar uma funcionalidade:

1. Verifique a estrutura existente.
2. Reutilize componentes e services existentes quando possível.
3. Não duplique lógica.
4. Mantenha os tipos TypeScript atualizados.
5. Preserve as regras de negócio descritas neste arquivo.
6. Não altere funcionalidades existentes sem necessidade.
