# REP — Diário de treino

Site responsivo de registro de treinos feito em HTML, CSS e JavaScript puro, sem dependências, cadastro nem serviços externos.

## Como executar

**Modo mais simples:** abra `index.html` no navegador (Chrome, Edge, Firefox ou Safari).

**Servidor local recomendado:** no terminal, dentro da pasta `academia-tracker`, execute:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`. Não é necessário instalar pacotes JavaScript.

## Como usar

1. Abra **Início** ou **Treinar**, escolha MMII 1, MMSS ou MMII e inicie.
2. Ajuste carga, repetições ou tempo em cada série. Marque as séries como concluídas; exercícios combinados estão identificados.
3. Confira a data e clique em **Salvar treino**. Uma sessão parcialmente concluída também pode ser salva, desde que tenha ao menos uma série marcada.
4. Consulte **Histórico** para ver o resultado de cada série e **Evolução** para comparar a maior carga registrada por exercício.
5. Em **Minha ficha**, altere os exercícios, quantidade de séries, cargas, descanso e outros campos. Mudanças não alteram sessões já salvas nem o rascunho em andamento.
6. Use **Exportar** para fazer backup em JSON e **Importar** ao mudar de navegador ou aparelho.

## Persistência e privacidade

- Os dados ficam no `localStorage` do navegador e persistem depois de fechar ou recarregar a página.
- Não há servidor, conta ou envio de informações para terceiros.
- **Importante:** histórico e ficha não são sincronizados entre dispositivos. Limpar os dados do navegador ou usar janela anônima pode apagar os registros. Faça backups periódicos.

## Fonte dos dados

Todos os **26 exercícios** da ficha inicial foram transcritos do arquivo `treino abc fem desafio caio(1).pdf`, preservando as sessões, ordens, prescrições textuais, cargas informadas, intervalos, instruções e agrupamentos de exercícios combinados. Dados estruturados: `js/data.js`.

Pontos de interpretação documentados em `js/data.js`:

- Prescrições escritas como `3 15` ou `4 12` foram interpretadas como séries × repetições, mantendo o texto original.
- Na prancha, o campo `Inclinação: 3 séries de 60 seg` foi mantido como está no PDF; para registro foram criadas três séries de 60 segundos.
- Os rótulos `par de 8` e `par de 7` não trazem unidade no PDF: são preservados assim, e o campo numérico é 8 ou 7, sem conversão para carga total do par.
- Cardio mantém o que está escrito no PDF (duração, nível, inclinação, velocidade ou intensidade) sem inventar intervalos de descanso.

## Estrutura

```text
academia-tracker/
├── index.html         # Estrutura e navegação
├── styles.css         # Visual responsivo e modo escuro
├── js/
│   ├── data.js        # Ficha inicial fiel ao PDF
│   └── app.js         # Treinos, histórico, gráficos, edição, backup
├── assets/
│   └── icon.svg       # Ícone do site
└── README.md
```

Para publicar como um site estático, use qualquer hospedagem de arquivos estáticos (GitHub Pages, Netlify, Vercel). A persistência continua local em cada navegador, sem sincronização na nuvem.