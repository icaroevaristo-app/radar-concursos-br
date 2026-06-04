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
OUTPUT_KEYS = ("contests", "contest_roles", "contest_dates", "discarded_contests")
USER_AGENT = "RadarConcursosBRScraper/0.1 dry-run (+https://radar-concursos-br.local)"


@dataclass
class SourceSnapshot:
    source: dict[str, Any]
    url: str
    title: str
    text: str
    links: list[dict[str, str]]
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


def fetch_source(source: dict[str, Any], timeout: int, max_chars: int) -> SourceSnapshot:
    url = source["base_url"]
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=timeout)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()

    links: list[dict[str, str]] = []
    for anchor in soup.find_all("a", href=True):
        text = normalize_text(anchor.get_text(" "))
        href = urljoin(url, anchor["href"])
        if not text or not is_http_url(href):
            continue
        if any(term in normalize_lookup(text + " " + href) for term in ["concurso", "edital", "inscricao", "sele", "publico"]):
            links.append({"text": text[:180], "url": href})

    page_text = normalize_text(soup.get_text(" "))
    title = normalize_text(soup.title.get_text(" ")) if soup.title else source["name"]
    return SourceSnapshot(
        source=source,
        url=url,
        title=title,
        text=page_text[:max_chars],
        links=links[:40],
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


def validate_and_normalize(payload: dict[str, Any], source_name: str) -> dict[str, list[Any]]:
    output = empty_payload()
    contests = payload.get("contests", [])
    roles = payload.get("contest_roles", [])
    dates = payload.get("contest_dates", [])
    discarded = payload.get("discarded_contests", [])

    if isinstance(discarded, list):
        output["discarded_contests"].extend(item for item in discarded if isinstance(item, dict))
    if not isinstance(contests, list):
        contests = []
    if not isinstance(roles, list):
        roles = []
    if not isinstance(dates, list):
        dates = []

    accepted_titles: set[str] = set()
    for contest in contests:
        if not isinstance(contest, dict):
            continue
        title = normalize_text(str(contest.get("title") or ""))
        organization = normalize_text(str(contest.get("organization") or ""))
        state = normalize_text(str(contest.get("state") or "")).upper()
        official_url = normalize_text(str(contest.get("official_url") or ""))
        status = normalize_text(str(contest.get("status") or "")).lower()
        sphere = normalize_text(str(contest.get("sphere") or "other")).lower()
        reasons = []
        if not title:
            reasons.append("missing title")
        if not organization:
            reasons.append("missing organization")
        if state not in ALLOWED_STATES:
            reasons.append("state outside GO/DF/TO/MT/MS")
        if status not in ALLOWED_STATUSES:
            reasons.append("status must be open or upcoming")
        if sphere not in ALLOWED_SPHERES:
            reasons.append("invalid sphere")
        if not is_http_url(official_url):
            reasons.append("missing valid official_url")

        if reasons:
            output["discarded_contests"].append(
                {"source_name": source_name, "official_url": official_url or None, "title": title or None, "reason": "; ".join(reasons)}
            )
            continue

        normalized = {
            "title": title,
            "organization": organization,
            "sphere": sphere,
            "city": normalize_text(str(contest.get("city") or "")) or None,
            "state": state,
            "board": normalize_text(str(contest.get("board") or "")) or source_name,
            "status": status,
            "official_url": official_url,
            "summary": normalize_text(str(contest.get("summary") or "")) or None,
            "document_url": normalize_text(str(contest.get("document_url") or "")) or None,
            "confidence_score": coerce_float(contest.get("confidence_score")),
            "publication_status": "needs_review",
        }
        output["contests"].append(normalized)
        accepted_titles.add(normalize_lookup(title))

    for role in roles:
        if not isinstance(role, dict):
            continue
        contest_title = normalize_text(str(role.get("contest_title") or ""))
        role_name = normalize_text(str(role.get("role_name") or ""))
        if normalize_lookup(contest_title) not in accepted_titles or not role_name:
            output["discarded_contests"].append(
                {"source_name": source_name, "official_url": None, "title": contest_title or None, "reason": "role ignored: missing role_name or contest_title not accepted"}
            )
            continue
        output["contest_roles"].append(
            {
                "contest_title": contest_title,
                "role_name": role_name,
                "area": normalize_text(str(role.get("area") or "")) or None,
                "education_level": normalize_text(str(role.get("education_level") or "")) or None,
                "salary": role.get("salary") if isinstance(role.get("salary"), (int, float)) and role.get("salary") >= 0 else None,
                "salary_text": normalize_text(str(role.get("salary_text") or "")) or None,
                "vacancies": role.get("vacancies") if isinstance(role.get("vacancies"), int) and role.get("vacancies") >= 0 else None,
                "reserve_list": bool(role.get("reserve_list")),
                "workload": normalize_text(str(role.get("workload") or "")) or None,
                "requirements": normalize_text(str(role.get("requirements") or "")) or None,
            }
        )

    for date in dates:
        if not isinstance(date, dict):
            continue
        contest_title = normalize_text(str(date.get("contest_title") or ""))
        event_type = normalize_text(str(date.get("event_type") or "")).lower()
        date_start = date.get("date_start")
        date_end = date.get("date_end")
        if date_start == "":
            date_start = None
        if date_end == "":
            date_end = None
        if (
            normalize_lookup(contest_title) not in accepted_titles
            or event_type not in ALLOWED_EVENT_TYPES
            or not is_valid_date(date_start)
            or not is_valid_date(date_end)
            or (event_type == "exam" and not date_start and not bool(date.get("is_estimated")))
        ):
            output["discarded_contests"].append(
                {"source_name": source_name, "official_url": None, "title": contest_title or None, "reason": "date ignored: invalid event/date or contest_title not accepted"}
            )
            continue
        output["contest_dates"].append(
            {
                "contest_title": contest_title,
                "event_type": event_type,
                "date_start": date_start,
                "date_end": date_end,
                "description": normalize_text(str(date.get("description") or "")) or None,
                "is_estimated": bool(date.get("is_estimated")),
                "confidence_score": coerce_float(date.get("confidence_score")),
            }
        )
    return output


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
                        "reason": "duplicate by official_url or title + organization + city + state",
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
                        "reason": "No OPENAI_API_KEY or ANTHROPIC_API_KEY configured; dry-run produced no contests.",
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
                payloads.append(validate_and_normalize(ai_payload, source_name))
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

    output = merge_payloads(payloads, Path(args.existing))
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
