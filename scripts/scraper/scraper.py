from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


SCRIPT_DIR = Path(__file__).resolve().parent
ALLOWED_STATES = {"GO", "DF", "TO", "MT", "MS"}
ALLOWED_SPHERES = {"municipal", "estadual", "federal", "other"}
ALLOWED_STATUSES = {"open", "upcoming"}
ALLOWED_EVENT_TYPES = {"registration", "exam"}
ALLOWED_EDUCATION_LEVELS = {"fundamental", "medio", "tecnico", "superior", "nao informado"}
GENERIC_URL_FRAGMENTS = {"#futuros", "#inscricoes", "#abertos"}
MIN_CONFIDENCE = 0.70
NAO_INFORMADO = "n\u00e3o informado"
BRASILIA = "Bras\u00edlia"
GOIAS = "Goi\u00e1s"
OUTPUT_KEYS = ("contests", "contest_roles", "contest_dates", "discarded_contests")
USER_AGENT = "RadarConcursosBRScraper/0.1 dry-run (+https://radar-concursos-br.local)"


@dataclass
class SourceSnapshot:
    source: dict[str, Any]
    url: str
    title: str
    text: str
    links: list[dict[str, str]]
    detail_pages: list[dict[str, Any]]
    fetched_at: str


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_lookup(value: str | None) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFD", value)
    ascii_text = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return normalize_text(ascii_text).lower()


def is_http_url(value: str | None) -> bool:
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def is_valid_date(value: Any) -> bool:
    if value in (None, ""):
        return True
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return False
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def is_placeholder(value: Any) -> bool:
    return normalize_lookup(str(value or "")) in {"", "string", "null", "none", "n/a", "na", "-", "placeholder"}


def as_optional_text(value: Any) -> str | None:
    text = normalize_text(str(value or ""))
    return None if is_placeholder(text) else text


def is_generic_contest_url(url: str, source_url: str | None = None) -> bool:
    if not is_http_url(url):
        return True
    parsed = urlparse(url)
    source = urlparse(source_url or "")
    if parsed.fragment and f"#{parsed.fragment.lower()}" in GENERIC_URL_FRAGMENTS:
        return True
    source_path = source.path.rstrip("/").lower()
    url_path = parsed.path.rstrip("/").lower()
    if source.netloc and parsed.netloc == source.netloc and url_path == source_path:
        return True
    return False


def infer_sphere(title: str, organization: str, fallback: str) -> str:
    lookup = normalize_lookup(f"{title} {organization}")
    if "prefeitura" in lookup or "camara municipal" in lookup:
        return "municipal"
    if "secretaria de estado" in lookup or "governo do distrito federal" in lookup or "distrito federal" in lookup:
        return "estadual"
    if "conselho regional" in lookup or "crea" in lookup or "crm" in lookup or "coren" in lookup:
        return "federal"
    return fallback if fallback in ALLOWED_SPHERES else "other"


def words_after(text: str, marker: str) -> str | None:
    lookup = normalize_lookup(text)
    index = lookup.find(marker)
    if index < 0:
        return None
    tail = lookup[index + len(marker) :]
    tail = re.split(r"\b(go|df|to|mt|ms|edital|concurso|processo seletivo)\b|[/,()|-]", tail, maxsplit=1)[0]
    words = [word for word in tail.split() if word not in {"de", "da", "do", "das", "dos"}]
    if not words:
        return None
    return " ".join(word.capitalize() for word in words[:5])


def infer_public_organization(title: str) -> str | None:
    lookup = normalize_lookup(title)
    if "prefeitura" in lookup:
        city = words_after(title, "prefeitura municipal de") or words_after(title, "prefeitura de")
        return f"Prefeitura Municipal de {city}" if city else None
    if "camara municipal" in lookup:
        city = words_after(title, "camara municipal de") or words_after(title, "camara de")
        return f"C\u00e2mara Municipal de {city}" if city else None
    markers = [
        ("secretaria de estado", "Secretaria de Estado"),
        ("conselho regional", "Conselho Regional"),
        ("instituto federal", "Instituto Federal"),
    ]
    for marker, label in markers:
        if marker in lookup:
            name = words_after(title, marker)
            return f"{label} {name}" if name else label
    return None


