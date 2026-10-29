/*
 * Ficha transcrita de "treino abc fem desafio caio(1).pdf" (3 páginas).
 * Os campos prescricao, cargaOriginal, intervaloOriginal e outrosCampos
 * reproduzem o que foi escrito no arquivo. Os campos numéricos são usados
 * apenas para montar os formulários de registro.
 *
 * Pontos ambíguos no PDF:
 * - Algumas prescrições usam "4 12", "3 15" ou "4 21/" em vez de "4x12":
 *   foi adotada a leitura simples "quantidade de séries x repetições";
 *   o texto bruto continua disponível na interface.
 * - Na prancha, "3 séries de 60 seg" aparece sob o rótulo "Inclinação".
 *   Interpretamos como 3 séries de 60 segundos, preservando o rótulo original.
 * - "par de 8" e "par de 7" não apresentam a unidade no PDF;
 *   mantemos a escrita original e usamos 8 e 7 só como valores editáveis.
 * - Escada, esteira e bike não especificam intervalo: nenhum foi criado.
 */
window.TREINO_INICIAL = {
  nome: 'HE ABC INT 5 dividindo inf',
  objetivo: 'Hipertrofia',
  nivel: 'Avançado',
  fonte: 'treino abc fem desafio caio(1).pdf',
  sessoes: [
    {
      id: 'mmii1', nome: 'MMII 1', subtitulo: 'Membros inferiores · parte 1',
      exercicios: [
        {id:'bicicleta', nome:'Abdominal Bicicleta', tipo:'reps', series:3, reps:30, carga:0, prescricao:'3/30', cargaOriginal:'0kg', intervalo:50, intervaloOriginal:'50s', grupo:'abdominais'},
        {id:'remador', nome:'Abdominal Remador', tipo:'reps', series:3, reps:30, carga:0, prescricao:'3/30', cargaOriginal:'0kg', intervalo:50, intervaloOriginal:'50s', grupo:'abdominais'},
        {id:'extensora', nome:'Cadeira Extensora', tipo:'reps', series:4, reps:21, carga:45, prescricao:'4 21/ sendo 7 repetições embaixo, 7 em cima e 7 movimentos completos', cargaOriginal:'45kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'recuo', nome:'Recuo com Barra', tipo:'reps', series:4, reps:12, carga:20, prescricao:'4x12', cargaOriginal:'20kg', intervalo:60, intervaloOriginal:'60s', instrucao:'Mesma carga e reps em todas as séries'},
        {id:'sumo', nome:'Agachamento Sumô no Step com Halteres', tipo:'reps', series:4, reps:12, carga:40, prescricao:'4/12', cargaOriginal:'40kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'hack', nome:'Agachamento Hack Pés Juntos', tipo:'reps', series:4, reps:12, carga:50, prescricao:'4/12', cargaOriginal:'50kg', intervalo:70, intervaloOriginal:'70s'},
        {id:'leg', nome:'Leg Press 45 Pés Afastados', tipo:'reps', series:4, reps:12, carga:180, prescricao:'4 12', cargaOriginal:'180kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'aducao', nome:'Adução de Quadril Máquina', tipo:'reps', series:4, reps:12, carga:60, prescricao:'4 12 com pico de contração(segure com as pernas fechadas por 2 seg) a cada série', cargaOriginal:'60kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'escada', nome:'Escada Máquina', tipo:'cardio', series:1, minutos:15, nivel:'7 a 9', carga:0, prescricao:'15 min nível 7 a 9', cargaOriginal:'0kg', intervalo:null, intervaloOriginal:''}
      ]
    },
    {
      id:'mmss', nome:'MMSS', subtitulo:'Membros superiores',
      exercicios: [
        {id:'remada_baixa', nome:'Remada Baixa Barra H', tipo:'reps', series:4, reps:12, carga:40, prescricao:'4/12', cargaOriginal:'40kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'pulldown', nome:'Pulldown Barra Reta', tipo:'reps', series:4, reps:12, carga:17, prescricao:'4x12', cargaOriginal:'17kg', intervalo:60, intervaloOriginal:'60s', instrucao:'Mesma carga e reps em todas as séries'},
        {id:'puxada', nome:'Puxada Fechada barra reta', tipo:'reps', series:4, reps:12, carga:35, prescricao:'4/12', cargaOriginal:'35kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'elevacao', nome:'Elevação Lateral com Halteres', tipo:'reps', series:3, reps:15, carga:5, prescricao:'3 15', cargaOriginal:'Par de 5kg', intervalo:60, intervaloOriginal:'60s', grupo:'lateral_supino'},
        {id:'supino', nome:'Supino Inclinado com Halteres', tipo:'reps', series:3, reps:12, carga:8, prescricao:'3x12', cargaOriginal:'par de 8', intervalo:60, intervaloOriginal:'60s', grupo:'lateral_supino', instrucao:'Mesma carga e reps em todas as séries'},
        {id:'rosca', nome:'Rosca Martelo com Halteres', tipo:'reps', series:3, reps:15, carga:7, prescricao:'3 15', cargaOriginal:'par de 7', intervalo:50, intervaloOriginal:'50s'},
        {id:'triceps_testa', nome:'Tríceps Testa Barra Reta', tipo:'reps', series:4, reps:12, carga:12, prescricao:'4/12', cargaOriginal:'12kg', intervalo:50, intervaloOriginal:'50s'},
        {id:'triceps_paralela', nome:'Triceps Paralela Máquina (Pegada Neutra)', tipo:'reps', series:4, reps:12, carga:45, prescricao:'4 12', cargaOriginal:'45kg', intervalo:50, intervaloOriginal:'50s'},
        {id:'esteira', nome:'Esteira com Inclinação', tipo:'cardio', series:1, minutos:12, nivel:'7', inclinacao:'5', velocidade:'6', prescricao:'12 min com inclinação de 5% e vel 6 km h', cargaOriginal:'nivel 7', intervalo:null, intervaloOriginal:''}
      ]
    },
    {
      id:'mmii', nome:'MMII', subtitulo:'Membros inferiores · parte 2',
      exercicios: [
        {id:'prancha', nome:'Prancha Isométrica', tipo:'tempo', series:3, segundos:60, carga:null, prescricao:'60s', campoPrescricao:'Tempo', outrosCampos:[{rotulo:'Inclinação', valor:'3 séries de 60 seg'}], cargaOriginal:'', intervalo:50, intervaloOriginal:'50s', grupo:'core_lombar'},
        {id:'hiperextensao', nome:'Hiperextensao de Lombar', tipo:'reps', series:3, reps:15, carga:5, prescricao:'3 15', cargaOriginal:'segure anilha de 5kg', intervalo:60, intervaloOriginal:'60s', grupo:'core_lombar', instrucao:'Mesma carga e reps em todas as séries'},
        {id:'flexora', nome:'Flexora Unilateral', tipo:'reps', series:4, reps:12, carga:5, prescricao:'4 12', cargaOriginal:'5kg de cada lado', intervalo:60, intervaloOriginal:'60s', instrucao:'Mesma carga e reps em todas as séries'},
        {id:'stiff', nome:'Stiff pés próximo com Barra Livre', tipo:'reps', series:4, reps:12, carga:35, prescricao:'4/12', cargaOriginal:'35kg', intervalo:60, intervaloOriginal:'60s'},
        {id:'bulgaro', nome:'Búlgaro com Halter', tipo:'reps', series:4, reps:10, carga:10, prescricao:'4/10', cargaOriginal:'par de 10 kg', intervalo:50, intervaloOriginal:'50s'},
        {id:'abducao', nome:'Abdução de Quadril Máquina com Corpo a Frente', tipo:'reps', series:4, reps:12, carga:70, prescricao:'4/12', cargaOriginal:'70kg', intervalo:70, intervaloOriginal:'70s'},
        {id:'panturrilha', nome:'Panturrilha no Smith com Step', tipo:'reps', series:4, reps:12, carga:50, prescricao:'4 12', cargaOriginal:'50kg', intervalo:60, intervaloOriginal:'60s', instrucao:'Mesma carga e reps em todas as séries'},
        {id:'bike', nome:'Bike Spinning', tipo:'cardio', series:1, minutos:12, nivel:'', intensidade:'carga moderada, não pode ser fácil', prescricao:'12 min', cargaOriginal:'carga moderada, não pode ser fácil', intervalo:null, intervaloOriginal:''}
      ]
    }
  ]
};