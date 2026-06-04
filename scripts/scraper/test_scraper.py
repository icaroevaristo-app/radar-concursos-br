import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from scraper import NAO_INFORMADO, validateAndSanitizeOutput


GOOD_CONTEST = {
    "title": "Concurso Publico da Prefeitura Municipal de Minacu/GO",
    "organization": "Prefeitura Municipal de Minacu",
    "sphere": "municipal",
    "city": "Minacu",
    "state": "GO",
    "board": "Instituto Verbena/UFG",
    "status": "open",
    "official_url": "https://institutoverbena.ufg.br/concurso/minacu-2026",
    "summary": "Concurso municipal com informacoes oficiais na pagina da banca.",
    "confidence_score": 0.88,
}


class ScraperSanitizerTest(unittest.TestCase):
    def sanitize(self, payload):
        return validateAndSanitizeOutput(payload, source_name="Instituto Verbena/UFG", source_url="https://institutoverbena.ufg.br/")

    def test_discards_zero_confidence_contest(self):
        output = self.sanitize({"contests": [{**GOOD_CONTEST, "confidence_score": 0.0}]})

        self.assertEqual(output["contests"], [])
        self.assertEqual(output["discarded_contests"][0]["reason"], "dados insuficientes para importa\u00e7\u00e3o")

    def test_missing_summary_receives_safe_summary_when_data_is_enough(self):
        output = self.sanitize({"contests": [{**GOOD_CONTEST, "summary": None}]})

        self.assertEqual(len(output["contests"]), 1)
        self.assertTrue(output["contests"][0]["summary"])

    def test_organization_equal_board_is_corrected_from_public_title(self):
        output = self.sanitize(
            {
                "contests": [
                    {
                        **GOOD_CONTEST,
                        "title": "Concurso Publico da Camara Municipal de Ipameri/GO",
                        "organization": "Instituto Verbena/UFG",
                        "city": "Ipameri",
                        "official_url": "https://institutoverbena.ufg.br/concurso/ipameri-2026",
                    }
                ]
            }
        )

        self.assertEqual(output["contests"][0]["organization"], "C\u00e2mara Municipal de Ipameri")

    def test_removes_placeholder_role_name(self):
        output = self.sanitize({"contests": [GOOD_CONTEST], "contest_roles": [{"contest_title": GOOD_CONTEST["title"], "role_name": "string"}]})

        self.assertEqual(output["contest_roles"][0]["role_name"], "Diversos cargos")

    def test_normalizes_multi_education_level_to_nao_informado(self):
        output = self.sanitize(
            {
                "contests": [GOOD_CONTEST],
                "contest_roles": [
                    {
                        "contest_title": GOOD_CONTEST["title"],
                        "role_name": "Professor",
                        "education_level": "M\u00e9dio, Superior",
                    }
                ],
            }
        )

        self.assertEqual(output["contest_roles"][0]["education_level"], NAO_INFORMADO)

    def test_removes_date_without_date_start(self):
        output = self.sanitize(
            {
                "contests": [GOOD_CONTEST],
                "contest_dates": [
                    {
                        "contest_title": GOOD_CONTEST["title"],
                        "event_type": "registration",
                        "date_start": None,
                        "confidence_score": 0.9,
                    }
                ],
            }
        )

        self.assertEqual(output["contest_dates"], [])

    def test_default_description_for_date(self):
        output = self.sanitize(
            {
                "contests": [GOOD_CONTEST],
                "contest_dates": [
                    {
                        "contest_title": GOOD_CONTEST["title"],
                        "event_type": "exam",
                        "date_start": "2026-08-10",
                        "description": None,
                        "confidence_score": 0.9,
                    }
                ],
            }
        )

        self.assertEqual(output["contest_dates"][0]["description"], "Data da prova")
        self.assertEqual(output["contest_dates"][0]["date_end"], "2026-08-10")

    def test_deduplicates_discarded_contests(self):
        discarded = {
            "source_name": "ITAME",
            "title": "Concurso Exemplo",
            "official_url": "https://itame.com.br/site/index.aspx#futuros",
            "reason": "sem fonte oficial espec\u00edfica",
        }
        output = self.sanitize({"discarded_contests": [discarded, discarded]})

        self.assertEqual(len(output["discarded_contests"]), 1)

    def test_output_keeps_expected_top_level_keys(self):
        output = self.sanitize({"contests": [GOOD_CONTEST]})

        self.assertEqual(set(output.keys()), {"contests", "contest_roles", "contest_dates", "discarded_contests"})


if __name__ == "__main__":
    unittest.main()
