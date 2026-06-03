# Sistema de Bingo Real-time

Uma aplicação web robusta e performática para gerenciamento e visualização de sorteios de bingo em tempo real. O sistema utiliza uma arquitetura baseada em eventos, permitindo que um organizador gerencie múltiplas sessões simultâneas enquanto centenas de espectadores acompanham os resultados instantaneamente via Firebase Realtime Database.

## Funcionalidades Principais

- **Painel do Organizador (`control.html`)**:
  - Criação e reordenação de múltiplas sessões/rodadas por evento.
  - Gerenciamento de prêmios e padrões de vitória (Linha, Coluna, Diagonal, etc).
  - Sorteio manual ou automático com prevenção de duplicidade.
  - Exportação/Importação de eventos em JSON e duplicação de projetos.
  - Login via Google para sincronização entre dispositivos.
- **Interface do Espectador (`view.html`)**:
  - Sincronização automática com a rodada ativa do organizador.
  - Modo "Resumo do Evento" para conferência de rodadas passadas.
  - Animação visual dos padrões de batida.
  - Ajuste dinâmico do tamanho das bolas e ordenação (Crescente/Sorteio).
  - Otimização de bateria com desconexão automática em abas inativas.

## Persistência e Sincronização

### Local (Navegador)
- **Organizador (Control)**: Utiliza `localStorage` (`bingoEventData`) para persistência offline completa e `bingoUserEvents` para o índice de eventos criados.
- **Espectador (View)**: Utiliza `sessionStorage` (`activeBingoId`) para manter a conexão resiliente a recarregamentos de página.

### Firebase Realtime Database
A estrutura de dados foi projetada para **sincronização granular**, minimizando o consumo de banda (importante para planos Spark/Blaze):

1.  **`/evt/[eventId]`**: Metadados (nome, ícone, dono) e estrutura das rodadas.
2.  **`/nums/[eventId]/[sessionIdx]/[roundNum]`**: Nó de alta frequência contendo apenas o array `dns` (números sorteados). Espectadores ouvem apenas este nó durante o jogo.
3.  **`/uevts/[uid]/[eventId]`**: Índice de posse para recuperação de eventos pós-login.

## Configuração

### 1. Requisitos do Firebase Console
1. Ative o **Authentication** com o provedor **Google**.
2. Crie um **Realtime Database**.
3. Registre um **Web App** e insira as credenciais no arquivo `public/firebase-config.js`.

### 2. Regras de Segurança (Obrigatório)
Para proteger seus dados e garantir que apenas o criador possa editar seus próprios eventos, utilize as regras abaixo:

```json
{
  "rules": {
    "evt": {
      ".read": "true",
      "$event_id": {
        ".write": "auth != null && (!data.exists() || data.child('ouid').val() === auth.uid)"
      }
    },
    "nums": {
      ".read": "true",
      "$event_id": {
        ".write": "auth != null && root.child('evt').child($event_id).child('ouid').val() === auth.uid"
      }
    },
    "uevts": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### 4. Configuração do Código
1. No diretório `public`, localize o arquivo `firebase-config.js`.
2. Substitua os valores das chaves (`apiKey`, `authDomain`, etc.) pelos valores que você copiou ao registrar o aplicativo web no passo 1.3.

## Requisitos de Execução
Devido às políticas de segurança do Firebase Auth e do navegador, o projeto deve ser servido via servidor local ou hospedagem (ex: Firebase Hosting, Live Server do VS Code). Abrir o arquivo `control.html` diretamente via `file://` pode impedir o funcionamento do login e da sincronização.