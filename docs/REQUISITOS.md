# Requisitos do SPCasting

## 1. Objetivo

Aplicação web para a agência SPCasting publicar vagas temporárias, receber candidaturas de freelancers e selecionar profissionais.

## 2. Stack e arquitetura

- React, TypeScript e Vite.
- Tailwind CSS e Lucide React na interface.
- React Router DOM para navegação.
- Firebase Authentication para autenticação.
- Cloud Firestore para dados e arquivos fragmentados.
- API oficial de Localidades do IBGE para estados e municípios.
- Não criar backend Node/Express sem solicitação explícita.
- Manter chamadas ao Firebase em `src/services` e tipos em `src/types`.
- Priorizar componentes reutilizáveis e evitar `any` sem necessidade.

## 3. Papéis e autenticação

### Freelancer

- Pode criar conta e entrar com e-mail e senha.
- Pode entrar com Google.
- Pode ler e editar somente o próprio perfil.
- Não pode alterar o próprio papel para `admin`.
- Não pode acessar perfis ou composites de outros freelancers.
- Não pode criar, alterar ou excluir vagas.
- Pode criar e cancelar somente as próprias candidaturas.
- Não pode definir uma candidatura como `selected`.

### Administrador

- Existe somente uma conta administrativa da SPCasting.
- Pode gerenciar vagas.
- Pode listar e visualizar candidatos e seus composites.
- Pode selecionar, desselecionar e remover candidatos.
- Pode iniciar conversa com candidatos pelo WhatsApp.

As autorizações devem ser garantidas pelas Firebase Security Rules, independentemente das proteções do frontend.

## 4. Perfil do freelancer

O perfil contém:

- nome;
- e-mail;
- telefone;
- data de nascimento;
- Instagram;
- banco para recebimento;
- chave PIX;
- uma ou mais cidades;
- foto de perfil;
- um composite.

Todos esses campos são obrigatórios para candidatura. O Instagram deve aceitar entrada com ou sem `@`, ser armazenado no formato `@usuario` e ser exibido como link clicável. Banco e chave PIX devem ser privados e visíveis somente ao próprio freelancer e ao administrador.

## 5. Cidades

Usar a API oficial do IBGE e representar cada cidade assim:

```ts
interface City {
  id: number;
  name: string;
  uf: string;
}
```

O freelancer pode cadastrar várias cidades. Toda comparação de cidade, inclusive nas Security Rules, deve usar o ID do município no IBGE.

## 6. Foto de perfil

- Formatos aceitos: JPG, JPEG, PNG e WEBP.
- Tamanho máximo: 5 MB.
- Armazenamento privado no Firestore em chunks menores que 1 MiB.
- Um novo upload substitui o anterior.
- Apenas o titular e o administrador podem ler os chunks.

## 7. Composite

- Cada freelancer possui apenas um composite ativo.
- Formatos aceitos: PDF, JPG, JPEG, PNG e WEBP.
- Tamanho máximo: 10 MB.
- Armazenamento privado no Firestore em chunks menores que 1 MiB, sem Firebase Storage e sem dependência do plano Blaze.
- Um novo upload substitui o anterior.
- Apenas o titular e o administrador podem ler os chunks.

## 8. Vagas

Uma vaga contém:

- `title`;
- `name`;
- `description`;
- `dailyRate`;
- `date`;
- `startTime`;
- `endTime`;
- `city`;
- `location`;
- `maxWorkers`;
- `status`;
- `createdAt`;
- `updatedAt`.

Status permitidos: `open`, `closed` e `finished`.

- Somente vagas `open` e não vencidas aparecem como oportunidades.
- O administrador pode encerrar uma vaga manualmente.
- Vagas cuja data passou devem ser consideradas `finished` e não podem aparecer como oportunidades.

## 9. Candidaturas

Uma candidatura contém:

- `jobId`;
- `userId`;
- `status`;
- `createdAt`;
- `selectedAt`.

Status permitidos: `applied` e `selected`. Não existe status `rejected`.

Para se candidatar, é necessário:

1. estar autenticado;
2. ter o perfil completo, incluindo foto e composite;
3. possuir, pelo ID do IBGE, a cidade da vaga no perfil;
4. a vaga estar aberta e não vencida;
5. ainda não possuir candidatura para a vaga.

O identificador determinístico da candidatura deve impedir duplicidade.

## 10. Seleção e cancelamento

- O administrador pode selecionar candidatos usando transação no Firestore.
- O número de selecionados nunca pode superar `maxWorkers`.
- Ao atingir o limite, a vaga muda de `open` para `closed`.
- Ao desfazer uma seleção, cancelar ou remover um selecionado, uma vaga fechada automaticamente volta a `open` se houver espaço.
- Uma vaga `finished` ou fechada manualmente nunca é reaberta automaticamente.
- O freelancer pode cancelar a própria candidatura.
- O administrador pode remover qualquer candidato da vaga.
- Uma candidatura removida desaparece das inscrições do freelancer.

## 11. WhatsApp

O administrador pode abrir uma conversa usando a mensagem inicial:

> Olá, [nome]! Tudo bem? Aqui é da SPCasting. Estou entrando em contato sobre a vaga [nome da vaga].

## 12. Dados e segurança

Coleções principais: `users`, `jobs` e `applications`. As candidaturas referenciam apenas `userId` e `jobId`, evitando duplicação de dados.

Requisitos adicionais das regras:

- validar formato e propriedade dos documentos e chunks;
- validar cidades recebidas no perfil;
- comparar elegibilidade de cidade pelo ID do IBGE;
- impedir escalada de papel;
- preservar invariantes de seleção em operações concorrentes;
- permitir leitura de arquivos privados somente ao proprietário ou admin.

## 13. Interface

- Mobile-first e responsiva, com prioridade à experiência do freelancer.
- Visual moderno, profissional e limpo.
- Cards, bordas arredondadas e sombras discretas.
- Estados de carregamento e skeletons quando apropriado.
- Toasts, estados vazios e mensagens de erro claras.
- Confirmação antes de ações destrutivas.
- Visitantes não autenticados visualizam a página Sobre em tela cheia e podem acessar login ou cadastro a partir dela.
- A página Sobre deve manter botões de entrada e cadastro sempre visíveis durante a rolagem.
- A listagem e os detalhes de vagas exigem autenticação.
- A barra lateral e suas abas são exibidas somente após o login.
- As telas de login e cadastro oferecem autenticação com Google.