def normalize_education_level(value: Any) -> str:
    lookup = normalize_lookup(str(value or ""))
    if not lookup:
        return NAO_INFORMADO
    if "," in lookup or " e " in lookup or "/" in lookup:
        return NAO_INFORMADO
    if "fundamental" in lookup:
        return "fundamental"
    if "tecnico" in lookup:
        return "t\u00e9cnico"
    if "medio" in lookup:
        return "m\u00e9dio"
    if "superior" in lookup:
        return "superior"
    return NAO_INFORMADO


def default_summary(contest: dict[str, Any]) -> str:
    sphere = contest.get("sphere") or "other"
    level = "municipal" if sphere == "municipal" else "estadual" if sphere == "estadual" else "publico"
    return f"Concurso {level} com informacoes para inscricao e acompanhamento conforme pagina oficial."


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
        file.write("\n")


def scrape_html(url: str, timeout: int) -> BeautifulSoup:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    return soup


def collect_relevant_links(soup: BeautifulSoup, base_url: str, limit: int = 40) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    seen: set[str] = set()
    for anchor in soup.find_all("a", href=True):
        text = normalize_text(anchor.get_text(" "))
        href = urljoin(base_url, anchor["href"])
        if not text or not is_http_url(href) or href in seen:
            continue
        haystack = normalize_lookup(text + " " + href)
        if any(term in haystack for term in ["concurso", "edital", "inscricao", "seletivo", "selecao", "publico"]):
            seen.add(href)
            links.append({"text": text[:180], "url": href})
        if len(links) >= limit:
            break
    return links


def fetch_detail_pages(links: list[dict[str, str]], timeout: int, max_chars: int, limit: int = 6) -> list[dict[str, Any]]:
    details: list[dict[str, Any]] = []
    for link in links[:limit]:
        url = link["url"]
        if url.lower().endswith((".pdf", ".doc", ".docx", ".xls", ".xlsx")):
            details.append({"title": link["text"], "url": url, "document_url": url, "text": ""})
            continue
        try:
            soup = scrape_html(url, timeout)
            title = normalize_text(soup.title.get_text(" ")) if soup.title else link["text"]
            detail_links = collect_relevant_links(soup, url, limit=12)
            document_url = None
            for detail_link in detail_links:
                if detail_link["url"].lower().endswith(".pdf") or "edital" in normalize_lookup(detail_link["text"]):
                    document_url = detail_link["url"]
                    break
            details.append(
                {
                    "title": title[:180],
                    "url": url,
                    "document_url": document_url,
                    "links": detail_links,
                    "text": normalize_text(soup.get_text(" "))[:max_chars],
                }
            )
        except Exception as error:
            details.append({"title": link["text"], "url": url, "error": str(error)})
    return details


