import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from fetch_hero_builds import compute_averages


class TestComputeAverages(unittest.TestCase):
    def test_empty_builds_returns_none(self):
        self.assertIsNone(compute_averages([]))

    def test_single_build(self):
        b = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
             "chc": 50, "chd": 200, "eff": 0, "efr": 100, "gs": 400}
        result = compute_averages([b])
        self.assertEqual(result["atk"], 5000.0)
        self.assertEqual(result["spd"], 200.0)
        self.assertEqual(result["n"], 1)

    def test_average_of_two_builds(self):
        b1 = {"atk": 4000, "def": 1000, "hp": 18000, "spd": 180,
              "chc": 50, "chd": 150, "eff": 0, "efr": 80, "gs": 400}
        b2 = {"atk": 6000, "def": 1500, "hp": 22000, "spd": 220,
              "chc": 70, "chd": 200, "eff": 100, "efr": 100, "gs": 500}
        result = compute_averages([b1, b2])
        self.assertEqual(result["atk"], 5000.0)
        self.assertEqual(result["spd"], 200.0)
        self.assertEqual(result["chd"], 175.0)
        self.assertEqual(result["n"], 2)

    def test_missing_key_in_some_builds(self):
        b1 = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 200, "eff": 80, "efr": 100, "gs": 400}
        b2 = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 200,            "efr": 100, "gs": 400}
        result = compute_averages([b1, b2])
        self.assertEqual(result["eff"], 80.0)
        self.assertEqual(result["atk"], 5000.0)
        self.assertEqual(result["n"], 2)

    def test_rounds_to_one_decimal(self):
        b1 = {"atk": 5000, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 175, "eff": 0, "efr": 100, "gs": 400}
        b2 = {"atk": 5001, "def": 1000, "hp": 20000, "spd": 200,
              "chc": 50, "chd": 175, "eff": 0, "efr": 100, "gs": 400}
        result = compute_averages([b1, b2])
        self.assertEqual(result["atk"], 5000.5)


if __name__ == "__main__":
    unittest.main()
