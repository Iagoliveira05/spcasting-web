# Planejamento do SPCasting

## Visão geral

O MVP principal já está implementado. O trabalho restante deve priorizar segurança e consistência dos dados antes de melhorias visuais ou novas funcionalidades.

## Fase 1 — Corrigir riscos de segurança e consistência

- [ ] Unificar a definição da conta administrativa. Hoje o frontend usa `VITE_FIREBASE_ADMIN_UID`, enquanto as regras possuem UID e e-mail fixos; adotar uma única estratégia documentada e segura.
- [ ] Validar nas Security Rules todos os campos editáveis do perfil, especialmente `cities`, seus tipos e chaves permitidas.
- [ ] Fazer a regra de elegibilidade da candidatura comparar cidades pelo `city.id` do IBGE, não pela igualdade do mapa completo.
- [ ] Restringir as chaves permitidas nos documentos de usuário para evitar campos arbitrários.
- [ ] Revisar as transições permitidas de vaga nas regras e impedir alterações incompatíveis com o estado atual.
- [ ] Criar testes automatizados das Security Rules com Firebase Emulator cobrindo proprietário, outro freelancer, admin, candidatura, seleção concorrente e acesso a chunks.

Critério de conclusão: regras publicáveis, testes de permissão passando e uma estratégia única para provisionar o admin.

## Fase 2 — Robustez de uploads

- [ ] Tratar chunks recém-enviados que ficam órfãos quando o usuário abandona a página ou quando o salvamento do perfil falha.
- [ ] Tornar explícita a remoção/substituição de foto e composite, com confirmação quando aplicável.
- [ ] Validar integridade do conjunto de chunks (versão, índices únicos, total e tipo consistentes) ao reconstruir arquivos.
- [ ] Adicionar testes unitários para validação, fragmentação, reconstrução, substituição e falhas parciais de upload.

Critério de conclusão: nenhum fluxo normal deixa arquivos antigos ou uploads não associados indefinidamente.

## Fase 3 — Ciclo de vida das vagas

- [ ] Definir uma estratégia de produção para persistir `finished` sem depender da abertura do painel administrativo. Uma função agendada é a opção indicada caso o projeto possa usar esse recurso; até lá, documentar o comportamento do MVP.
- [ ] Avaliar e implementar exclusão de vaga, caso “gerenciar vagas” inclua exclusão; definir antes o tratamento de candidaturas vinculadas.
- [ ] Bloquear ou orientar edições de `maxWorkers` abaixo do total já selecionado.
- [ ] Criar testes de concorrência para seleção, remoção e reabertura automática.

Critério de conclusão: estados `open`, `closed` e `finished` permanecem coerentes em todos os fluxos e concorrências.

## Fase 4 — Qualidade e experiência

- [ ] Ampliar os testes além dos utilitários atuais: services, rotas protegidas, formulários e fluxos críticos.
- [ ] Adicionar testes ponta a ponta para cadastro, conclusão do perfil, candidatura, seleção e cancelamento.
- [ ] Substituir carregamentos textuais por skeletons nas telas em que isso melhora a percepção de velocidade.
- [ ] Padronizar feedback de sucesso/erro com toasts também nas telas administrativas e de candidaturas.
- [ ] Revisar acessibilidade de diálogos, navegação por teclado, foco e mensagens de formulário.
- [ ] Otimizar assets e divisão de bundle; o build atual alerta para chunk principal acima de 500 kB e há imagens entre aproximadamente 1 MB e 2,3 MB.

Critério de conclusão: fluxos críticos cobertos, interface consistente e carregamento inicial otimizado.

## Fase 5 — Homologação e publicação

- [ ] Executar homologação com contas reais de admin e freelancer em projeto Firebase separado.
- [ ] Validar provedores E-mail/senha e Google, domínios autorizados e restrições da API key.
- [ ] Publicar e validar regras e índices no ambiente alvo.
- [ ] Testar responsividade em celulares reais e nos principais navegadores.
- [ ] Preparar checklist de rollback e monitoramento de erros.

## Rotina de validação

Antes de considerar uma entrega concluída, executar:

```sh
npm test
npm run lint
npm run build
```

Para mudanças em dados ou permissões, executar também a suíte das Security Rules no Firebase Emulator.