def fetch_source(source: dict[str, Any], timeout: int, max_chars: int) -> SourceSnapshot:
    url = source["base_url"]
    soup = scrape_html(url, timeout)
    links = collect_relevant_links(soup, url)
    detail_pages = fetch_detail_pages(links, timeout, max_chars=max_chars // 2)
    page_text = normalize_text(soup.get_text(" "))
    title = normalize_text(soup.title.get_text(" ")) if soup.title else source["name"]
    return SourceSnapshot(
        source=source,
        url=url,
        title=title,
        text=page_text[:max_chars],
        links=links,
        detail_pages=detail_pages,
        fetched_at=datetime.now(timezone.utc).isoformat(),
    )


def build_prompt(snapshot: SourceSnapshot) -> str:
    schema_hint = {
        "contests": [
            {
                "title": "string",
                "organization": "string",
                "sphere": "municipal|estadual|federal|other",
                "city": "string|null",
                "state": "GO|DF|TO|MT|MS",
                "board": "string|null",
                "status": "open|upcoming",
                "official_url": "https://...",
                "summary": "string|null",
                "document_url": "https://...|null",
                "confidence_score": 0.0,
                "publication_status": "needs_review",
            }
        ],
        "contest_roles": [
            {
                "contest_title": "same title from contests",
                "role_name": "string",
                "area": "string|null",
                "education_level": "string|null",
                "salary": None,
                "salary_text": "string|null",
                "vacancies": None,
                "reserve_list": False,
                "workload": "string|null",
                "requirements": "string|null",
            }
        ],
        "contest_dates": [
            {
                "contest_title": "same title from contests",
                "event_type": "registration|exam",
                "date_start": "YYYY-MM-DD|null",
                "date_end": "YYYY-MM-DD|null",
                "description": "string|null",
                "is_estimated": False,
                "confidence_score": 0.0,
            }
        ],
        "discarded_contests": [
            {
                "source_name": "string",
                "official_url": "string|null",
                "reason": "string",
            }
        ],
    }
    return "\n".join(
        [
            "Voce extrai concursos publicos de fontes oficiais para o Radar Concursos BR.",
            "Responda somente JSON valido, sem markdown.",
            "Use apenas dados presentes no conteudo da fonte, banca ou orgao responsavel. Nao invente cargos, datas, URLs ou vagas.",
            "E melhor retornar 2 concursos bons do que 10 concursos quebrados.",
            "Nunca copie placeholders do schema como dados reais: string, null, N/A ou texto generico devem ser descartados.",
            "organization e o orgao publico responsavel; board e a banca. Nunca use a banca como organization quando o titulo indicar prefeitura, camara, secretaria, conselho ou autarquia.",
            "official_url deve apontar para pagina especifica do concurso. Evite pagina inicial da banca ou anchors genericas como #futuros.",
            "summary deve ter uma frase curta e factual, nunca null.",
            "confidence_score deve refletir completude dos dados. Se nao souber, use 0.50.",
            "Datas sem date_start real em YYYY-MM-DD nao devem ser retornadas.",
            "Inclua apenas concursos de GO, DF, TO, MT ou MS com status open ou upcoming.",
            "publication_status deve ser sempre needs_review.",
            "contest_dates.event_type deve ser somente registration ou exam.",
            "Se a fonte nao trouxer concurso elegivel, retorne arrays vazios e explique em discarded_contests.",
            "Schema esperado:",
            json.dumps(schema_hint, ensure_ascii=False, indent=2),
            "Fonte consultada:",
            json.dumps(
                {
                    "source_name": snapshot.source["name"],
                    "source_type": snapshot.source.get("type"),
                    "source_url": snapshot.url,
                    "source_scope": snapshot.source.get("state_scope", []),
                    "page_title": snapshot.title,
                    "fetched_at": snapshot.fetched_at,
                    "links": snapshot.links,
                    "detail_pages": snapshot.detail_pages,
                    "text": snapshot.text,
                },
                ensure_ascii=False,
            ),
        ]
    )


def extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start < 0 or end < start:
            raise
        parsed = json.loads(cleaned[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("AI response must be a JSON object.")
    return parsed


def call_openai(prompt: str, model: str) -> dict[str, Any]:
    api_key = os.environ["OPENAI_API_KEY"]
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "temperature": 0,
            "messages": [
                {"role": "system", "content": "Voce extrai dados administrativos em JSON estrito."},
                {"role": "user", "content": prompt},
            ],
        },
        timeout=90,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    return extract_json(content)


def call_anthropic(prompt: str, model: str) -> dict[str, Any]:
    api_key = os.environ["ANTHROPIC_API_KEY"]
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": 4096,
            "temperature": 0,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=90,
    )
    response.raise_for_status()
    content = "".join(part.get("text", "") for part in response.json().get("content", []) if part.get("type") == "text")
    return extract_json(content)


def call_ai(prompt: str, provider: str, model: str | None) -> dict[str, Any]:
    if provider == "openai":
        return call_openai(prompt, model or os.environ.get("OPENAI_MODEL", "gpt-4o-mini"))
    if provider == "anthropic":
        return call_anthropic(prompt, model or os.environ.get("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"))
    raise ValueError(f"Provider unsupported: {provider}")


def empty_payload() -> dict[str, list[Any]]:
    return {key: [] for key in OUTPUT_KEYS}


def coerce_float(value: Any, fallback: float = 0.75) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    if number > 1:
        number = number / 100
    return max(0.0, min(1.0, number))


def discard(source_name: str, official_url: Any, title: Any, reason: str) -> dict[str, Any]:
    return {
        "source_name": source_name or "scraper",
        "official_url": as_optional_text(official_url),
        "title": as_optional_text(title),
        "reason": reason,
    }


def sanitize_contest(contest: dict[str, Any], source_name: str, source_url: str | None = None) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    title = as_optional_text(contest.get("title"))
    raw_board = as_optional_text(contest.get("board")) or source_name or NAO_INFORMADO
    raw_organization = as_optional_text(contest.get("organization"))
    inferred_organization = infer_public_organization(title or "")
    organization = raw_organization
    if inferred_organization and (not organization or normalize_lookup(organization) == normalize_lookup(raw_board)):
        organization = inferred_organization

    state = normalize_text(str(contest.get("state") or "")).upper()
    city = as_optional_text(contest.get("city"))
    status = normalize_text(str(contest.get("status") or "")).lower()
    official_url = as_optional_text(contest.get("official_url"))
    sphere = infer_sphere(title or "", organization or "", normalize_text(str(contest.get("sphere") or "other")).lower())
    confidence = coerce_float(contest.get("confidence_score"), fallback=0.50)
    summary = as_optional_text(contest.get("summary"))
    document_url = as_optional_text(contest.get("document_url"))

    if state == "DF" and not city:
        city = BRASILIA
    if state == "GO" and sphere == "estadual" and not city:
        city = GOIAS
    if not summary and title and organization and official_url and confidence >= MIN_CONFIDENCE:
        summary = default_summary({"sphere": sphere})

    critical_missing = [
        not title,
        not organization,
        bool(organization and normalize_lookup(organization) == normalize_lookup(raw_board)),
        sphere not in ALLOWED_SPHERES,
        sphere == "municipal" and not city,
        state not in ALLOWED_STATES,
        status not in ALLOWED_STATUSES,
        not official_url or is_generic_contest_url(official_url, source_url),
        not summary,
    ]
    if confidence < MIN_CONFIDENCE or any(critical_missing):
        reason = "dados insuficientes para importa\u00e7\u00e3o"
        if state and state not in ALLOWED_STATES:
            reason = "fora dos estados priorit\u00e1rios"
        elif official_url and is_generic_contest_url(official_url, source_url):
            reason = "sem fonte oficial espec\u00edfica"
        return None, discard(source_name, official_url, title, reason)

    return (
        {
            "title": title,
            "organization": organization,
            "sphere": sphere,
            "city": city,
            "state": state,
            "board": raw_board or NAO_INFORMADO,
            "status": status,
            "official_url": official_url,
            "summary": summary,
            "document_url": document_url,
            "confidence_score": confidence,
            "publication_status": "needs_review",
        },
        None,
    )


def sanitize_role(role: dict[str, Any], accepted_titles: set[str]) -> dict[str, Any] | None:
    contest_title = as_optional_text(role.get("contest_title"))
    role_name = as_optional_text(role.get("role_name"))
    if not contest_title or normalize_lookup(contest_title) not in accepted_titles or is_placeholder(role_name):
        return None
    salary = role.get("salary")
    vacancies = role.get("vacancies")
    reserve_list = role.get("reserve_list")
    return {
        "contest_title": contest_title,
        "role_name": role_name,
        "area": as_optional_text(role.get("area")) or NAO_INFORMADO,
        "education_level": normalize_education_level(role.get("education_level")),
        "salary": salary if isinstance(salary, (int, float)) and salary >= 0 else None,
        "salary_text": as_optional_text(role.get("salary_text")) or NAO_INFORMADO,
        "vacancies": vacancies if isinstance(vacancies, int) and vacancies >= 0 else None,
        "reserve_list": reserve_list if isinstance(reserve_list, bool) else None,
        "workload": as_optional_text(role.get("workload")) or NAO_INFORMADO,
        "requirements": as_optional_text(role.get("requirements")) or "Conforme edital",
    }


def sanitize_date(date: dict[str, Any], accepted_titles: set[str]) -> dict[str, Any] | None:
    contest_title = as_optional_text(date.get("contest_title"))
    event_type = normalize_text(str(date.get("event_type") or "")).lower()
    date_start = date.get("date_start") or None
    date_end = date.get("date_end") or None
    confidence = coerce_float(date.get("confidence_score"), fallback=0.50)
    if (
        not contest_title
        or normalize_lookup(contest_title) not in accepted_titles
        or event_type not in ALLOWED_EVENT_TYPES
        or not date_start
        or not is_valid_date(date_start)
        or not is_valid_date(date_end)
        or confidence < MIN_CONFIDENCE
    ):
        return None
    if event_type == "exam" and not date_end:
        date_end = date_start
    return {
        "contest_title": contest_title,
        "event_type": event_type,
        "date_start": date_start,
        "date_end": date_end,
        "description": as_optional_text(date.get("description")) or ("Data da prova" if event_type == "exam" else "Per\u00edodo de inscri\u00e7\u00f5es"),
        "is_estimated": bool(date.get("is_estimated")),
        "confidence_score": confidence,
    }


def dedupe_discarded(discarded: list[Any]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for item in discarded:
        if not isinstance(item, dict):
            continue
        clean = discard(
            str(item.get("source_name") or "scraper"),
            item.get("official_url"),
            item.get("title"),
            str(item.get("reason") or "dados insuficientes para importa\u00e7\u00e3o"),
        )
        key = "|".join(normalize_lookup(str(clean.get(field) or "")) for field in ["source_name", "title", "official_url", "reason"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(clean)
    return deduped


def validateAndSanitizeOutput(payload: dict[str, Any], source_name: str = "scraper", source_url: str | None = None) -> dict[str, list[Any]]:
    output = empty_payload()
    raw_contests = payload.get("contests", [])
    raw_roles = payload.get("contest_roles", [])
    raw_dates = payload.get("contest_dates", [])
    raw_discarded = payload.get("discarded_contests", [])

    if not isinstance(raw_contests, list):
        raw_contests = []
    if not isinstance(raw_roles, list):
        raw_roles = []
    if not isinstance(raw_dates, list):
        raw_dates = []
    if not isinstance(raw_discarded, list):
        raw_discarded = []

    accepted_titles: set[str] = set()
    seen_urls: set[str] = set()
    seen_composite: set[str] = set()

    for contest in raw_contests:
        if not isinstance(contest, dict):
            continue
        normalized, discarded = sanitize_contest(contest, source_name, source_url)
        if discarded:
            output["discarded_contests"].append(discarded)
            continue
        if not normalized:
            continue
        url = normalized["official_url"]
        composite = duplicate_key(normalized)
        if url in seen_urls or composite in seen_composite:
            output["discarded_contests"].append(discard(source_name, url, normalized["title"], "duplicado prov\u00e1vel"))
            continue
        seen_urls.add(url)
        seen_composite.add(composite)
        accepted_titles.add(normalize_lookup(normalized["title"]))
        output["contests"].append(normalized)

    for role in raw_roles:
        if isinstance(role, dict):
            sanitized = sanitize_role(role, accepted_titles)
            if sanitized:
                output["contest_roles"].append(sanitized)

    if not output["contest_roles"] and output["contests"]:
        for contest in output["contests"]:
            output["contest_roles"].append(
                {
                    "contest_title": contest["title"],
                    "role_name": "Diversos cargos",
                    "area": NAO_INFORMADO,
                    "education_level": NAO_INFORMADO,
                    "salary": None,
                    "salary_text": NAO_INFORMADO,
                    "vacancies": None,
                    "reserve_list": None,
                    "workload": NAO_INFORMADO,
                    "requirements": "Conforme edital",
                }
            )

    for date in raw_dates:
        if isinstance(date, dict):
            sanitized = sanitize_date(date, accepted_titles)
            if sanitized:
                output["contest_dates"].append(sanitized)

    output["discarded_contests"].extend(raw_discarded)
    output["discarded_contests"] = dedupe_discarded(output["discarded_contests"])
    return output


def validate_and_normalize(payload: dict[str, Any], source_name: str, source_url: str | None = None) -> dict[str, list[Any]]:
    return validateAndSanitizeOutput(payload, source_name=source_name, source_url=source_url)


def duplicate_key(contest: dict[str, Any]) -> str:
    return "|".join(
        [
            normalize_lookup(contest.get("title")),
            normalize_lookup(contest.get("organization")),
            normalize_lookup(contest.get("city")),
            normalize_lookup(contest.get("state")),
        ]
    )


def existing_contest_keys(path: Path) -> tuple[set[str], set[str]]:
    raw = load_json(path, [])
    rows = raw.get("contests", raw) if isinstance(raw, dict) else raw
    urls: set[str] = set()
    composite: set[str] = set()
    if not isinstance(rows, list):
        return urls, composite
    for row in rows:
        if not isinstance(row, dict):
            continue
        if row.get("official_url"):
            urls.add(str(row["official_url"]))
        composite.add(duplicate_key(row))
    return urls, composite


def merge_payloads(payloads: list[dict[str, list[Any]]], existing_path: Path) -> dict[str, list[Any]]:
    merged = empty_payload()
    seen_urls, seen_composite = existing_contest_keys(existing_path)
    accepted_titles: set[str] = set()

    for payload in payloads:
        for contest in payload["contests"]:
            url = contest["official_url"]
            composite = duplicate_key(contest)
            if url in seen_urls or composite in seen_composite:
                merged["discarded_contests"].append(
                    {
                        "source_name": contest.get("board"),
                        "official_url": url,
                        "title": contest["title"],
                        "reason": "duplicado prov\u00e1vel",
                    }
                )
                continue
            seen_urls.add(url)
            seen_composite.add(composite)
            accepted_titles.add(normalize_lookup(contest["title"]))
            merged["contests"].append(contest)

        for role in payload["contest_roles"]:
            if normalize_lookup(role.get("contest_title")) in accepted_titles:
                merged["contest_roles"].append(role)

        for date in payload["contest_dates"]:
            if normalize_lookup(date.get("contest_title")) in accepted_titles:
                merged["contest_dates"].append(date)

        merged["discarded_contests"].extend(payload["discarded_contests"])

    return merged


def detect_provider(provider: str) -> str | None:
    if provider != "auto":
        return provider
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Radar Concursos BR dry-run assisted scraper.")
    parser.add_argument("--sources", default=str(SCRIPT_DIR / "sources.json"))
    parser.add_argument("--existing", default=str(SCRIPT_DIR / "existing_contests.json"))
    parser.add_argument("--output", default=str(SCRIPT_DIR / "output.json"))
    parser.add_argument("--provider", choices=["auto", "openai", "anthropic"], default=os.environ.get("SCRAPER_AI_PROVIDER", "auto"))
    parser.add_argument("--model", default=None)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--max-chars", type=int, default=12000)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    sources = load_json(Path(args.sources), [])
    if not isinstance(sources, list):
        raise ValueError("sources file must be a JSON array.")

    provider = detect_provider(args.provider)
    payloads: list[dict[str, list[Any]]] = []

    if provider is None:
        payloads.append(
            {
                **empty_payload(),
                "discarded_contests": [
                    {
                        "source_name": "scraper",
                        "official_url": None,
                        "reason": "dados insuficientes para importa\u00e7\u00e3o",
                    }
                ],
            }
        )
    else:
        for source in sources:
            source_name = source.get("name", "unknown source")
            try:
                snapshot = fetch_source(source, args.timeout, args.max_chars)
                prompt = build_prompt(snapshot)
                ai_payload = call_ai(prompt, provider, args.model)
                payloads.append(validate_and_normalize(ai_payload, source_name, source.get("base_url")))
                print(f"[ok] {source_name}", file=sys.stderr)
            except Exception as error:
                payloads.append(
                    {
                        **empty_payload(),
                        "discarded_contests": [
                            {
                                "source_name": source_name,
                                "official_url": source.get("base_url"),
                                "reason": f"source failed: {error}",
                            }
                        ],
                    }
                )
                print(f"[warn] {source_name}: {error}", file=sys.stderr)

    output = validateAndSanitizeOutput(merge_payloads(payloads, Path(args.existing)))
    write_json(Path(args.output), output)
    print(
        json.dumps(
            {
                "output": str(Path(args.output).resolve()),
                "contests": len(output["contests"]),
                "roles": len(output["contest_roles"]),
                "dates": len(output["contest_dates"]),
                "discarded": len(output["discarded_contests"]),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
