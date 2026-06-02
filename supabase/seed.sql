-- Radar Concursos BR - Sprint 1 demo seed.
-- All contests below are demonstration data. They are not statements that
-- these opportunities are real, open, official, or currently accepting entries.

insert into public.sources (id, name, type, base_url, state, reliability_score, status, notes)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'FAFIPA',
    'board',
    'https://example.com/fontes/fafipa-demo',
    'GO',
    70,
    'active',
    'Fonte de demonstracao para Sprint 1. Nao representa integracao real.'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'QUADRIX',
    'board',
    'https://example.com/fontes/quadrix-demo',
    'GO',
    70,
    'active',
    'Fonte de demonstracao para Sprint 1. Nao representa integracao real.'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'IBAM',
    'board',
    'https://example.com/fontes/ibam-demo',
    'GO',
    70,
    'active',
    'Fonte de demonstracao para Sprint 1. Nao representa integracao real.'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Diário Oficial do Estado de Goiás',
    'official_diary',
    'https://example.com/fontes/diario-oficial-go-demo',
    'GO',
    75,
    'active',
    'Fonte de demonstracao para Sprint 1. Nao representa integracao real.'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Portal de Concursos GO',
    'contest_portal',
    'https://example.com/fontes/portal-concursos-go-demo',
    'GO',
    60,
    'active',
    'Fonte de demonstracao para Sprint 1. Nao representa integracao real.'
  )
on conflict (id) do update
set
  name = excluded.name,
  type = excluded.type,
  base_url = excluded.base_url,
  state = excluded.state,
  reliability_score = excluded.reliability_score,
  status = excluded.status,
  notes = excluded.notes;

insert into public.contests (
  id,
  title,
  organization,
  sphere,
  city,
  state,
  board,
  status,
  official_url,
  source_id,
  summary,
  confidence_score,
  publication_status,
  is_demo,
  published_at
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'Prefeitura de Anápolis - Administrativo',
    'Prefeitura Municipal de Anápolis',
    'municipal',
    'Anápolis',
    'GO',
    'FAFIPA',
    'open',
    'https://example.com/concursos/demo-anapolis-administrativo',
    '10000000-0000-4000-8000-000000000001',
    'Dado demonstrativo para validar a experiencia da Sprint 1. Nao indica concurso real em aberto. Consulte sempre fontes oficiais.',
    90,
    'published',
    true,
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Câmara de Goiânia - Legislativo',
    'Câmara Municipal de Goiânia',
    'municipal',
    'Goiânia',
    'GO',
    'QUADRIX',
    'upcoming',
    'https://example.com/concursos/demo-camara-goiania-legislativo',
    '10000000-0000-4000-8000-000000000002',
    'Dado demonstrativo para validar a experiencia da Sprint 1. Nao indica concurso real em aberto. Consulte sempre fontes oficiais.',
    86,
    'published',
    true,
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'Prefeitura de Aparecida de Goiânia - Saúde',
    'Prefeitura Municipal de Aparecida de Goiânia',
    'municipal',
    'Aparecida de Goiânia',
    'GO',
    'IBAM',
    'open',
    'https://example.com/concursos/demo-aparecida-saude',
    '10000000-0000-4000-8000-000000000003',
    'Dado demonstrativo para validar a experiencia da Sprint 1. Nao indica concurso real em aberto. Consulte sempre fontes oficiais.',
    88,
    'published',
    true,
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'SANEAGO - Técnico/Operacional',
    'SANEAGO',
    'estadual',
    'Goiânia',
    'GO',
    'nao informado',
    'upcoming',
    'https://example.com/concursos/demo-saneago-tecnico-operacional',
    '10000000-0000-4000-8000-000000000004',
    'Dado demonstrativo para validar a experiencia da Sprint 1. Nao indica concurso real em aberto. Consulte sempre fontes oficiais.',
    82,
    'published',
    true,
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'Prefeitura de Senador Canedo - Guarda Municipal',
    'Prefeitura Municipal de Senador Canedo',
    'municipal',
    'Senador Canedo',
    'GO',
    'nao informado',
    'open',
    'https://example.com/concursos/demo-senador-canedo-guarda',
    '10000000-0000-4000-8000-000000000005',
    'Dado demonstrativo para validar a experiencia da Sprint 1. Nao indica concurso real em aberto. Consulte sempre fontes oficiais.',
    84,
    'published',
    true,
    now()
  )
