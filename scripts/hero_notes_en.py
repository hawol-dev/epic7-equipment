"""
영웅 비고 한국어 → 영문 번역.
156개 unique 한국어 비고. 가능한 한 의미 보존하면서 영어 화자가 이해할 수 있게.

Korean E7 jargon glossary:
  빠빠좋 = "the faster the better" (속도 우선)
  빡딜 = burst damage
  극딜 = max DPS
  디버퍼/디버프 = debuffer / debuffs
  효적/적중 = Effectiveness (eff)
  효저/저항 = Effect Resistance
  챙김(당함) = stack / forced to stack
  치확/치피/치치 = CHC / CHD / both
  생방 = HP/DEF
  생퍼 = HP%
  속신/퍼신 = speed boots / % stat boots
  발자르기 = cut speed (use low-speed boots)
  깔창 = speed-focused build
  통수 = surprise/backstab
  단단/딴딴 = tanky
  성좌 = Wyvern Hunt 13/Constellation
  와이번/골렘/밴시 = Wyvern/Golem/Banshee Hunt
  심뜨별 = Heart of Hannya (artifact)
  채티 = Chatty (artifact)
  조커 = Daydream Joker (artifact)
  음료수아티 = Frosted Flower Vase (artifact)
  혈옥수 = Bloodstone (artifact)
  검집 = Bastion of Perlutia (artifact)
  잿세 = Briar Witch Iseria
  사파벨 = (hero)
  나세실 = Cecilia of the Abyss
  무위 = Mui
  실레나 = Sylvan Sage Vivian / Selena
"""

