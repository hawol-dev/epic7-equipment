import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from build_unified_db import classify_content


class TestClassifyContent(unittest.TestCase):
    def test_pve_variant(self):
        self.assertEqual(classify_content("PVE"), "pve")

    def test_expedition_variant(self):
        self.assertEqual(classify_content("원정대"), "pve")

    def test_wyvern_variant(self):
        self.assertEqual(classify_content("와이번"), "pve")

    def test_banshee_one_punch(self):
        self.assertEqual(classify_content("밴시원펀"), "pve")

    def test_golem_one_punch(self):
        self.assertEqual(classify_content("골렘원펀"), "pve")

    def test_constellation(self):
        self.assertEqual(classify_content("성좌"), "pve")

    def test_hall(self):
        self.assertEqual(classify_content("전당"), "pve")

    def test_versus_specific_boss(self):
        self.assertEqual(classify_content("대 스트라제스용"), "pve")

    def test_mixed_pve_text(self):
        self.assertEqual(classify_content("원정대 리치 전열"), "pve")

    def test_role_variant_is_pvp(self):
        self.assertEqual(classify_content("탱"), "pvp")
        self.assertEqual(classify_content("딜"), "pvp")
        self.assertEqual(classify_content("디버퍼"), "pvp")

    def test_build_variant_is_pvp(self):
        self.assertEqual(classify_content("효저"), "pvp")
        self.assertEqual(classify_content("속막이"), "pvp")
        self.assertEqual(classify_content("치치"), "pvp")

    def test_explicit_pvp(self):
        self.assertEqual(classify_content("PVP"), "pvp")

    def test_none_or_empty(self):
        self.assertEqual(classify_content(None), "pvp")
        self.assertEqual(classify_content(""), "pvp")


if __name__ == "__main__":
    unittest.main()
