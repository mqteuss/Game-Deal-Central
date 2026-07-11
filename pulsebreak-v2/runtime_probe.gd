extends SceneTree

var frame_count: int = 0
var game: Node
var probe_failed: bool = false

func fail(message: String, code: int) -> void:
	probe_failed = true
	push_error(message)
	quit(code)

func require_game_method(method_name: StringName, code: int) -> bool:
	if game == null or not is_instance_valid(game) or not game.has_method(method_name):
		fail("PULSEBREAK_V2_METHOD_MISSING %s" % String(method_name), code)
		return false
	return true

func _initialize() -> void:
	print("PULSEBREAK_V2_PROBE_START")
	var orientation: int = int(ProjectSettings.get_setting("display/window/handheld/orientation", -1))
	var viewport_width: int = int(ProjectSettings.get_setting("display/window/size/viewport_width", 0))
	var viewport_height: int = int(ProjectSettings.get_setting("display/window/size/viewport_height", 0))
	if orientation != 0:
		fail("PULSEBREAK_V2_NOT_LANDSCAPE orientation=%d" % orientation, 11)
		return
	if viewport_width <= viewport_height:
		fail("PULSEBREAK_V2_INVALID_VIEWPORT %dx%d" % [viewport_width, viewport_height], 12)
		return

	var packed: PackedScene = load("res://main.tscn") as PackedScene
	if packed == null:
		fail("PULSEBREAK_V2_SCENE_LOAD_FAILED", 13)
		return
	game = packed.instantiate()
	root.add_child(game)
	if game.get_script() == null:
		fail("PULSEBREAK_V2_MAIN_SCRIPT_NOT_ATTACHED", 14)
		return
	if not require_game_method(&"reset_game", 15):
		return
	game.set("sound_enabled", false)
	game.call("reset_game")
	print("PULSEBREAK_V2_SCENE_RUNNING viewport=%dx%d" % [viewport_width, viewport_height])

func _process(_delta: float) -> bool:
	if probe_failed:
		return false
	frame_count += 1
	if game == null or not is_instance_valid(game):
		fail("PULSEBREAK_V2_GAME_INSTANCE_LOST", 16)
		return false

	if frame_count == 90:
		if not require_game_method(&"try_overdrive", 17):
			return false
		if not require_game_method(&"spawn_rift_node", 18):
			return false
		game.set("overdrive_meter", 100.0)
		game.call("try_overdrive")
		game.call("spawn_rift_node")
	if frame_count == 180:
		if not require_game_method(&"try_pulse", 19):
			return false
		game.call("try_pulse")
	if frame_count == 300:
		var zones_value: Variant = game.get("zones")
		var obstacles_value: Variant = game.get("obstacles")
		var enemies_value: Variant = game.get("enemies")
		if not zones_value is Array or not obstacles_value is Array or not enemies_value is Array:
			fail("PULSEBREAK_V2_RUNTIME_COLLECTIONS_MISSING", 20)
			return false
		var zones: Array = zones_value as Array
		var obstacles: Array = obstacles_value as Array
		var enemies: Array = enemies_value as Array
		if zones.size() < 4:
			fail("PULSEBREAK_V2_ZONES_MISSING count=%d" % zones.size(), 21)
			return false
		if obstacles.size() < 20:
			fail("PULSEBREAK_V2_WORLD_TOO_EMPTY count=%d" % obstacles.size(), 22)
			return false
		if enemies.is_empty():
			fail("PULSEBREAK_V2_ENEMIES_NOT_SPAWNING", 23)
			return false
		print("PULSEBREAK_V2_SYSTEMS_OK zones=%d obstacles=%d enemies=%d" % [zones.size(), obstacles.size(), enemies.size()])
	if frame_count >= 600:
		print("PULSEBREAK_V2_PROBE_OK frames=%d" % frame_count)
		quit(0)
	return false
