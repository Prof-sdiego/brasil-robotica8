# Melhorar a experiência do aluno e o aviso do banheiro

## O que será alterado
- Reorganizar o painel do aluno para deixar as ações do dia mais fáceis de encontrar, destacando presença, banheiro e materiais.
- Mostrar no painel o estado da fila do banheiro da equipe, incluindo quem espera, posição e quem está fora.
- Quando chegar a vez de alguém da equipe, abrir um aviso grande e persistente em qualquer tela do aluno.
- Tocar um alerta forte e repetido, disparar uma notificação do Chromebook quando permitido e aplicar uma animação de tremor na página.
- Oferecer um botão simples para ativar notificações; se o navegador não permitir, o aviso visual e sonoro continuam funcionando.

## Detalhes técnicos
- Reaproveitar a atualização em tempo real já existente para identificar a mudança de `fila` para `fora`.
- Usar Web Audio para o som, Notifications API para o aviso do sistema e animação CSS com suporte a `prefers-reduced-motion`.
- Evitar alertas repetidos para a mesma ida, mantendo o aviso acessível até o aluno confirmar.
- Validar em tela de Chromebook e celular, incluindo o comportamento da fila e ausência de estouro horizontal.
