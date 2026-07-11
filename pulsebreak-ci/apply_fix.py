from pathlib import Path

# Repair the class-level upgrade initializer that Godot 4.7 rejects at runtime.
path = Path("godot-game/main.gd")
text = path.read_text(encoding="utf-8")
start = text.index("var upgrades := [")
marker = "\n\nfunc _ready() -> void:"
end = text.index(marker, start)
replacement = '''var upgrades: Array[Dictionary] = []

func make_upgrade(id: String, title: String, description: String, tint: Color) -> Dictionary:
\treturn {"id": id, "title": title, "desc": description, "color": tint}

func setup_upgrades() -> void:
\tupgrades.clear()
\tupgrades.append(make_upgrade("damage", "NÚCLEO OFENSIVO", "+24% de dano dos projéteis", RED))
\tupgrades.append(make_upgrade("firerate", "CADÊNCIA VETORIAL", "Dispara 17% mais rápido", CYAN))
\tupgrades.append(make_upgrade("speed", "IMPULSO CINÉTICO", "+12% de velocidade", GREEN))
\tupgrades.append(make_upgrade("maxhp", "BLINDAGEM VIVA", "+25 de vida máxima e cura 25", ORANGE))
\tupgrades.append(make_upgrade("multishot", "FEIXE DUPLO", "Adiciona um projétil lateral", PURPLE))
\tupgrades.append(make_upgrade("pierce", "MUNIÇÃO FÁSICA", "Projéteis atravessam +1 alvo", YELLOW))
\tupgrades.append(make_upgrade("pulse", "RESSONÂNCIA", "Pulso maior, forte e mais frequente", CYAN_SOFT))
\tupgrades.append(make_upgrade("dash", "RUPTURA", "Dash recarrega mais rápido", WHITE))
\tupgrades.append(make_upgrade("magnet", "CAMPO COLETOR", "+45 de alcance para coletar XP", GREEN))
\tupgrades.append(make_upgrade("armor", "MALHA REATIVA", "-10% de dano recebido", MUTED))
\tupgrades.append(make_upgrade("regen", "RECUPERAÇÃO", "Regenera 1,2 de vida por segundo", GREEN))'''
text = text[:start] + replacement + text[end:]
text = text.replace("\trng.randomize()\n", "\trng.randomize()\n\tsetup_upgrades()\n", 1)
path.write_text(text, encoding="utf-8")
print("PULSEBREAK_SOURCE_PATCHED_AND_READY")
