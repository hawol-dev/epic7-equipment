"""새 스키마 샘플 + 검색 테스트"""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

heroes = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\processed\heroes.json', encoding='utf-8'))
enums = json.load(open(r'E:\jsh02\Dev\EpicSevenEquipment\data\processed\enums.json', encoding='utf-8'))

# 라비 샘플
ravi = next(h for h in heroes if h['names']['ko'] == '라비')
print("=== 라비 (정규화된 스키마) ===")
print(json.dumps(ravi, ensure_ascii=False, indent=2))

# 검색 1: 부옵 spd essential + eff essential
print("\n=== 검색: spd 필수 + eff 필수 ===")
hits = [h for h in heroes if h.get('valid_options')
        and h['valid_options']['substats'].get('spd') == 'essential'
        and h['valid_options']['substats'].get('eff') == 'essential']
print(f"매칭: {len(hits)}명")
for h in hits[:5]:
    rarity = h['rarity']
    el_ko = enums['elements'].get(h['element'], {}).get('ko', '?')
    cls_ko = enums['classes'].get(h['class'], {}).get('ko', '?')
    print(f"  - {h['names']['ko']} ({rarity}* {el_ko} {cls_ko})")

# 검색 2: 세트 speed + immunity
print("\n=== 검색: speed + immunity 둘 다 ===")
hits = [h for h in heroes if h.get('valid_options')
        and 'speed' in h['valid_options']['valid_sets']
        and 'immunity' in h['valid_options']['valid_sets']]
print(f"매칭: {len(hits)}명")
for h in hits[:5]:
    print(f"  - {h['names']['ko']}")

# 검색 3: 자연 속성 + 기사 직업
print("\n=== 검색: 자연 속성 + 기사 직업 ===")
hits = [h for h in heroes if h['element'] == 'earth' and h['class'] == 'knight']
print(f"매칭: {len(hits)}명")
for h in hits[:5]:
    print(f"  - {h['names']['ko']} (has_data={h['has_data']})")

# enums 사이즈
print(f"\n=== enums.json ===")
for cat, items in enums.items():
    print(f"  {cat}: {len(items)}종")
