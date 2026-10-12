# Progresso do SPCasting

Última auditoria: 12 de outubro de 2026.

## Resumo

O projeto possui um MVP funcional e compila sem erros. Os fluxos principais de freelancer e administrador estão presentes. As pendências mais relevantes estão nas regras de segurança, testes de integração, limpeza de uploads órfãos e automação definitiva do encerramento por data.

## Implementado

### Fundação

- [x] React, TypeScript e Vite configurados.
- [x] Tailwind CSS, Lucide React e React Router DOM instalados.
- [x] Firebase Authentication e Cloud Firestore integrados por services.
- [x] Organização em `components`, `pages`, `contexts`, `hooks`, `services`, `types`, `utils` e `routes`.
- [x] Rotas lazy-loaded e proteção específica para área autenticada e administrativa.
- [x] Layout responsivo com navegação desktop e mobile, estados vazios e feedbacks de carregamento.

### Autenticação e perfil

- [x] Cadastro e login com e-mail/senha.
- [x] Login com Google.
- [x] Cadastro com Google.
- [x] Criação automática do perfil de freelancer.
- [x] Visitantes recebem a página Sobre em tela cheia; vagas e navegação lateral exigem login.
- [x] A página Sobre mantém ações flutuantes e chamativas para entrar ou criar conta, inclusive no mobile.
- [x] Perfil com nome, e-mail, telefone, nascimento, Instagram, banco, chave PIX, cidades, foto e composite.
- [x] Normalização do Instagram com `@` e links clicáveis nas telas administrativas.
- [x] Seleção de múltiplas cidades pela API oficial do IBGE, sem duplicar IDs.
- [x] Verificação de perfil completo antes da candidatura no frontend e nas regras.
- [x] Banco e chave PIX obrigatórios para novas candidaturas e visíveis ao admin no perfil do candidato.

### Arquivos privados

- [x] Foto JPG/JPEG/PNG/WEBP de até 5 MB.
- [x] Recorte da foto antes do envio.
- [x] Composite PDF/JPG/JPEG/PNG/WEBP de até 10 MB.
- [x] Foto e composite fragmentados em chunks de 400 KiB no Firestore.
- [x] Leitura dos chunks limitada ao proprietário e ao admin nas regras.
- [x] Exclusão da versão anterior após salvar uma substituição no perfil.

### Vagas

- [x] Criação e edição de vagas pelo admin.
- [x] Dados, tipos e status `open`, `closed` e `finished` implementados.
- [x] Listagem pública somente de vagas abertas e não vencidas.
- [x] Detalhes da vaga e validação de elegibilidade do freelancer.
- [x] Listagem administrativa com filtros, ordenação e contadores.
- [x] Encerramento manual pelo admin.
- [x] Vagas vencidas são tratadas como encerradas no frontend e persistidas ao carregar a listagem administrativa.

### Candidaturas e seleção

- [x] ID determinístico `jobId_userId`, impedindo candidatura duplicada.
- [x] Candidatura condicionada a autenticação, perfil completo, cidade compatível e vaga aberta.
- [x] Área “Minhas inscrições” e cancelamento com confirmação.
- [x] Listagem e perfil de candidatos para o admin.
- [x] Seleção/deseleção e remoção com transações Firestore.
- [x] Limite de selecionados e fechamento automático ao atingir `maxWorkers`.
- [x] Reabertura automática quando surge vaga, exceto para vagas encerradas ou fechadas manualmente.
- [x] Acesso ao WhatsApp com mensagem inicial preenchida.

### Segurança já presente

- [x] Freelancer não pode trocar seu `role` para admin pelo fluxo normal das regras.
- [x] Perfil e chunks privados para proprietário/admin.
- [x] Gestão de vagas e seleção restritas ao admin.
- [x] Criação e cancelamento de candidatura restritos ao próprio freelancer.
- [x] Validações de formato, tamanho de chunk, MIME type e limites de seleção nas regras.

## Pendente ou precisa de correção

### Prioridade alta

- [ ] Corrigir a comparação de cidade nas Security Rules: `cities.hasAny([target.city])` compara o mapa completo, enquanto o requisito determina comparação pelo ID do IBGE.
- [ ] Resolver a inconsistência do admin: `authService` usa `VITE_FIREBASE_ADMIN_UID`, as regras permitem bootstrap apenas para UID/e-mail fixos e o README orienta criação manual. Isso pode impedir o fluxo esperado ou deixar configurações divergentes.
- [ ] Validar estrutura e conteúdo de `cities` ao criar/editar usuários nas regras; atualmente `validCity` é aplicada às vagas, mas não à lista do perfil.
- [ ] Restringir as chaves permitidas no documento de usuário e testar formalmente a impossibilidade de escalada de privilégios.
- [ ] Criar testes das Firebase Security Rules. Não há suíte de Emulator no projeto.

### Prioridade média

- [ ] Limpar uploads órfãos quando foto/composite é enviado, mas o perfil não é salvo ou a página é abandonada.
- [ ] Fortalecer a reconstrução de arquivos, verificando índices únicos e metadados consistentes entre chunks.
- [ ] Persistir automaticamente vagas vencidas como `finished` sem depender de acesso ao painel admin.
- [ ] Definir se o admin precisa excluir vagas. As regras permitem exclusão, mas não há service nem ação na interface.
- [ ] Cobrir services, componentes e fluxos com testes; hoje existem somente 9 testes de utilitários.
- [ ] Adicionar testes de integração e ponta a ponta para os fluxos críticos.

### Melhorias

- [ ] Usar skeletons nas telas com carregamento mais perceptível.
- [ ] Padronizar toasts em todos os fluxos; algumas telas ainda usam avisos inline.
- [ ] Otimizar o bundle principal e imagens grandes. O build gera um chunk JS principal de cerca de 832 kB (252 kB gzip) e alerta por ultrapassar 500 kB.
- [ ] Revisar acessibilidade e foco dos diálogos e confirmações nativas.

## Verificações executadas na auditoria

| Verificação | Resultado |
| --- | --- |
| `npm test` | Aprovado: 3 arquivos, 9 testes |
| `npm run lint` | Aprovado, sem erros |
| `npm run build` | Aprovado |
| TypeScript | Aprovado pelo `tsc -b` do build |
| Bundle | Build concluído com alerta de chunk acima de 500 kB |
| Security Rules | Revisão estática realizada; testes automatizados ausentes |

## Próximo marco recomendado

Concluir a Fase 1 de `PLANEJAMENTO.md`: alinhar o provisionamento do admin, corrigir a validação de cidades e adicionar testes das regras. Esses itens protegem as regras centrais do negócio antes da homologação.

