# Firebase Roles

## Papel sugerido por documento `users/{uid}`

- `user`: usuario comum do aplicativo
- `trainer`: profissional com leitura de dados atribuidos e capacidade de publicar exercicios
- `physiotherapist`: profissional com leitura de dados atribuidos e capacidade de publicar exercicios e protocolos
- `admin`: administracao interna

## Regra importante

Os papeis administrativos nao devem ser promovidos pelo frontend.

Promocao de papel deve acontecer via:

- Firebase Admin SDK no backend
- script interno seguro
- Cloud Function administrativa
