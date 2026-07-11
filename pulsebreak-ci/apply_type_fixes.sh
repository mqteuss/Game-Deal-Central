#!/usr/bin/env bash
set -euo pipefail
file="godot-game/main.gd"

sed -i \
  -e 's/var frames := min(audio_playback.get_frames_available(), int(22050.0 \* min(delta \* 1.8, tone_time)))/var frames: int = mini(audio_playback.get_frames_available(), int(22050.0 * minf(delta * 1.8, tone_time)))/' \
  -e 's/var progress := 1.0 - tone_time \/ max(tone_total, 0.001)/var progress: float = 1.0 - tone_time \/ maxf(tone_total, 0.001)/' \
  -e 's/var enemy_cap := 75 + min(wave \* 5, 75)/var enemy_cap: int = 75 + mini(wave * 5, 75)/' \
  -e 's/var distance := max(to_player.length(), 0.001)/var distance: float = maxf(to_player.length(), 0.001)/' \
  -e 's/var direction := to_player \/ distance/var direction: Vector2 = to_player \/ distance/' \
  -e 's/var factor := clamp((distance - desired) \/ 110.0, -1.0, 1.0)/var factor: float = clampf((distance - desired) \/ 110.0, -1.0, 1.0)/' \
  -e 's/var count := min(multishot, 5)/var count: int = mini(multishot, 5)/' \
  -e 's/var direction := base_dir.rotated(angle)/var direction: Vector2 = base_dir.rotated(angle)/' \
  -e 's/var remove := projectile.life <= 0.0/var remove: bool = projectile.life <= 0.0/' \
  -e 's/var remove := bullet.life <= 0.0/var remove: bool = bullet.life <= 0.0/' \
  -e 's/var final_damage := amount \* (1.0 - clamp(armor, 0.0, 0.55))/var final_damage: float = amount * (1.0 - clampf(armor, 0.0, 0.55))/' \
  -e 's/var bonus := 1.0 + min(combo, 25) \* 0.035/var bonus: float = 1.0 + mini(combo, 25) * 0.035/' \
  -e 's/var total := width \* 3.0 + gap \* 2.0/var total: float = width * 3.0 + gap * 2.0/' \
  -e 's/var x := (view_size.x - total) \* 0.5/var x: float = (view_size.x - total) * 0.5/' \
  -e 's/var t := 1.0 - pulse_visual \/ 0.38/var t: float = 1.0 - pulse_visual \/ 0.38/' \
  -e 's/var radius := lerp(25.0, pulse_radius, ease(t, -1.4))/var radius: float = lerpf(25.0, pulse_radius, ease(t, -1.4))/' \
  -e 's/var alpha := 0.42 if invulnerable/var alpha: float = 0.42 if invulnerable/' \
  -e 's/var hp_width := min(330.0, view_size.x \* 0.26)/var hp_width: float = minf(330.0, view_size.x * 0.26)/' \
  -e 's/var alpha := min(1.0, toast_time \* 2.0)/var alpha: float = minf(1.0, toast_time * 2.0)/' \
  -e 's/var ratio := clamp(cooldown_ratio, 0.0, 1.0)/var ratio: float = clampf(cooldown_ratio, 0.0, 1.0)/' \
  "$file"

echo "PULSEBREAK_TYPE_FIXES_APPLIED"
