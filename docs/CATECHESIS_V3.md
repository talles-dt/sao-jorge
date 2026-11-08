# Catequese São Jorge V3

## Escopo

A V3 substitui operacionalmente a grade de 31 encontros por três módulos quadrimestrais independentes: básico, intermediário e avançado. Cada módulo possui oito encontros quinzenais e uma única turma híbrida, presencial e online.

O sistema não inclui provas, certificados, cobrança, gamificação, mentoria ou registro de disciplina espiritual. A equipe de catequese opera inscrições, matrículas, links e gravações sem tarefa ordinária para o sacerdote.

## Componentes

- D1 armazena módulos versionados, temas, turmas, encontros, inscrições, matrículas, tokens, sessões e auditoria.
- O Worker oferece cadastro público, magic link, área autenticada e rotas administrativas protegidas por Cloudflare Access.
- Cloudflare Stream entrega gravações privadas por token. O acesso padrão termina 30 dias após a publicação.
- O site Next.js oferece currículo, inscrição, área do aluno e painel da equipe.

## Segredos obrigatórios

Configurar separadamente em staging e produção:

- `RESEND_KEY`
- `CLOUDFLARE_STREAM_CUSTOMER_CODE` como variável do ambiente

O remetente `CATECHESIS_FROM_EMAIL` deve usar domínio verificado no provedor de e-mail. O binding `STREAM` força `requireSignedURLs` e restringe cada gravação à origem do site quando a equipe associa o UID à aula.

## Ordem segura de publicação

1. Conferir conta, banco e namespace do ambiente.
2. Configurar os quatro segredos.
3. Aplicar `008_catechesis_platform.sql` no D1 do ambiente.
4. Publicar o Worker e o site.
5. Criar uma turma de teste no painel.
6. Validar inscrição, aprovação, magic link, janela ao vivo e expiração da gravação.
7. Só então repetir em produção.

O dry run confirma apenas empacotamento e bindings. Não comprova envio de e-mail, cookies entre origens, autorização do Stream ou comportamento do ambiente publicado.