NOTE_EN: dict[str, str] = {
    "1스 흡혈 피해량 제한 믿고 효저 많이":
        "S1 lifesteal damage caps reliably — stack a lot of effect resistance",
    "2스로 딜러 끌어올려서 제초":
        "Use S2 to push allies up and clean up",
    "3스 소울번싸개":
        "Pure soulburn S3 user",
    "3스소울번싸개":
        "Pure soulburn S3 user",
    "PVE 디버프 싸개":
        "PvE debuff applier",
    "PVE 빠빠좋 치확100% 필수 성좌용은 딜을 요구함":
        "PvE: faster the better. 100% CHC required. Wyvern 13 needs damage",
    "PVE는 극딜일수록 좋음":
        "More damage is always better in PvE",
    "PVP는 반면":
        "Reverse for PvP",
    "pve는 약점공격버프싸개":
        "PvE: weakness attack buff applier",
    "간혹 디버퍼용으로 적중 맞추는 경우 있음":
        "Sometimes built as a debuffer with effectiveness",
    "개딴딴하게 맞추면 극찬받음":
        "Praised highly when built ultra-tanky",
    "격류 없는 뉴비는 관통이나 치명":
        "If you lack Torrent set as a beginner, use Penetration or Critical",
    "고속아리아도 있지만 흡셋이 범용":
        "High-speed Aria builds exist but Lifesteal set is more versatile",
    "고점 응면셋 스탠다드파면셋":
        "High-roll Riposte+Immunity, standard Destruction+Immunity",
    "공 5천이상":
        "5,000+ Attack",
    "공격력비례에 속지마셈 올려도 좆도 안오름":
        "Don't be fooled by ATK scaling — pumping ATK barely helps",
    "공계수 높아서 공격력도 좋은데 상처로 깎이는 생명력 수치에 주의":
        "High ATK scaling helps, but watch HP loss from Injury set",
    "공몰빵/저항/적중 세팅으로 나뉨":
        "Splits into pure-ATK / Resistance / Effectiveness builds",
    "관저+생몰빵으로 스트3스 버티는 용도, 딜챙기면 좋음":
        "Penetration+Resist with all-HP to survive Straze S3 — damage helps",
    "관통은 타그헬 써서 번-3스 연계용":
        "Penetration build uses Tagahel for burn-S3 combos",
    "극속/중턴 세팅 있고 생방은 죽지않을 정도로":
        "Hyper-speed and mid-turn builds. HP/DEF just enough to survive",
    "극속잔 세팅도 있음":
        "Hyper-speed Reversal build also exists",
    "기절방깎연계용 잘안씀":
        "Stun + DEF break combo, rarely used",
    "깔창 디버퍼로 많이 쓰는데 면역 까고 행밀침묵이 더 중요해서 딜은 우선순위가 낮음":
        "Often used as a fast debuffer — strip immunity, push action and silence matter more than damage",
    "깡방목채용/뉴비용X":
        "Uses flat DEF necklace, not a beginner pick",
    "냉속의 영원한 카운터":
        "Eternal counter to Ice/Speed comps",
    "뉴비때 쓸만한 버스기사":
        "Solid carry for beginners",
    "단단/저항/적저세팅 나뉨":
        "Splits into Tanky / Resistance / Eff+Res builds",
    "디버프케어":
        "Debuff cleanser",
    "딜vs적중 중에 택일":
        "Pick either Damage or Effectiveness",
    "딜보다는 탱키한 디버퍼가 더 어울리는 추세":
        "Trending toward tanky debuffer rather than DPS",
    "딜을 낮추고 적중을 더 많이":
        "Lower damage, more effectiveness",
    "뚀미펀치! 뚀미펀치!":
        "Ddyomi punch! Ddyomi punch!",
    "란보다 먼저 따는 호신용칼 용도로 썼었음":
        "Was used as a self-defense pick before getting Ran",
    "룬작 때문에 저항 200 필수":
        "200% Resistance required because of rune procs",
    "몸 단단한 서브딜러 적중은 챙김당함":
        "Tanky sub-DPS — effectiveness ends up needed",
    "무위랑 쓸거면 발자르고 디버프 걸거면 적중 65%":
        "If pairing with Mui, cut speed; if applying debuffs, 65% effectiveness",
    "반격수호는 하르세티용":
        "Counter+Protection is for Harsetti synergy",
    "반격은 중턴으로 챙김 250근처":
        "For Counter, aim for mid-turn around 250 speed",
    "반격이면 생방챙김, 적중은 있으면 좋지만 주력은 아님":
        "On Counter, stack HP/DEF; effectiveness is nice but not primary",
    "반관이 정배":
        "Counter+Penetration is the standard build",
    "발자르고 탱vs속도 조금 챙기고 탱으로 세팅 나뉨":
        "Splits into cut-speed-tank vs slight-speed-tank builds",
    "방깎셔틀or서브딜러":
        "DEF break shuttle or sub-DPS",
    "방깎싸개, 서브딜러 세팅으로 나뉨":
        "Splits into DEF break applier or sub-DPS",
    "방비례 딜러 공vs방 효율은 안써서 모르니 세팅 전 질문 추천":
        "DEF-scaling DPS — ATK vs DEF efficiency unknown, ask before building",
    "번외로 파관 딜셋팅도 있음":
        "Destruction+Penetration DPS build also exists",
    "범용은 면역":
        "Immunity is the all-purpose pick",
    "보검끼고 반격딜세팅, 적중챙김당함":
        "Sword of Judgment + Counter DPS; effectiveness gets stacked anyway",
    "불 성좌에서 화상 걸기 위해 적중 필요":
        "Needs effectiveness to apply Burn in Fire Wyvern 13",
    "불사 패시브로 급사 버티고 흡혈로 피 채우고 탱킹함":
        "Survives lethal hits with revive passive, sustains via Lifesteal",
    "비급 유무에 따라 맞출 속도가 다름":
        "Target speed depends on whether you have the Exclusive Equipment",
    "빠빠좋":
        "Faster the better",
    "빠빠좋 적중은 있음 좋음":
        "Faster the better — effectiveness is nice to have",
    "빠빠좋, 생방을 챙길수록 아티 강화랑 세팅 난이도가 높아짐":
        "Faster the better — more HP/DEF means harder gearing & artifact upgrade",
    "빠빠좋, 용도에 따라 적중저항 챙기는데 보통 적저 유기하고 튼튼하게 쓰는듯":
        "Faster the better — depending on use, eff/res; usually skip res and go tanky",
    "빡딜or중턴":
        "Burst DPS or mid-turn",
    "사파crap 트리거로 쓰려면 치확 줘야하고 세트무시 선턴 가능":
        "To trigger Sez, give CHC; can ignore set effects with first-turn build",
    "사파벨 트리거로 쓰려면 치확 줘야하고 세트무시 선턴 가능":
        "To trigger Sez, give CHC; can ignore set effects with first-turn build",
    "상처는 비주류, 템포 빠르게는 속도, 딜링은 파멸":
        "Injury is niche; Speed for tempo, Destruction for damage",
    "생방 적당히":
        "Moderate HP/DEF",
    "생방 조금 나머지 딜몰빵 너무 느리면 안됨":
        "A bit of HP/DEF, rest into damage — can't be too slow",
    "생방 조금 챙기는 빡딜러":
        "Burst DPS with a touch of HP/DEF",
    "생방 챙기면서 공(음료수아티)을 우선하기vs적중 우선하기":
        "Stack HP/DEF, prioritize ATK (Frosted Flower Vase) vs prioritize Effectiveness",
    "생방 튼튼하게 나머진 딜로, 혈옥수  써야함":
        "Solid HP/DEF, rest into damage — needs Bloodstone",
    "생방은 적당히":
        "Moderate HP/DEF",
    "생방은 죽지않을 정도로만":
        "HP/DEF only enough to not die",
    "생방은 죽지않을 정도만":
        "HP/DEF only enough to not die",
    "생생면 조합도 가능 생활효저 챙기고 단단하게 하는데 속도는 취향":
        "HP+HP+Immunity also works — go tanky with HP/Resist, speed by preference",
    "생퍼 없을수록 좋고":
        "The less HP% the better",
    "생퍼신/속신 취향 공은챙김당함":
        "HP% boots vs Speed boots is preference; ATK ends up stacked",
    "생퍼신/속신 취향, 원정대용 전열은 생2만방2천":
        "HP%/Speed boots is preference; for Expedition front line, 20k HP / 2k DEF",
    "생활저항 이상 탱키하게":
        "Go tanky with HP/Resistance or higher",
    "생활효저 챙기는게 좋음":
        "Better to stack HP/Resistance",
    "생활효저 추천":
        "Recommended: HP + Effect Resistance",
    "서브딜러/협공방깎싸개로 세팅이 나뉨":
        "Splits into sub-DPS or Dual-Attack DEF-break applier builds",
    "선턴":
        "First-turn",
    "선턴/중턴/효적효저세팅 다양함":
        "Various builds: first-turn / mid-turn / Effectiveness+Resistance",
    "선턴발사대면 속도만":
        "If used as a first-turn launcher, speed only",
    "선턴소멸딜러, 2스 표적으로 회피캐 상성도 좋음":
        "First-turn delete DPS; S2 marks make it strong vs evasion",
    "성좌 영겁에서 효저285% 때문에 저저저 주기도 함":
        "In Wyvern 13 Eternal, sometimes triple-resist substats due to 285% res",
    "세트무시 선턴 가능":
        "Can run first-turn build ignoring set effects",
    "세트무시 선턴 가능, 중턴저항바폴도 있음":
        "Can run first-turn ignoring sets; mid-turn Resistance Barrier-pop also viable",
    "세트자유, 생적템 주면됨":
        "Any set works; just give HP + Effectiveness gear",
    "세팅에 따라 속빠르게/발자르고 씀":
        "Built either fast or speed-cut depending on role",
    "속깔창이라 중턴에 딜챙기면 더좋음":
        "Speed-focused — better with damage stacking on mid-turn",
    "속낮추고 딜로 많이 쓰는듯":
        "Often built with lower speed, more damage",
    "속느린 효적효저/탱, 선턴적중 세팅이 다양함":
        "Slow Eff+Res tank or first-turn effectiveness — various builds",
    "속도 느린 대신 탱탱함+적중으로 이득봄":
        "Trades speed for tankiness + effectiveness gains",
    "속도는 230근처에 적중은 100근처로 적당히 주고 나머지 생방인듯":
        "Around 230 speed, 100 effectiveness, rest in HP/DEF",
    "속도는 속신만 끼거나 퍼신으로 쓰기 중 취향에 맞게":
        "Speed boots only or % boots — pick by preference",
    "속도는 유지하면서 탱키하게vs적중많이 취향":
        "Tanky-while-fast vs heavy-effectiveness, by preference",
    "속셋이 더 범용":
        "Speed set is more versatile",
    "속신or퍼신 취향인데 범용은 퍼신같음":
        "Speed vs % boots is preference; % boots feels more universal",
    "속파츠/협공빡딜/탱디버퍼 용도 따라 다름":
        "Speed parts / Dual-Attack burst / tanky debuffer — varies by role",
    "수호셋 없으면 속셋 쓰거나 생방면으로 타협":
        "Without Protection set, use Speed or compromise with HP+DEF+Immunity",
    "스킬끄고 검집아티로 운빨딜링":
        "Disable a skill, use Bastion artifact for RNG damage",
    "스탠다드":
        "Standard build",
    "시더로 대체가능":
        "Can be replaced by Cidd",
    "실레나는 속격이 편함":
        "For Selena, Speed+Torrent is easier",
    "심뜨별 아티 풀강 필수":
        "Heart of Hannya artifact at max level required",
    "심연용 특정 층마다 적중요구치가 다름":
        "Effectiveness requirement varies by Abyss floor",
    "심연용은 적중맞춰야함":
        "Need effectiveness for Abyss runs",
    "아티 3F 필수":
        "Artifact at 3-stars Fully Awakened required",
    "아티에 따라 적중요구치가 달라짐":
        "Effectiveness requirement depends on artifact choice",
    "옛날에 반면시구르 루나가 있었다는 걸 아시나요":
        "Did you know there used to be Counter+Immunity Sigret + Luna comp?",
    "와이번 원펀은 속도조절해야함":
        "For Wyvern one-shot, speed needs tuning",
    "와이번용은 단단하게":
        "For Wyvern Hunt, build tanky",
    "용도별 세팅 다름, 채티 쓰는 경우 생방을 조금 더 챙김":
        "Builds vary by role — with Chatty, stack a bit more HP/DEF",
    "용도별 셋팅 다양, 적중은 통수용으로 씀":
        "Various builds by role; effectiveness used for surprise picks",
    "원정대 리치 조합에 힐러 대신 쓸거면 혈옥수 필수":
        "If used as a healer-replacement in Expedition Lich comps, Bloodstone required",
    "원펀 조합은 속도만 신경쓰면됨":
        "For one-shot comps, only speed matters",
    "은신 때문에 흡격이 정배":
        "Due to Stealth, Lifesteal+Torrent is the standard build",
    "이계는 속도만 맞추면 되고 지옥은 쫄 1라 잡을 딜도 챙겨야함":
        "Astranox needs speed only; Hell needs damage to clear minions in round 1",
    "잘안씀":
        "Rarely used",
    "잿세 상대로 쓸만":
        "Useful against Briar Witch Iseria",
    "저항단 세팅 있음":
        "Pure Resistance build exists",
    "저항은 고저항(200%":
        "Resistance: high-resist (200%)",
    "적중 낮춘 탱죽레이 세팅도 있음":
        "Tanky low-effectiveness Ray build also exists",
    "적중 우선 맞추고 딜/탱 취향인데 보통 짬템줌":
        "Hit effectiveness target first, DPS/tank by preference — usually given spare gear",
    "적중 챙김당함":
        "Effectiveness ends up stacked anyway",
    "적중 챙김당함 조룬카랑 다르게 속도를 챙김":
        "Effectiveness gets stacked; unlike Cdr-Arunka, focus speed too",
    "적중과 속도만 맞추면 됨":
        "Just hit effectiveness and speed targets",
    "적중만 챙기기vs효적효저 챙기기":
        "Pure Effectiveness vs Effectiveness+Resistance",
    "적중버프 있어서 최소한으로 챙기고 딜챙겨주면 좋음":
        "Has effectiveness buff — minimize effectiveness gear, prioritize damage",
    "적중은 35%만, 흡셋은 힙스터":
        "Only 35% effectiveness needed; Lifesteal set is the hipster pick",
    "적중은 챙김당함 템없으면 속셋가능":
        "Effectiveness gets stacked; without gear, Speed set works",
    "적중을 생활저항 상대로 200% 이상은 챙기는 걸 추천하고 공은 챙길수록 물몸 상대로 짜를 가능성이 높아짐 공3천정도":
        "Aim for 200%+ effectiveness vs HP+Resist targets; more ATK = more chance to one-shot squishies (~3,000 ATK)",
    "전체공격 반격은 관통셋 효과 안먹음":
        "AoE counterattack doesn't benefit from Penetration set",
    "조웨릭 카운터로 썼었음":
        "Was used as counter to Joker Werick",
    "조커끼기 때문에 공격력보단 치피를 더 중점으로 두는게 좋음":
        "Since Daydream Joker is equipped, prioritize CHD over ATK",
    "주로 나세실 상대로, 빠빠좋":
        "Mainly vs Cecilia of the Abyss; faster the better",
    "중턴":
        "Mid-turn",
    "중턴극딜/선턴으로 세팅이 나뉨":
        "Splits into mid-turn max-DPS or first-turn builds",
    "중턴딜러":
        "Mid-turn DPS",
    "중턴면역 디버퍼적중 선턴은 속도부터":
        "Mid-turn Immunity. Effectiveness for debuffer; first-turn prioritizes speed",
    "중턴이면 적중챙김":
        "Mid-turn build needs effectiveness",
    "지오연계":
        "Pairs with Geo",
    "채티필수":
        "Chatty artifact required",
    "컨텐츠/조합에 따라 필요속도가 달라지며 패기 때문에 효적인 안챙김":
        "Required speed varies by content/comp; doesn't need effectiveness due to her passive",
    "컴까기에서 암속탱킹용으로 쓰기 괜찮음":
        "Decent as a Dark-element tank in Computer Grand Hunt",
    "타격속덱 턴스틸용":
        "For striking-speed comps, used to steal turns",
    "탱키하게, 서브디버퍼로 세팅이 나뉨":
        "Tanky build, or splits into sub-debuffer build",
    "턴오기 전에 안뒤져야함":
        "Just don't die before her turn comes",
    "템없으면 파면":
        "Without good gear, Destruction+Immunity",
    "템없으면 파치나 파관":
        "Without good gear, Destruction+Critical or Destruction+Penetration",
    "통수용 속빠른 하르세티, 목적에 따라 딜/디버퍼 세팅이 나뉨":
        "Surprise-pick fast Harsetti — splits into DPS or debuffer by purpose",
    "투신 버프로 능력치 2배라 치치는 한도의 반만 챙김":
        "Stat-doubling buff means CHC/CHD can be stacked at half the usual",
    "파티 조합에 따라 발자를지 유무가 다름":
        "Whether to cut speed depends on team comp",
    "피해분배가 있어서 튼튼하게 맞춰야 함 생활저항or유기인데 생너무 낮으면 저항유기":
        "Has damage redirect, needs to be tanky — HP+Resist or skip resist if HP is too low",
    "하르세티 속도에 따라 세트가 달라짐":
        "Set depends on Harsetti's speed",
    "하르세티용은 발자르고 면역필수":
        "For Harsetti pairing, cut speed and Immunity is required",
    "협공 제외 상황에서 버프 있으면 1스가 전체공격으로 바뀜":
        "When Dual Attack is excluded, buffs make S1 turn into AoE",
    "효저150% 이상":
        "Effect Resistance 150%+",
    "효적 65%만 챙김":
        "Only 65% effectiveness needed",
    "효적은 챙김당함":
        "Effectiveness ends up stacked",
    "효적효저는 챙김당함":
        "Effectiveness and Resistance both end up stacked",
    "효적효저는 최소 100% 이상":
        "At least 100% effectiveness and resistance",
}
