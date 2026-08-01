import ast
import unittest
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[2] / "src" / "eduos"
BACKEND_ROOT = APP_ROOT.parents[1]
MODULES_ROOT = APP_ROOT / "modules"
EXPECTED_MODULES = {
    "auth",
    "centres",
    "cohortes",
    "dashboard",
    "documents",
    "evaluations",
    "facturation",
    "formations",
    "health",
    "inscriptions",
    "notifications",
    "paiements",
    "participant",
    "planning",
    "presences",
    "prospects",
    "rapports",
    "remunerations",
    "renouvellements",
    "teaching",
    "users",
}


class ArchitectureTests(unittest.TestCase):
    def test_legacy_fastify_artifacts_are_absent(self):
        legacy_paths = {
            BACKEND_ROOT / "dist",
            BACKEND_ROOT / "node_modules",
            BACKEND_ROOT / "package-lock.json",
            BACKEND_ROOT / "package.json",
            BACKEND_ROOT / "tsconfig.json",
            BACKEND_ROOT / "src" / "app.ts",
            BACKEND_ROOT / "src" / "server.ts",
        }
        self.assertEqual(
            [],
            [
                str(path.relative_to(BACKEND_ROOT))
                for path in legacy_paths
                if path.exists()
            ],
        )

    def test_expected_business_modules_exist(self):
        actual = {
            path.name
            for path in MODULES_ROOT.iterdir()
            if path.is_dir() and not path.name.startswith("_")
        }
        self.assertTrue(EXPECTED_MODULES.issubset(actual))

    def test_sql_is_isolated_to_repositories(self):
        forbidden_calls = {
            "execute",
            "executemany",
            "fetch",
            "fetchrow",
            "fetchval",
        }
        violations: list[str] = []
        for source_path in APP_ROOT.rglob("*.py"):
            relative_path = source_path.relative_to(APP_ROOT)
            if source_path.name == "repository.py":
                continue
            if relative_path == Path("database/pool.py"):
                continue

            tree = ast.parse(source_path.read_text(encoding="utf-8"))
            for node in ast.walk(tree):
                if (
                    isinstance(node, ast.Call)
                    and isinstance(node.func, ast.Attribute)
                    and node.func.attr in forbidden_calls
                ):
                    violations.append(
                        f"{relative_path}:{node.lineno}"
                    )
        self.assertEqual([], violations)

    def test_main_composes_the_api_router(self):
        main_source = (APP_ROOT / "main.py").read_text(encoding="utf-8")
        expected = 'application.include_router(api_router, prefix="/api")'
        self.assertIn(expected, main_source)


if __name__ == "__main__":
    unittest.main()
