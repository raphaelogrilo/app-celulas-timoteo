import type { Celula } from '../types/celula';

// Arquivo de seed apenas para migração inicial ao Firestore.
// Após popular o banco, este arquivo pode ser removido.
export const CELULAS_SEED: Celula[] = [
  {
    id: 'cel-01', itinerante: false, ativo: true,
    nome: 'Célula Ágape', perfil: 'Jovens', dia: 'Sexta-feira', horario: '19:30',
    lider: 'Lucas Ribeiro', telefone: '31998765432',
    fotoLider: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cep: '35180-020', endereco: 'Rua 31 de Março, 240', bairro: 'Funcionários',
    pontoReferencia: 'Próximo à Praça 1º de Maio',
    descricao: 'Um ambiente dinâmico para jovens compartilharem experiências, louvor e palavra de Deus.',
    faixaEtaria: '18 a 29 anos', coords: { lat: -19.5785, lng: -42.6390 }
  },
  {
    id: 'cel-02', itinerante: false, ativo: true,
    nome: 'Célula Família Restaurada', perfil: 'Família', dia: 'Quinta-feira', horario: '19:45',
    lider: 'Marcos & Cristiane Souza', telefone: '31991234567',
    fotoLider: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    cep: '35180-002', endereco: 'Av. Juscelino Kubitschek, 185', bairro: 'Centro',
    pontoReferencia: 'Em frente à Padaria Central',
    descricao: 'Encontro para famílias, casais com filhos e momentos de comunhão e oração pelo lar.',
    faixaEtaria: 'Livre / Todas as idades', coords: { lat: -19.5828, lng: -42.6436 }
  },
  {
    id: 'cel-03', itinerante: false, ativo: true,
    nome: 'Célula Aliança Eterna', perfil: 'Casais', dia: 'Sábado', horario: '20:00',
    lider: 'Pr. Daniel & Fernanda Rocha', telefone: '31997654321',
    fotoLider: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    cep: '35180-210', endereco: 'Rua Vinte e Um de Abril, 98', bairro: 'Timirim',
    pontoReferencia: 'Próximo ao Hospital e Maternidade Vital Brazil',
    descricao: 'Fortalecimento do casamento, princípios bíblicos para o casal e confraternização.',
    faixaEtaria: 'Casais', coords: { lat: -19.5895, lng: -42.6420 }
  },
  {
    id: 'cel-04', itinerante: false, ativo: true,
    nome: 'Célula Conectados', perfil: 'Teens', dia: 'Sábado', horario: '17:30',
    lider: 'Gabriel & Beatriz Martins', telefone: '31993456789',
    fotoLider: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    cep: '35180-410', endereco: 'Rua Carvalho, 412', bairro: 'Primavera',
    pontoReferencia: 'Perto do Campo do Primavera',
    descricao: 'Muita energia, jogos, música e ensinamentos práticos para adolescentes.',
    faixaEtaria: '12 a 17 anos', coords: { lat: -19.5698, lng: -42.6410 }
  },
  {
    id: 'cel-05', itinerante: false, ativo: true,
    nome: 'Célula Mulheres de Fé', perfil: 'Mulheres', dia: 'Quarta-feira', horario: '19:30',
    lider: 'Pastora Helena Andrade', telefone: '31998877665',
    fotoLider: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    cep: '35180-008', endereco: 'Rua 6 de Janeiro, 150', bairro: 'Acesita',
    pontoReferencia: 'Ao lado do Clube Alfa',
    descricao: 'Grupo acolhedor para oração, intercessão, aconselhamento e partilha feminina.',
    faixaEtaria: 'Mulheres de todas as idades', coords: { lat: -19.5742, lng: -42.6345 }
  },
  {
    id: 'cel-06', itinerante: false, ativo: true,
    nome: 'Célula Homens de Honra', perfil: 'Homens', dia: 'Terça-feira', horario: '20:00',
    lider: 'Carlos Eduardo (Kadu)', telefone: '31996541230',
    fotoLider: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    cep: '35180-130', endereco: 'Rua Marliéria, 310', bairro: 'Serenata',
    pontoReferencia: 'Próximo à Praça da Serenata',
    descricao: 'Homens buscando crescimento espiritual, liderança no lar e nos negócios.',
    faixaEtaria: 'Homens', coords: { lat: -19.5820, lng: -42.6320 }
  },
  {
    id: 'cel-07', itinerante: false, ativo: true,
    nome: 'Célula Vida Plena', perfil: 'Misto', dia: 'Quarta-feira', horario: '19:30',
    lider: 'Rodrigo & Michele Torres', telefone: '31992348765',
    fotoLider: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    cep: '35184-000', endereco: 'Av. Belo Horizonte, 520', bairro: 'Cachoeira do Vale',
    pontoReferencia: 'Perto do Posto de Saúde',
    descricao: 'Célula aberta para a vizinhança com estudos bíblicos acessíveis e café da comunhão.',
    faixaEtaria: 'Adultos e Famílias', coords: { lat: -19.5375, lng: -42.6580 }
  },
  {
    id: 'cel-08', itinerante: false, ativo: true,
    nome: 'Célula Nova Alvorada', perfil: 'Jovens', dia: 'Sexta-feira', horario: '20:00',
    lider: 'Felipe Santana', telefone: '31995431287',
    fotoLider: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    cep: '35180-350', endereco: 'Rua São Paulo, 88', bairro: 'Alvorada',
    pontoReferencia: 'Próximo à Escola Municipal',
    descricao: 'Juventude apaixonada por Jesus, conversas francas sobre propósito e amizade verdadeira.',
    faixaEtaria: '18 a 30 anos', coords: { lat: -19.5980, lng: -42.6390 }
  },
  {
    id: 'cel-09', itinerante: false, ativo: true,
    nome: 'Célula Shekinah', perfil: 'Família', dia: 'Quinta-feira', horario: '19:30',
    lider: 'Wagner & Silvana Meireles', telefone: '31994321987',
    fotoLider: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=150&auto=format&fit=crop&q=80',
    cep: '35180-300', endereco: 'Rua Estados Unidos, 175', bairro: 'John Kennedy',
    pontoReferencia: 'Subindo a rua da Igreja Batista',
    descricao: 'Reunião para edificar os lares com louvores, testemunhos e oração mútua.',
    faixaEtaria: 'Família', coords: { lat: -19.5930, lng: -42.6470 }
  },
  {
    id: 'cel-10', itinerante: false, ativo: true,
    nome: 'Célula Florescer', perfil: 'Mulheres', dia: 'Segunda-feira', horario: '19:30',
    lider: 'Ana Paula Nogueira', telefone: '31998712345',
    fotoLider: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    cep: '35180-450', endereco: 'Rua Ipê Amarelo, 64', bairro: 'Bromélias',
    pontoReferencia: 'Próximo à Rotatória das Bromélias',
    descricao: 'Mulheres que se apoiam na jornada de fé, trabalho e maternidade.',
    faixaEtaria: 'Mulheres', coords: { lat: -19.5730, lng: -42.6480 }
  },
  {
    id: 'cel-11', itinerante: false, ativo: true,
    nome: 'Célula Manancial', perfil: 'Misto', dia: 'Quarta-feira', horario: '19:45',
    lider: 'Jorge & Patrícia Lopes', telefone: '31991122334',
    fotoLider: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    cep: '35181-000', endereco: 'Rua São Paulo, 310', bairro: 'São Cristóvão',
    pontoReferencia: 'Em frente ao Supermercado Local',
    descricao: 'Comunhão, estudo da palavra e acolhimento caloroso para novos visitantes.',
    faixaEtaria: 'Todas as idades', coords: { lat: -19.5870, lng: -42.6530 }
  },
  {
    id: 'cel-12', itinerante: false, ativo: true,
    nome: 'Célula Elo de Amor', perfil: 'Casais', dia: 'Sábado', horario: '19:30',
    lider: 'Leandro & Juliana Castro', telefone: '31993344556',
    fotoLider: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    cep: '35180-100', endereco: 'Rua Rio Doce, 142', bairro: 'Garapa',
    pontoReferencia: 'Próximo à praça principal',
    descricao: 'Casais caminhando juntos, com dinâmicas enriquecedoras e momentos a dois.',
    faixaEtaria: 'Casais', coords: { lat: -19.5670, lng: -42.6360 }
  }
];
