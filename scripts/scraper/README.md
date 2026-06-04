# Scraper dry-run

Este scraper consulta fontes oficiais/bancas, usa IA para estruturar concursos de GO, DF, TO, MT e MS e gera `scripts/scraper/output.json` para revisao manual em `/admin/concursos/importar`.

Ele nao publica concursos, nao insere no Supabase e forca `publication_status: "needs_review"`.

## Configuracao local

Crie uma variavel de ambiente com um provedor de IA:

```powershell
$env:OPENAI_API_KEY="..."
```

ou:

```powershell
$env:ANTHROPIC_API_KEY="..."
```

Instale dependencias e execute:

```powershell
python -m pip install -r scripts/scraper/requirements.txt
python scripts/scraper/scraper.py
```

O arquivo gerado fica em `scripts/scraper/output.json`.

## Deduplicacao opcional

Se existir `scripts/scraper/existing_contests.json`, o scraper ignora concursos com o mesmo `official_url` ou a mesma combinacao `title + organization + city + state`.

Formato aceito:

```json
[
  {
    "title": "Concurso Publico Exemplo",
    "organization": "Orgao Exemplo",
    "city": "Goiania",
    "state": "GO",
    "official_url": "https://..."
  }
]
```

## GitHub Actions

Configure um secret do repositorio:

- `OPENAI_API_KEY`; ou
- `ANTHROPIC_API_KEY`.

O workflow e dry-run: roda diariamente, gera `output.json` e publica o arquivo apenas como artifact. Nenhum dado e enviado ao Supabase.

## Limitacoes

- A primeira versao le paginas publicas e deixa a IA extrair dados do conteudo disponivel.
- Sites com bloqueio, JavaScript pesado ou edital apenas em PDF podem precisar de estrategia especifica.
- Todo resultado deve ser revisado manualmente antes de colar no importador.

## Proximos passos

- Adicionar fetch de PDFs oficiais por fonte.
- Criar estrategias especificas por banca quando necessario.
- Integrar ingestao direta como `needs_review`, mantendo publicacao manual e auditavel.