on conflict (id) do update
set
  title = excluded.title,
  organization = excluded.organization,
  sphere = excluded.sphere,
  city = excluded.city,
  state = excluded.state,
  board = excluded.board,
  status = excluded.status,
  official_url = excluded.official_url,
  source_id = excluded.source_id,
  summary = excluded.summary,
  confidence_score = excluded.confidence_score,
  publication_status = excluded.publication_status,
  is_demo = excluded.is_demo,
  published_at = excluded.published_at;

insert into public.contest_roles (
  id,
  contest_id,
  role_name,
  area,
  education_level,
  salary,
  salary_text,
  vacancies,
  reserve_list,
  workload,
  requirements
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Assistente administrativo',
    'Administrativo',
    'medio',
    2100,
    'R$ 2.100,00',
    12,
    false,
    '40h semanais',
    'Dado demonstrativo. Verificar requisitos no edital oficial.'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Técnico legislativo',
    'Legislativo',
    'superior',
    null,
    'não informado',
    null,
    true,
    null,
    'Dado demonstrativo. Verificar requisitos no edital oficial.'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    'Técnico em enfermagem',
    'Saúde',
    'tecnico',
    3300,
    'R$ 3.300,00',
    8,
    false,
    '40h semanais',
    'Dado demonstrativo. Verificar requisitos no edital oficial.'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000004',
    'Técnico operacional',
    'Operacional',
    'tecnico',
    null,
    'não informado',
    null,
    true,
    null,
    'Dado demonstrativo. Verificar requisitos no edital oficial.'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000005',
    'Guarda municipal',
    'Seguranca',
    'medio',
    2800,
    'R$ 2.800,00',
    20,
    false,
    '40h semanais',
    'Dado demonstrativo. Verificar requisitos no edital oficial.'
  )
on conflict (id) do update
set
  role_name = excluded.role_name,
  area = excluded.area,
  education_level = excluded.education_level,
  salary = excluded.salary,
  salary_text = excluded.salary_text,
  vacancies = excluded.vacancies,
  reserve_list = excluded.reserve_list,
  workload = excluded.workload,
  requirements = excluded.requirements;

insert into public.contest_dates (
  id,
  contest_id,
  event_type,
  date_start,
  date_end,
  description,
  is_estimated,
  confidence_score
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'registration_start',
    '2026-06-10',
    null,
    'Data demonstrativa de inicio de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'registration_end',
    null,
    '2026-07-10',
    'Data demonstrativa de encerramento de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000002',
    'registration_start',
    '2026-06-15',
    null,
    'Data demonstrativa de inicio de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000002',
    'registration_end',
    null,
    '2026-07-15',
    'Data demonstrativa de encerramento de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000003',
    'registration_start',
    '2026-06-20',
    null,
    'Data demonstrativa de inicio de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000003',
    'registration_end',
    null,
    '2026-07-20',
    'Data demonstrativa de encerramento de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000007',
    '20000000-0000-4000-8000-000000000004',
    'registration_start',
    '2026-06-25',
    null,
    'Data demonstrativa de inicio de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000008',
    '20000000-0000-4000-8000-000000000004',
    'registration_end',
    null,
    '2026-07-25',
    'Data demonstrativa de encerramento de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000009',
    '20000000-0000-4000-8000-000000000005',
    'registration_start',
    '2026-07-01',
    null,
    'Data demonstrativa de inicio de inscricoes.',
    true,
    70
  ),
  (
    '40000000-0000-4000-8000-000000000010',
    '20000000-0000-4000-8000-000000000005',
    'registration_end',
    null,
    '2026-08-01',
    'Data demonstrativa de encerramento de inscricoes.',
    true,
    70
  )
on conflict (id) do update
set
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  description = excluded.description,
  is_estimated = excluded.is_estimated,
  confidence_score = excluded.confidence_score;
