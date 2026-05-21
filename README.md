# Sistema de Bingo Real-time

Este projeto é uma aplicação web para gerenciamento e visualização de sorteios de bingo em tempo real, utilizando Firebase como backend.

## Estrutura Básica do Projeto

- **control.html / script.js**: Painel do organizador. Permite criar eventos, gerenciar sessões, definir prêmios/padrões e realizar sorteios.
- **view.html / view.js**: Interface do espectador. Consome os dados em tempo real e permite visualizar um resumo de todas as sessões e rodadas.
- **style.css**: Estilos compartilhados entre ambas as interfaces.
- **firebase-config.js**: Arquivo contendo as credenciais de conexão com o Firebase.

## Armazenamento de Dados

### Local (Navegador)
- **Organizador (Control)**: Utiliza `localStorage` (`bingoEventData`) para persistência offline completa e `bingoUserEvents` para o índice de eventos criados.
- **Espectador (View)**: Utiliza `sessionStorage` (`activeBingoId`) para manter a conexão com o evento mesmo após atualizações de página.

### Firebase Realtime Database
Os dados são estruturados para minimizar o tráfego de rede:

1.  **evt/[eventId]**: Armazena metadados do evento (nome, ícone, proprietário) e a estrutura das sessões/rodadas (prêmios e padrões).
2.  **nums/[eventId]/[sessionIndex]/[roundNumber]**: Nó separado contendo apenas o array de números sorteados (`dns`). Isso permite que espectadores escutem apenas os números novos sem baixar toda a estrutura do evento novamente.
3.  **uevts/[uid]/[eventId]**: Um índice simples (ID: true) para que o organizador possa listar e recuperar seus próprios eventos ao fazer login.

## Configuração do Firebase

Para colocar o projeto em funcionamento, siga estes passos:

### 1. Criação do Projeto
1. Vá para o Firebase Console.
2. Clique em "Adicionar projeto" e siga as instruções.
3. Na página de visão geral, adicione um aplicativo "Web". Registre o app e copie o objeto `firebaseConfig`.

### 2. Ativação dos Serviços
1. **Authentication**: 
   - Vá em "Authentication" > "Get Started".
   - Ative o provedor de login "Google".
2. **Realtime Database**:
   - Vá em "Realtime Database" > "Criar banco de dados".
   - Escolha a localização e inicie em "Modo de Teste" (ou aplique as regras abaixo).

### 3. Regras de Segurança
No painel do Realtime Database, clique na aba **Regras** e utilize a seguinte configuração para garantir a segurança dos dados:

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