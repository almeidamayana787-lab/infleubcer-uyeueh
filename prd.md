# PRD: App "Nubank" - Notificações de Pix Simulado (Marketing)

## 1. Objetivo
Criar uma experiência visual de alta fidelidade para marketing e influencers, simulando o recebimento de Pix em tempo real através de um aplicativo "espelho" instalado no iOS, conectado ao ecossistema do cassino.

---

## 2. Lógica do Cassino (Backend Laravel)

### A. Perfil do Usuário
*   **Identificação**: O sistema deve checar as flags `is_demo` ou `is_influencer` no model `User`.
*   **Segurança**: Se o usuário não possuir essas flags, o fluxo de pagamento real (GGPIX) é obrigatório.

### B. Depósito Simulado (Fluxo de 8 Segundos)
1.  **Geração**: Ao clicar em "Depositar", o sistema gera um QR Code e código copia-e-cola fictícios.
2.  **Temporizador**: O frontend exibe os dados e inicia um countdown de 8 segundos.
3.  **Confirmação Automática**: Após 8s, o frontend dispara uma requisição para `/api/demo/confirm-deposit`.
4.  **Processamento**: O backend valida as permissões e credita o valor instantaneamente no `balance`.

### C. Saque Simulado (Gatilho de Notificação)
1.  **Ação**: O influencer solicita um "Saque" no painel do cassino.
2.  **Registro**: O sistema abate o saldo visual e cria uma entrada na tabela `demo_notifications`.
3.  **Dados**: Armazena `amount`, `title` ("Pix Recebido"), e `message` ("Você acaba de receber um Pix de R$ [VALOR] de Cash On Pay LTDA").

---

## 3. Lógica do App "Nubank" (React Native Expo)

### A. O Aplicativo
*   **Nome**: Nubank
*   **Interface**: Tela minimalista (branca ou roxa padrão Nubank) com status de conexão.
*   **Ícone**: Logotipo oficial do Nubank (para máximo realismo no Sideload).

### B. Mecanismo de Escuta (Long Polling)
O app não utilizará Push Notifications (FCM). Ele fará requisições HTTP silenciosas a cada 2 segundos.

```javascript
// Exemplo de lógica central no App.js do Expo
setInterval(async () => {
  const res = await fetch('https://seu-cassino.com/api/demo/notifications', {
    headers: { 'Authorization': 'Bearer INFLUENCER_TOKEN' }
  });
  const data = await res.json();
  
  if (data.new_pix) {
    // Dispara a notificação local que aparece no topo do iOS
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Pix recebido!",
        body: `Você recebeu um Pix de R$ ${data.new_pix.amount}.00 de Cash On Pay LTDA.`,
        sound: 'default',
      },
      trigger: null,
    });
  }
}, 2000);
```

---

## 4. Estratégia de Deploy e Instalação (Linux & iOS)

1.  **Compilação**: O código React Native será enviado ao GitHub.
2.  **Build .ipa**: Utilizar GitHub Actions para compilar o binário `.ipa` sem necessidade de Mac local.
3.  **Assinatura**: Utilizar o software **Sideloadly** no Linux/Windows.
4.  **Instalação**: Conectar o iPhone via USB, carregar o `.ipa`, assinar com o Apple ID pessoal e instalar.
5.  **Confiança**: Autorizar o desenvolvedor em *Ajustes > Geral > Gestão de Dispositivos*.

---

## 5. Tabela de Banco de Dados (Sugestão)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | BigInt | ID Único |
| `user_id` | Foreign Key | ID do Influencer |
| `amount` | Decimal | Valor do "Pix" |
| `status` | Enum | pending, sent, viewed |
| `created_at` | Timestamp | Hora do "Saque" |
