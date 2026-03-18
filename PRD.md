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
3.  **Dados**: Armazena `amount`, `title` ("Pix Recebido"), e `message` ("Você recebeu uma transferência de R$ [VALOR] de PAGFAST PAGAMENTOS LTDA.").

---

## 3. Lógica do App "Nubank" (React Native Expo)

### A. O Aplicativo
*   **Nome**: Nubank
*   **Interface**: Tela minimalista (branca ou roxa padrão Nubank) com status de conexão.
*   **Ícone**: Logotipo oficial do Nubank (para máximo realismo no Sideload).

### B. Mecanismo de Conexão e Polling
O app possui uma camada de persistência para facilitar o uso pelo influencer:

1.  **Entrada de Token**: Ao abrir o app pela primeira vez, o influencer cola o seu "Bearer Token" (obtido no cassino).
2.  **Persistência**: O app utiliza `AsyncStorage` para salvar esse token.
3.  **Vigia (Long Polling)**: O app faz requisições HTTP silenciosas a cada 2 segundos para o endpoint `/api/demo/notifications`.
4.  **Acknowledge (visto)**: Após exibir a notificação no iOS, o app envia um POST para marcar a notificação como vista, evitando repetições.

```javascript
// Resumo da lógica de Polling
const pollNotifications = setInterval(async () => {
  const res = await fetch(`${CASINO_URL}/api/demo/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  
  if (data.new_pix) {
    // Exibe o banner oficial do iOS usando título e corpo vindo da API
    Notifications.scheduleNotificationAsync({
       content: { 
         title: data.new_pix.title, 
         body: data.new_pix.message 
       },
       trigger: null,
    });
    // Avisa o servidor para parar de enviar este ID
    await fetch(`${CASINO_URL}/api/demo/notifications/${data.new_pix.id}/viewed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}, 2000);
```

---

## 4. Estratégia de Deploy e Instalação (Linux & iOS)

1.  **Compilação**: O código React Native será enviado ao GitHub.
2.  **Build .ipa**: Utilizar GitHub Actions para compilar o binário `.ipa`.
3.  **Assinatura**: Utilizar o software **Sideloadly** no Linux/Windows.
4.  **Instalação**: Conectar o iPhone via USB, carregar o `.ipa`, assinar com o Apple ID pessoal e instalar.
5.  **Confiança**: Autorizar o desenvolvedor em *Ajustes > Geral > Gestão de Dispositivos*.

---

## 5. Tabela de Banco de Dados (`demo_notifications`)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | BigInt | ID Único |
| `user_id` | Foreign Key | ID do Influencer |
| `amount` | Decimal | Valor do "Pix" |
| `status` | Enum | pending, viewed |
| `created_at` | Timestamp | Hora do "Saque" |
