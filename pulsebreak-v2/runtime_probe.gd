extends SceneTree

var frame_count: int = 0
var game: Node

func fail(message: String, code: int) -> void:
	push_error(message)
	quit(code)

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
	game.set("sound_enabled", false)
	game.call("reset_game")
	print("PULSEBREAK_V2_SCENE_RUNNING viewport=%dx%d" % [viewport_width, viewport_height])

func _process(_delta: float) -> bool:
	frame_count += 1
	if game == null or not is_instance_valid(game):
		fail("PULSEBREAK_V2_GAME_INSTANCE_LOST", 14)
		return false

	if frame_count == 90:
		game.set("overdrive_meter", 100.0)
		game.call("try_overdrive")
		game.call("spawn_rift_node")
	if frame_count == 180:
		game.call("try_pulse")
	if frame_count == 300:
		var zones: Array = game.get("zones") as Array
		var obstacles: Array = game.get("obstacles") as Array
		var enemies: Array = game.get("enemies") as Array
		if zones.size() < 4:
			fail("PULSEBREAK_V2_ZONES_MISSING count=%d" % zones.size(), 15)
			return false
		if obstacles.size() < 20:
			fail("PULSEBREAK_V2_WORLD_TOO_EMPTY count=%d" % obstacles.size(), 16)
			return false
		if enemies.is_empty():
			fail("PULSEBREAK_V2_ENEMIES_NOT_SPAWNING", 17)
			return false
		print("PULSEBREAK_V2_SYSTEMS_OK zones=%d obstacles=%d enemies=%d" % [zones.size(), obstacles.size(), enemies.size()])
	if frame_count >= 600:
		print("PULSEBREAK_V2_PROBE_OK frames=%d" % frame_count)
		quit(0)
	return false
